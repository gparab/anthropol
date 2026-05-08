/**
 * Anthropol.io Infrastructure Node
 * 
 * CENTRAL HUB FOR:
 * 1. Analytics Aggregation (Cross-regional telemetry synthesis)
 * 2. Webhook Dispatch Engine (Signed identity attestations)
 * 3. Background Retry Worker (Reliability layer for B2B)
 */

import express from 'express';
import 'dotenv/config';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import rateLimit from 'express-rate-limit';
import { ethers } from 'ethers';
import os from 'os';
import ipaddr from 'ipaddr.js';
import dns from 'node:dns/promises';
import { URL } from 'node:url';
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse,
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import firebaseConfig from './firebase-applet-config.json';

// In-memory challenge store (Session-tied ephemeral cache)
const challengeCache = new Map<string, { challenge: string; expires: number }>();
const CHALLENGE_TTL = 300000; // 5 minutes

// Initialize Firebase Admin with explicit Project ID validation
const initializeAdmin = () => {
  if (admin.apps.length) return admin.app();
  
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
    if (!projectId || projectId === 'your-project-id') {
      console.warn('[INFRA]: Missing FIREBASE_PROJECT_ID. Backend services may be degraded.');
      return null;
    }
    
    return admin.initializeApp({
      projectId: projectId
    });
  } catch (e) {
    console.error('[INFRA]: Firebase Admin initialization fatal error:', e);
    return null;
  }
};

const adminApp = initializeAdmin();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // WebAuthn Config: RP_ID must be the domain, ORIGIN must be the full protocol+domain
  const getWebAuthnConfig = (req: any) => {
    const host = req.get('host') || 'localhost:3000';
    const hostname = host.split(':')[0];
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    return {
      rpID: hostname,
      origin: `${protocol}://${host}`
    };
  };

  // Trust the first proxy (AI Studio Nginx) to ensure rate limiting correctly identifies client IPs
  app.set('trust proxy', 1);

  app.use(express.json());

  // Webhook Security Configuration
  const WEBHOOK_SECRET = process.env.ANTHROPOL_WEBHOOK_SECRET || 'DEMO_FALLBACK_SECRET_INSECURE';
  if (WEBHOOK_SECRET === 'DEMO_FALLBACK_SECRET_INSECURE') {
    console.warn('[SECURITY]: Running with INSECURE webhook secret. Set ANTHROPOL_WEBHOOK_SECRET.');
  }

  // 0. API GATEWAY - DENIAL OF WALLET PROTECTION
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: 'Rate limit exceeded. Protocol protection active.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', apiLimiter);

  /**
   * SECURITY MIDDLEWARE: authenticateToken
   * Verifies the Firebase ID Token provided in the Authorization header.
   */
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'MALFORMED_OR_MISSING_TOKEN' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      if (!admin.apps.length) throw new Error('ADMIN_NOT_INIT');
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('[SECURITY]: Auth Protocol Failure:', error);
      return res.status(401).json({ error: 'IDENTITY_VERIFICATION_EXPIRED' });
    }
  };

  /**
   * SECURITY MIDDLEWARE: requireAdmin
   * Verifies that the authenticated user has an active record in the 'admins' collection.
   */
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED' });
    
    try {
      const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      const adminDoc = await db.collection('admins').doc(req.user.uid).get();
      
      if (!adminDoc.exists || adminDoc.data()?.status !== 'active') {
        return res.status(403).json({ error: 'ADMINISTRATIVE_AUTHORITY_REQUIRED' });
      }
      next();
    } catch (error) {
      console.error('[SECURITY]: Relational Auth check failed:', error);
      return res.status(500).json({ error: 'AUTH_PROTOCOL_FAULT' });
    }
  };

  /**
   * SECURITY HELPER: isSafeUrl
   * Strict SSRF protection layer. Resolve hostnames and blocks sensitive network ranges.
   */
  const isSafeUrl = async (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

      const hostname = url.hostname;
      
      // Resolve hostname to IP addresses
      let addresses: string[] = [];
      try {
        const lookup = await dns.lookup(hostname, { all: true });
        addresses = lookup.map(a => a.address);
      } catch (err) {
        // If dns lookup fails, try parsing as a raw IP
        if (ipaddr.isValid(hostname)) {
          addresses = [hostname];
        } else {
          return false;
        }
      }
      
      for (const address of addresses) {
        if (!ipaddr.isValid(address)) continue;
        
        const addr = ipaddr.parse(address);
        const range = addr.range();

        // BLOCK: loopback, private, link-local, carrier-grade NAT, etc.
        const forbiddenRanges = [
          'loopback',
          'private',
          'linkLocal',
          'carrierGradeNat',
          '6to4',
          'teredo',
          'uniqueLocal',
          'unspecified',
          'reserved'
        ];

        if (forbiddenRanges.includes(range)) {
          console.warn(`[SECURITY]: Webhook SSRF block on forbidden range (${range}): ${address}`);
          return false;
        }

        // Explicit block for metadata endpoints
        if (address === '169.254.169.254') return false;
      }

      return true;
    } catch (e) {
      console.error('[SECURITY]: URL forensic fault:', e);
      return false;
    }
  };

  /**
   * WEBAUTHN PROTOCOL: Nonce Generation
   * GET /api/auth/nonce
   */
  app.get('/api/auth/nonce', async (req, res) => {
    const clientId = req.query.clientId as string;
    if (!clientId) return res.status(400).json({ error: 'ClientId required' });

    const { rpID } = getWebAuthnConfig(req);
    const options = await generateAuthenticationOptions({
      rpID: rpID,
      allowCredentials: [], // Client will provide existing keys
      userVerification: 'required',
    });

    challengeCache.set(clientId, {
      challenge: options.challenge,
      expires: Date.now() + CHALLENGE_TTL
    });

    res.json({ nonce: options.challenge });
  });

  /**
   * WEBAUTHN PROTOCOL: Registration Options
   */
  app.get('/api/auth/register/options', authenticateToken, async (req: any, res) => {
    const user = req.user;
    const { rpID } = getWebAuthnConfig(req);
    const options = await generateRegistrationOptions({
      rpName: 'Anthropol',
      rpID: rpID,
      userID: user.uid,
      userName: user.email || user.uid,
      attestationType: 'direct',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform'
      }
    });

    challengeCache.set(user.uid, {
      challenge: options.challenge,
      expires: Date.now() + CHALLENGE_TTL
    });

    res.json(options);
  });

  /**
   * WEBAUTHN PROTOCOL: Registration Verification
   */
  app.post('/api/auth/register/verify', authenticateToken, async (req: any, res) => {
    const { body } = req;
    const user = req.user;
    const expectedChallenge = challengeCache.get(user.uid);
    const { rpID, origin } = getWebAuthnConfig(req);

    if (!expectedChallenge || expectedChallenge.expires < Date.now()) {
      return res.status(400).json({ error: 'Challenge expired or missing' });
    }

    try {
      const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: expectedChallenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;
        const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);

        const credentialIDStr = typeof credential.id === 'string' ? credential.id : isoBase64URL.fromBuffer(credential.id);
        const publicKeyStr = typeof credential.publicKey === 'string' ? credential.publicKey : isoBase64URL.fromBuffer(credential.publicKey);

        await db.collection('authenticators').doc(credentialIDStr).set({
          userId: user.uid,
          publicKey: publicKeyStr,
          counter: credential.counter,
          fmt: (verification.registrationInfo as any).fmt,
          createdAt: FieldValue.serverTimestamp()
        });

        res.json({ verified: true });
      } else {
        res.status(400).json({ error: 'Verification failed' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error during registration' });
    } finally {
      challengeCache.delete(user.uid);
    }
  });

  /**
   * WEBAUTHN PROTOCOL: Hardware Verification
   * POST /api/verify/hardware
   */
  app.post('/api/verify/hardware', async (req, res) => {
    const { body, clientId, telemetryHash } = req.body;
    const expectedChallenge = challengeCache.get(clientId);
    const { rpID, origin } = getWebAuthnConfig(req);

    if (!expectedChallenge || expectedChallenge.expires < Date.now()) {
      return res.status(400).json({ error: 'Challenge expired or missing' });
    }

    try {
      const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      const authenticatorDoc = await db.collection('authenticators').doc(body.id).get();

      if (!authenticatorDoc.exists) {
        return res.status(404).json({ error: 'Authenticator not registered' });
      }

      const authenticator = authenticatorDoc.data()!;
      
      const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: expectedChallenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: body.id, // v11/v12 expects base64url string for id
          publicKey: isoBase64URL.toBuffer(authenticator.publicKey),
          counter: authenticator.counter,
        },
      });

      if (verification.verified) {
        // Update counter for replay protection
        await authenticatorDoc.ref.update({ counter: verification.authenticationInfo.newCounter });
        
        // Success: Hardware binding confirmed
        res.json({ 
          success: true, 
          attestation: 'HARDWARE_ENCLAVE_VERIFIED',
          telemetryBound: true 
        });
      } else {
        res.status(400).json({ error: 'Hardware signature invalid' });
      }
    } catch (error) {
      console.error('[SECURITY]: Hardware verification failure:', error);
      res.status(500).json({ error: 'Internal verification fault' });
    } finally {
      challengeCache.delete(clientId);
    }
  });
  
  /**
   * POST /api/admin/promote
   * 
   * ADMINISTRATIVE GATEWAY:
   * Securely designates a user as an internal administrator by creating a record
   * in the Firestore 'admins' collection. This shift from Custom Claims to 
   * collection-based logic allows for instantaneous permission changes.
   * 
   * Authorization: Requires a matching ADMIN_SETUP_KEY from the environment.
   */
  app.post('/api/admin/promote', async (req, res) => {
    const { uid, setupKey } = req.body;
    const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY;

    if (!ADMIN_SETUP_KEY || setupKey !== ADMIN_SETUP_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid administrative setup key.' });
    }

    try {
      if (!admin.apps.length) throw new Error('ADMIN_NOT_INIT');
      
      const firestore = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      
      // RELATIONAL ADMIN PRIVILEGE: 
      // Instead of opaque tokens, we use a source-of-truth document.
      await firestore.collection('admins').doc(uid).set({
        promotedAt: FieldValue.serverTimestamp(),
        promotedBy: 'system-setup-key',
        status: 'active'
      });
      
      res.json({ 
        success: true, 
        message: `Administrative authority granted to UID: ${uid}` 
      });
    } catch (error: any) {
      console.error('[SECURITY]: Authority promotion failure:', error);
      res.status(500).json({ 
        error: error.message || 'INTERNAL_SYS_ERROR',
        details: error.code || 'UNKNOWN_CODE'
      });
    }
  });

  /**
   * POST /api/verify/zk
   * Verifies Zero-Knowledge proofs generated by the client.
   */
  app.post('/api/verify/zk', async (req, res) => {
    const { proof, publicSignals } = req.body;

    if (!proof || !publicSignals) {
      return res.status(400).json({ error: 'Proof and publicSignals are required.' });
    }

    try {
      const fs = await import('fs');
      const vKeyPath = path.resolve(process.cwd(), 'public/circuits/verification_key.json');
      const vKey = JSON.parse(fs.readFileSync(vKeyPath, 'utf-8'));

      // @ts-ignore
      const snarkjs = await import('snarkjs');
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

      if (!isValid) {
        return res.status(403).json({ error: 'Mathematical proof rejected. Synthetic signatures detected.' });
      }

      res.json({ success: true, verified: true });
    } catch (error) {
      console.error('[ZK_VERIFIER]: Evaluation fault', error);
      res.status(500).json({ error: 'Internal verification fault' });
    }
  });

  /**
   * POST /api/verify/finalize
   * Signs a verification payload using the client's secret key.
   * [PROTECTED]: requires authenticateToken
   */
  app.post('/api/verify/finalize', authenticateToken, async (req, res) => {
    const { payload, clientId } = req.body;
    
    if (!clientId || !payload) {
      return res.status(400).json({ error: 'clientId and payload are required' });
    }

    try {
      if (!admin.apps.length) throw new Error('ADMIN_NOT_INIT');
      
      const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      
      // KEY ISOLATION: Secrets now reside in a dedicated private document
      const privateDoc = await db.collection('clients').doc(clientId).collection('private').doc('main').get();
      
      if (!privateDoc.exists) {
        // Fallback for legacy records still using the root document
        const clientDoc = await db.collection('clients').doc(clientId).get();
        const secret = clientDoc.data()?.apiKeys?.secretKey || 'default';
        const signature = `sha256=${ethers.id(JSON.stringify(payload) + secret)}`;
        return res.json({ signature });
      }

      const secret = privateDoc.data()?.secretKey || 'default';
      const signature = `sha256=${ethers.id(JSON.stringify(payload) + secret)}`;
      
      res.json({ signature });
    } catch (error) {
      console.error('[INFRA]: Finalize signature error:', error);
      res.status(500).json({ error: 'Failed to sign payload' });
    }
  });

  /**
   * GET /api/system/health
   * Returns real CPU and memory metrics from the host operating system.
   */
  app.get('/api/system/health', (_req, res) => {
    try {
      const cpus = os.cpus();
      const freemem = os.freemem();
      const totalmem = os.totalmem();

      let idleTime = 0;
      let totalTime = 0;
      cpus.forEach((cpu) => {
        for (const type in cpu.times) {
          totalTime += cpu.times[type as keyof typeof cpu.times];
        }
        idleTime += cpu.times.idle;
      });

      const cpuLoad = 100 - Math.round(100 * idleTime / totalTime);
      const memLoad = Math.round(100 * (1 - freemem / totalmem));

      res.json({
        cpu: cpuLoad,
        mem: memLoad,
        freemem,
        totalmem
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch health' });
    }
  });

  /**
   * POST /api/system/lockdown
   * Writes the lockdown flag to the global system document in Firestore.
   * [PROTECTED]: requires authenticateToken + requireAdmin
   */
  app.post('/api/system/lockdown', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!admin.apps.length) throw new Error('ADMIN_NOT_INIT');
      const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      await db.collection('system').doc('global').set({ isLockedDown: true }, { merge: true });
      res.json({ success: true, isLockedDown: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lockdown failed' });
    }
  });

  /**
   * GET /api/system/lockdown
   * Reads the lockdown flag.
   */
  app.get('/api/system/lockdown', async (req, res) => {
    try {
      if (!admin.apps.length) return res.json({ isLockedDown: false });
      const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      const doc = await db.collection('system').doc('global').get();
      res.json({ isLockedDown: doc.data()?.isLockedDown || false });
    } catch (error) {
      res.json({ isLockedDown: false });
    }
  });




  /**
   * POST /api/webhook/dispatch
   * Proxies signed verification payloads to client endpoints.
   * [PROTECTED]: requires authenticateToken + strict SSRF validation
   */
  app.post('/api/webhook/dispatch', authenticateToken, async (req, res) => {
    const { url, payload, signature, clientId } = req.body;
    
    if (!url) return res.status(400).json({ error: 'Endpoint URL required' });

    // SSRF PROTOCOL PROTECTION
    if (!(await isSafeUrl(url))) {
      console.error(`[SECURITY]: Blocked malicious webhook dispatch to: ${url}`);
      return res.status(403).json({ 
        error: 'FORBIDDEN_DESTINATION', 
        details: 'The specified URL violates core security protocols.' 
      });
    }

    try {
      console.log(`[ORACLE-GATEWAY]: Dispatching to ${url} (Client: ${clientId})`);
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Anthropol-Signature': signature || 'unsigned',
          'X-Anthropol-Event': payload.type || 'identity.verified',
          'User-Agent': 'Anthropol-Webhook-Oracle/2.1'
        },
        timeout: 10000
      });

      res.json({ status: response.status, audit: 'delivered' });
    } catch (error: any) {
      const statusCode = error.response?.status || 500;
      console.warn(`[ORACLE-GATEWAY]: Delivery failure at ${url} (${statusCode})`);
      
      // PERSIST FAILURE FOR ASYNC RETRY
      if (admin.apps.length && !req.body.isRetry) {
        await getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId).collection('webhook_logs').add({
          clientId: clientId || 'anonymous',
          url,
          payload,
          signature,
          status: statusCode,
          attempts: 1,
          nextAttempt: Timestamp.fromMillis(Date.now() + 60000), // Start retry cycle in 1m
          timestamp: FieldValue.serverTimestamp()
        });
      }

      res.status(statusCode).json({ error: 'Upstream rejection', retryScheduled: true });
    }
  });

  /**
   * Background Webhook Retry Worker
   * Implements exponential backoff (1m, 5m, 30m, 2h, 6h) for failed deliveries.
   */
  const runWebhookWorker = async () => {
    if (!admin.apps.length) return;
    
    try {
      const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
      // Safety check: Detect if Firestore API is enabled/accessible
      try {
        await db.collection('webhook_logs').limit(1).get();
      } catch (e: any) {
        if (
          e.message?.includes('PERMISSION_DENIED') || 
          e.message?.includes('not been used') || 
          e.code === 5 || 
          e.message?.includes('NOT_FOUND')
        ) {
          return; // Silently skip worker if API or DB is missing in this environment
        }
        throw e;
      }

      const now = Timestamp.now();
      
      const snapshot = await db.collection('webhook_logs')
        .where('status', '>=', 400)
        .where('attempts', '<', 5)
        .where('nextAttempt', '<=', now)
        .limit(20)
        .get();

      if (snapshot.empty) return;

      console.log(`[WORKER]: Processing ${snapshot.size} pending retries...`);

      for (const logDoc of snapshot.docs) {
        const log = logDoc.data();
        const nextAttemptCount = (log.attempts || 0) + 1;
        
        // Protocol-defined backoff: 1m, 5m, 30m, 2h, 6h
        const backoffTable = [60000, 300000, 1800000, 7200000, 21600000];
        const delay = backoffTable[nextAttemptCount - 1] || 21600000;

        try {
          await axios.post(log.url, log.payload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Anthropol-Signature': log.signature,
              'X-Anthropol-Retry': nextAttemptCount.toString()
            },
            timeout: 5000
          });

          await logDoc.ref.update({
            status: 200,
            attempts: nextAttemptCount,
            deliveredAt: FieldValue.serverTimestamp()
          });
        } catch (e: any) {
          await logDoc.ref.update({
            status: e.response?.status || 500,
            attempts: nextAttemptCount,
            nextAttempt: Timestamp.fromMillis(Date.now() + delay)
          });
        }
      }
    } catch (err) {
      console.error('[WORKER]: Critical cycle error:', err);
    }
  };

  // Pulse worker every 60 seconds
  setInterval(runWebhookWorker, 60000);

  // VITE MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFRA]: Anthropol Protocol active at http://localhost:${PORT}`);
  });
}

startServer();
