/* =========================================
   OM-GPS USER MANAGEMENT
========================================= */

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
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

const addDepartmentButton =
    document.getElementById("addDepartmentButton");

const departmentModal =
    document.getElementById("departmentModal");

const closeDepartmentModal =
    document.getElementById("closeDepartmentModal");

const cancelDepartmentButton =
    document.getElementById("cancelDepartmentButton");

const newDepartmentName =
    document.getElementById("newDepartmentName");

const saveDepartmentButton =
    document.getElementById("saveDepartmentButton");

const userDepartment =
    document.getElementById("userDepartment");


/* =========================================
   OPEN DEPARTMENT MODAL
========================================= */

addDepartmentButton.addEventListener(
    "click",
    function () {

        newDepartmentName.value = "";

        departmentModal.style.display = "flex";

        newDepartmentName.focus();

    }
);


/* =========================================
   CLOSE DEPARTMENT MODAL
========================================= */

closeDepartmentModal.addEventListener(
    "click",
    function () {

        departmentModal.style.display = "none";

    }
);


cancelDepartmentButton.addEventListener(
    "click",
    function () {

        departmentModal.style.display = "none";

    }
);


/* =========================================
   CLOSE WHEN CLICKING OUTSIDE
========================================= */

departmentModal.addEventListener(
    "click",
    function (event) {

        if (event.target === departmentModal) {

            departmentModal.style.display = "none";

        }

    }
);

/* =========================================
   LOAD DEPARTMENTS
========================================= */

async function loadDepartments() {

    try {

        const departmentSnapshot =
            await getDocs(
                collection(db, "departments")
            );


        /* Keep default option */

        userDepartment.innerHTML = `
            <option value="">
                -- विभाग चुनें --
            </option>
        `;


        departmentSnapshot.forEach(
            function (departmentDoc) {

                const departmentData =
                    departmentDoc.data();


                if (departmentData.active === true) {

                    const option =
                        document.createElement("option");

                    option.value =
                        departmentData.name;

                    option.textContent =
                        departmentData.name;

                    userDepartment.appendChild(
                        option
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "Department loading error:",
            error
        );

    }

}

/* =========================================
   SAVE DEPARTMENT
========================================= */

saveDepartmentButton.addEventListener(
    "click",
    async function () {

        const departmentName =
            newDepartmentName.value.trim();


        /* =========================
           EMPTY VALIDATION
        ========================== */

        if (departmentName === "") {

            alert(
                "कृपया Department Name दर्ज करें।"
            );

            newDepartmentName.focus();

            return;
        }


        /* =========================
           DISABLE BUTTON
        ========================== */

        saveDepartmentButton.disabled = true;

        saveDepartmentButton.textContent =
            "Saving...";


        try {

            /* =========================
               CHECK DUPLICATE
            ========================== */

            const departmentQuery =
                query(
                    collection(db, "departments"),
                    where("name", "==", departmentName)
                );


            const existingDepartments =
                await getDocs(departmentQuery);


            if (!existingDepartments.empty) {

                alert(
                    "यह Department पहले से मौजूद है।"
                );

                saveDepartmentButton.disabled = false;

                saveDepartmentButton.textContent =
                    "Save Department / विभाग सेव करें";

                return;
            }


            /* =========================
               SAVE TO FIRESTORE
            ========================== */

            await addDoc(
                collection(db, "departments"),
                {
                    name: departmentName,
                    active: true,
                    createdAt: serverTimestamp(),
                    createdBy: auth.currentUser.uid
                }
            );


            /* =========================
               SUCCESS
            ========================== */

            alert(
                "Department सफलतापूर्वक सेव हो गया।"
            );


            /* =========================
               ADD TO DROPDOWN
            ========================== */

            const newOption =
                document.createElement("option");

            newOption.value =
                departmentName;

            newOption.textContent =
                departmentName;

            userDepartment.appendChild(
                newOption
            );


            userDepartment.value =
                departmentName;


            /* =========================
               CLOSE MODAL
            ========================== */

            departmentModal.style.display =
                "none";


            newDepartmentName.value =
                "";


        } catch (error) {

            console.error(
                "Department save error:",
                error
            );


            alert(
                "Department save नहीं हो सका। कृपया Console में error देखें।"
            );

        }


        /* =========================
           ENABLE BUTTON
        ========================== */

        saveDepartmentButton.disabled =
            false;

        saveDepartmentButton.textContent =
            "Save Department / विभाग सेव करें";

    }
);


/* =========================================
   SAVE USER
   TEMPORARY
========================================= */

saveUserButton.addEventListener(
    "click",
    function () {

        console.log(
            "Add User button clicked"
        );

    }
);

/* =========================================
   INITIAL LOAD
========================================= */

loadDepartments();