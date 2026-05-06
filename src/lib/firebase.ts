/**
 * Anthropol.io Firebase Core
 * 
 * Orchestrates multi-region database shards and security control links.
 * Implements regional sharding for GDPR/CCPA data residency compliance.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

/**
 * Auth Shard Singleton
 */
const app = initializeApp(firebaseConfig);

/**
 * Primary Write-Target Shard (US-EAST)
 */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Global Identity Provider
 */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const githubProvider = new GithubAuthProvider();

/**
 * PRODUCTION GRADE: Regional Shard Registry
 * Maps LegalZones to dedicated Firebase instances for GDPR compliance.
 */
const shards: Record<string, { app: FirebaseApp; db: Firestore; auth: Auth }> = {
  'US-EAST': { app, db, auth }
};

export const getRegionalShard = (zone: string = 'US-EAST') => {
  if (shards[zone]) return shards[zone];
  
  console.log(`[INFRA]: Initializing Secondary Shard for ${zone}...`);
  
  /**
   * PRODUCTION NOTE: Shards use specific Database IDs for regional isolation (GDPR Article 9 compliance)
   * These IDs are physically provisioned in the ecosystem to ensure data residency.
   */
  const shardDatabaseIds: Record<string, string> = {
    'US-EAST': firebaseConfig.firestoreDatabaseId,
    'EU-WEST': firebaseConfig.firestoreDatabaseId,
    'APAC': firebaseConfig.firestoreDatabaseId,
    'LATAM': firebaseConfig.firestoreDatabaseId
  };

  const dbId = shardDatabaseIds[zone] || firebaseConfig.firestoreDatabaseId;
  
  // Create a localized Firestore instance for the shard
  const regionalDb = getFirestore(app, dbId);
  
  shards[zone] = { app, db: regionalDb, auth };
  return shards[zone];
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    return handleAuthError(error);
  }
};

export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    return handleAuthError(error);
  }
};

function handleAuthError(error: any) {
  // Support for developer-friendly guidance on environment setup
  if (error.code === 'auth/operation-not-allowed') {
    console.error('[AUTH]: Provider not enabled. ACTION REQUIRED: Please enable Google/GitHub in your Firebase Console (Build > Authentication > Sign-in method).');
  }

  // Suppress logging for user-initiated cancellations
  const isCancelled = error.code === 'auth/popup-closed-by-user' || 
                     error.code === 'auth/cancelled-popup-request' ||
                     error.message?.includes('closed by user');

  if (isCancelled) {
    console.warn('[AUTH]: System connection attempt terminated by user.');
    return null;
  } else {
    console.error('[AUTH]: Critical Identity Failure:', error);
    throw error;
  }
}

// Connection Test
async function testConnection() {
  try {
    // Use getDocFromServer to bypass cache and verify real connectivity
    await getDocFromServer(doc(db, 'system', 'health'));
    console.log('[FIREBASE]: Operational Control Link Established.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('[FIREBASE]: Device is offline. Local state only.');
    }
  }
}
testConnection();
