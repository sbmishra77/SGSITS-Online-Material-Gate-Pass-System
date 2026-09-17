import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================
   PASSWORD SHOW / HIDE
========================= */

const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        passwordToggle.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        passwordToggle.textContent = "👁️";

    }

});


/* =========================
   LOGIN ELEMENTS
========================= */

const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const userIdInput = document.getElementById("userId");


/* =========================
   LOGIN BUTTON
========================= */

loginButton.addEventListener("click", async function () {

    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();


    /* Reset message */

    loginMessage.className = "login-message";
    loginMessage.textContent = "";


    /* =========================
       EMPTY FIELD VALIDATION
    ========================= */

    if (userId === "" && password === "") {

        loginMessage.textContent =
            "कृपया User ID और Password दर्ज करें।";

        loginMessage.classList.add("error");

        return;
    }


    if (userId === "") {

        loginMessage.textContent =
            "कृपया User ID दर्ज करें।";

        loginMessage.classList.add("error");

        return;
    }


    if (password === "") {

        loginMessage.textContent =
            "कृपया Password दर्ज करें।";

        loginMessage.classList.add("error");

        return;
    }


    /* =========================
       DISABLE LOGIN BUTTON
    ========================= */

    loginButton.disabled = true;
    loginButton.textContent = "Login हो रहा है...";


    try {

        /* =========================
           FIREBASE AUTH LOGIN
        ========================= */

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                userId,
                password
            );


        const user = userCredential.user;


        console.log(
            "Authentication successful:",
            user.email
        );


        /* =========================
           FIRESTORE USER PROFILE
        ========================= */

        const userDocRef =
            doc(db, "users", user.uid);

        const userDoc =
            await getDoc(userDocRef);


        /* =========================
           CHECK USER PROFILE
        ========================= */

        if (!userDoc.exists()) {

            loginMessage.textContent =
                "User profile नहीं मिला। कृपया Administrator से संपर्क करें।";

            loginMessage.classList.add("error");

            loginButton.disabled = false;
            loginButton.textContent =
                "Login / लॉगिन करें";

            return;
        }


        /* =========================
           GET USER DATA
        ========================= */

        const userData =
            userDoc.data();


        console.log(
            "Firestore profile:",
            userData
        );


        console.log(
            "User role:",
            userData.role
        );


        /* =========================
           LOGIN SUCCESS
        ========================= */

        loginMessage.textContent =
    "Login सफल हुआ | " +
    userData.name +
    " | Role: " +
    userData.role;

loginMessage.classList.add("success");

        loginButton.textContent =
            "Login Successful ✓";


        /* =========================
           GO TO DASHBOARD
        ========================= */

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 800);


    } catch (error) {

        console.error(
            "Login / Firestore error:",
            error
        );


        /* =========================
           ERROR MESSAGE
        ========================= */

        loginMessage.textContent =
            "User ID या Password गलत है।";

        loginMessage.classList.add("error");


        loginButton.disabled = false;

        loginButton.textContent =
            "Login / लॉगिन करें";

    }

});