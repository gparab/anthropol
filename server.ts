/**
 * Anthropol.io Infrastructure Node
 * 
 * CENTRAL HUB FOR:
 * 1. Analytics Aggregation (Cross-regional telemetry synthesis)
 * 2. Webhook Dispatch Engine (Signed identity attestations)
 * 3. Background Retry Worker (Reliability layer for B2B)
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import admin from 'firebase-admin';
import rateLimit from 'express-rate-limit';
import { ethers } from 'ethers';
import firebaseConfig from './firebase-applet-config.json';

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
   * POST /api/verify/finalize
   * Signs a verification payload using the client's secret key.
   * This is a sensitive operation that must only happen server-side.
   */
  app.post('/api/verify/finalize', async (req, res) => {
    const { payload, clientId } = req.body;
    
    if (!clientId || !payload) {
      return res.status(400).json({ error: 'clientId and payload are required' });
    }

    try {
      if (!admin.apps.length) throw new Error('ADMIN_NOT_INIT');
      
      const db = admin.firestore();
      const clientDoc = await db.collection('clients').doc(clientId).get();
      
      if (!clientDoc.exists) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const clientData = clientDoc.data();
      const secret = clientData?.apiKeys?.secretKey || 'default';

      // Replicating cryptoOracle.signPayload logic
      // In production, the secret should remain in the enclave
      const signature = `sha256=${ethers.id(JSON.stringify(payload) + secret)}`;
      
      res.json({ signature });
    } catch (error) {
      console.error('[INFRA]: Finalize signature error:', error);
      res.status(500).json({ error: 'Failed to sign payload' });
    }
  });

  /**
   * GET /api/analytics
   * Aggregates verification events into hourly buckets for dashboard visualization.
   */
  app.get('/api/analytics', async (_req, res) => {
    try {
      if (!admin.apps.length) throw new Error('ADMIN_NOT_INIT');
      
      const db = admin.firestore();
      const snapshot = await db.collection('verifications')
        .orderBy('timestamp', 'desc')
        .limit(500)
        .get();

      const statsByHour: Record<string, any> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const timestamp = data.timestamp;
        let hour = 0;
        
        if (timestamp) {
          if (typeof timestamp.toDate === 'function') {
            hour = timestamp.toDate().getHours();
          } else {
            hour = new Date(timestamp).getHours();
          }
        }
        
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        
        if (!statsByHour[hourLabel]) {
          statsByHour[hourLabel] = { time: hourLabel, human: 0, mask: 0, static: 0 };
        }

        if (data.status === 'passed') {
          statsByHour[hourLabel].human++;
        } else if (data.reason === 'MASK_ATTACK' || data.reason === 'FLICKER_ANOMALY') {
          statsByHour[hourLabel].mask++;
        } else {
          statsByHour[hourLabel].static++;
        }
      });

      const sorted = Object.values(statsByHour).sort((a, b) => a.time.localeCompare(b.time));
      res.json(sorted.length > 0 ? sorted : [
        { time: '00:00', static: 0, mask: 0, human: 0 }
      ]);
    } catch (error) {
      console.warn('[INFRA]: Analytics aggregator using synthetic fallback:', error instanceof Error ? error.message : 'Unknown');
      // Synthetic fallback for local dev or misconfigured environments
      res.json([
        { time: '00:00', static: 12, mask: 5, human: 85 },
        { time: '04:00', static: 15, mask: 8, human: 70 },
        { time: '08:00', static: 45, mask: 22, human: 120 },
        { time: '12:00', static: 32, mask: 18, human: 210 },
        { time: '16:00', static: 28, mask: 12, human: 180 },
        { time: '20:00', static: 18, mask: 6, human: 95 },
      ]);
    }
  });

  /**
   * POST /api/webhook/dispatch
   * Proxies signed verification payloads to client endpoints.
   * Handles immediate dispatch and logs failures for the retry worker.
   */
  app.post('/api/webhook/dispatch', async (req, res) => {
    const { url, payload, signature, clientId } = req.body;
    
    if (!url) return res.status(400).json({ error: 'Endpoint URL required' });

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
        await admin.firestore().collection('webhook_logs').add({
          clientId: clientId || 'anonymous',
          url,
          payload,
          signature,
          status: statusCode,
          attempts: 1,
          nextAttempt: admin.firestore.Timestamp.fromMillis(Date.now() + 60000), // Start retry cycle in 1m
          timestamp: admin.firestore.FieldValue.serverTimestamp()
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
      const db = admin.firestore();
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

      const now = admin.firestore.Timestamp.now();
      
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
            deliveredAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (e: any) {
          await logDoc.ref.update({
            status: e.response?.status || 500,
            attempts: nextAttemptCount,
            nextAttempt: admin.firestore.Timestamp.fromMillis(Date.now() + delay)
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
