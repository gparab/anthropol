import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: "json" };
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: firebaseConfig.projectId
});

async function main() {
  try {
    const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
    await db.collection('verifications').limit(1).get();
    console.log("Success with getFirestore query!");
  } catch (e) {
    console.error(e);
  }
}
main();
