import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: "json" };
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({ projectId: firebaseConfig.projectId });

try {
    const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
    console.log("Success with getFirestore!");
} catch (e) {
    console.error(e);
}
