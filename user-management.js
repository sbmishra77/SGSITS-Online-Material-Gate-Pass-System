/* =========================================
   OM-GPS USER MANAGEMENT
========================================= */

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================
   ELEMENTS
========================================= */

const saveUserButton =
    document.getElementById("saveUserButton");


/* =========================================
   SAVE USER
========================================= */

saveUserButton.addEventListener(
    "click",
    async function () {

        console.log("Add User button clicked");

    }
);