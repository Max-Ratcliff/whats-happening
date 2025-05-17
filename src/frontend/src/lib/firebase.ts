// frontend/src/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// Import other Firebase services you need, e.g., getStorage

// Your web app's Firebase configuration
// IMPORTANT: Use environment variables for sensitive data like apiKey
const firebaseConfig = {
    apiKey: import.meta.env.FIREBASE_API_KEY,
    authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
// const storage = getStorage(app); // if you use Firebase Storage

// Export the services you'll need in other parts of your app
export { app, auth, db /*, storage */ };