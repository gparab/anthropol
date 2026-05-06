import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: "json" };
admin.initializeApp({ projectId: firebaseConfig.projectId });
console.log(typeof Timestamp, typeof FieldValue);
