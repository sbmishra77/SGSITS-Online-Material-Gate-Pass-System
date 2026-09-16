import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    browserLocalPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDDxglyRNOtP7lZLZOr8tPAQqGVvOEnrAQ",
    authDomain: "sgsits-om-gps.firebaseapp.com",
    projectId: "sgsits-om-gps",
    storageBucket: "sgsits-om-gps.firebasestorage.app",
    messagingSenderId: "898892167720",
    appId: "1:898892167720:web:3f17c2f3c7f531f34d31d"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);


export { auth };