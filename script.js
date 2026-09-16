import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebase-config.js";


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

loginButton.addEventListener("click", function () {

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


    /* =========================
       FIREBASE LOGIN
    ========================= */

    signInWithEmailAndPassword(auth, userId, password)

        .then((userCredential) => {

            console.log(
                "Login successful:",
                userCredential.user.email
            );


            loginMessage.textContent =
                "Login सफल हुआ।";

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

        })


        .catch((error) => {

            console.error(
                "Firebase login error:",
                error.code
            );


            loginMessage.textContent =
                "User ID या Password गलत है।";

            loginMessage.classList.add("error");


            loginButton.disabled = false;

            loginButton.textContent =
                "Login / लॉगिन करें";

        });

});