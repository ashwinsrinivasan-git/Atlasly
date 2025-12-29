// Quick script to check and update user role in Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase config from env
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const USER_EMAIL = 'ashwin.srinivasan.mail@gmail.com';
const USER_UID = 'r9oMW1M8eFehTIIebSBkNOnFkuB2'; // From earlier logs

async function checkAndUpdateRole() {
    try {
        const userRef = doc(db, 'users', USER_UID);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            console.log('Current user data:', {
                email: data.email,
                role: data.role,
                level: data.level,
                displayName: data.displayName
            });

            if (data.role !== 'admin') {
                console.log('\n⚠️  Role is NOT admin, updating...');
                await setDoc(userRef, { role: 'admin' }, { merge: true });
                console.log('✅ Role updated to admin');

                // Verify
                const updated = await getDoc(userRef);
                console.log('Verified role:', updated.data().role);
            } else {
                console.log('\n✅ Role is already admin');
            }
        } else {
            console.log('❌ User document not found');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }

    process.exit(0);
}

checkAndUpdateRole();
