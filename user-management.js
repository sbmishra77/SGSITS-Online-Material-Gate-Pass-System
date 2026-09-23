/* =========================================
   OM-GPS USER MANAGEMENT BY Dr. S.B. Mishra
========================================= */

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db,
    userCreationAuth
} from "./firebase-config.js";
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

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


    /* =========================================
   DESIGNATION ELEMENTS
========================================= */

const addDesignationButton =
    document.getElementById("addDesignationButton");

const designationModal =
    document.getElementById("designationModal");

const closeDesignationModal =
    document.getElementById("closeDesignationModal");

const cancelDesignationButton =
    document.getElementById("cancelDesignationButton");

const newDesignationName =
    document.getElementById("newDesignationName");

const saveDesignationButton =
    document.getElementById("saveDesignationButton");

saveDesignationButton.addEventListener("click", async function () {

    const designationName =
        newDesignationName.value.trim();

    const selectedDepartment =
        userDepartment.value;

    if (selectedDepartment === "") {

        alert("पहले Department चुनिए।");
        return;

    }

    if (designationName === "") {

        alert("कृपया Designation Name दर्ज करें।");
        return;

    }

    try {

        await addDoc(
            collection(db, "designations"),
            {
                name: designationName,
                department: selectedDepartment,
                active: true,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser.uid
            }
        );

        alert("Designation successfully saved.");

        designationModal.style.display = "none";

        newDesignationName.value = "";

    } catch (error) {

        console.error("Designation save error:", error);

        alert(
            "ERROR CODE: " + error.code +
            "\n\nERROR MESSAGE: " + error.message
        );

    }

});

addDesignationButton.addEventListener("click", function () {
    designationModal.style.display = "flex";
    newDesignationName.value = "";
    newDesignationName.focus();
});

closeDesignationModal.addEventListener("click", function () {
    designationModal.style.display = "none";
});

cancelDesignationButton.addEventListener("click", function () {
    designationModal.style.display = "none";
});

const newDepartmentName =
    document.getElementById("newDepartmentName");

const saveDepartmentButton =
    document.getElementById("saveDepartmentButton");

const userDepartment =
    document.getElementById("userDepartment");


    const userDesignation =
    document.getElementById("userDesignation");

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

async function loadDesignations() {

    const selectedDepartment =
        userDepartment.value;

    userDesignation.innerHTML = `
        <option value="">
            -- पद चुनें --
        </option>
    `;

    if (selectedDepartment === "") {
        return;
    }

    try {

        const designationQuery = query(
            collection(db, "designations"),
            where(
                "department",
                "==",
                selectedDepartment
            )
        );

        const designationSnapshot =
            await getDocs(designationQuery);

        designationSnapshot.forEach(
            function (designationDoc) {

                const designationData =
                    designationDoc.data();

                if (designationData.active === true) {

                    const option =
                        document.createElement("option");

                    option.value =
                        designationData.name;

                    option.textContent =
                        designationData.name;

                    userDesignation.appendChild(
                        option
                    );
                }

            }
        );

    } catch (error) {

        console.error(
            "Designation loading error:",
            error
        );

    }

}

userDepartment.addEventListener(
    "change",
    function () {
        loadDesignations();
    }
);

loadDesignations();

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
   SAVE / UPDATE USER
========================================= */

saveUserButton.addEventListener(
    "click",
    async function () {

        const editingUserId =
            document.getElementById(
                "editingUserId"
            ).value.trim();


        const userName =
            document.getElementById(
                "userName"
            ).value.trim();


        if (userName === "") {

            alert(
                "कृपया User Name दर्ज करें।"
            );

            return;
        }


        const userEmail =
            document.getElementById(
                "userEmail"
            ).value.trim();


        if (userEmail === "") {

            alert(
                "कृपया User ID / Email दर्ज करें।"
            );

            return;
        }


        if (
            !userEmail
                .toLowerCase()
                .endsWith("@sgsits.ac.in")
        ) {

            alert(
                "कृपया केवल @sgsits.ac.in की official Email ID दर्ज करें।"
            );

            return;
        }


        const selectedDepartment =
            userDepartment.value;


        if (selectedDepartment === "") {

            alert(
                "कृपया Department चुनें।"
            );

            return;
        }


        const selectedDesignation =
            userDesignation.value;


        if (selectedDesignation === "") {

            alert(
                "कृपया Designation चुनें।"
            );

            return;
        }


        const selectedResponsibilities =
            getSelectedResponsibilities();


        if (
            selectedResponsibilities.length === 0
        ) {

            alert(
                "कृपया कम से कम एक System Responsibility चुनें।"
            );

            return;
        }


        /* =========================================
           EDIT EXISTING USER
        ========================================== */

        if (editingUserId !== "") {

            try {

                await updateDoc(
                    doc(
                        db,
                        "users",
                        editingUserId
                    ),
                    {
                        name: userName,
                        department:
                            selectedDepartment,
                        designation:
                            selectedDesignation,
                        responsibilities:
                            selectedResponsibilities,
                        updatedAt:
                            serverTimestamp(),
                        updatedBy:
                            auth.currentUser.uid
                    }
                );


                alert(
                    "User successfully updated."
                );


                /* =========================
                   RESET EDIT MODE
                ========================== */

                document.getElementById(
                    "editingUserId"
                ).value = "";


                document.getElementById(
                    "userFormTitle"
                ).textContent =
                    "Add New User";


                document.getElementById(
                    "saveUserButton"
                ).textContent =
                    "Save User / यूज़र सेव करें";


                document.getElementById(
                    "cancelEditButton"
                ).style.display =
                    "none";


                document.getElementById(
                    "userEmail"
                ).disabled = false;


                document.getElementById(
                    "userName"
                ).value = "";


                document.getElementById(
                    "userEmail"
                ).value = "";


                userDepartment.value = "";


                userDesignation.innerHTML = `
                    <option value="">
                        -- पद चुनें --
                    </option>
                `;


                document
                    .querySelectorAll(
                        'input[name="userResponsibilities"]'
                    )
                    .forEach(
                        function (checkbox) {

                            checkbox.checked = false;

                        }
                    );


                await loadExistingUsers();


                return;


            } catch (error) {

                console.error(
                    "User update error:",
                    error
                );


                alert(
                    "User update नहीं हो पाया।\n\n" +
                    "Error: " +
                    error.message
                );


                return;
            }

        }


        /* =========================================
           CREATE NEW USER
        ========================================== */

        const temporaryPassword =
            generateTemporaryPassword();


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    userCreationAuth,
                    userEmail,
                    temporaryPassword
                );


            console.log(
                "Firebase user created:",
                userCredential.user.uid
            );


            await setDoc(
                doc(
                    db,
                    "users",
                    userCredential.user.uid
                ),
                {
                    name: userName,
                    email: userEmail,
                    department:
                        selectedDepartment,
                    designation:
                        selectedDesignation,
                    responsibilities:
                        selectedResponsibilities,
                    active: true,
                    createdAt:
                        serverTimestamp(),
                    createdBy:
                        auth.currentUser.uid
                }
            );


            alert(
                "User successfully created.\n\n" +
                "Name: " +
                userName +
                "\nEmail: " +
                userEmail +
                "\nDepartment: " +
                selectedDepartment +
                "\nDesignation: " +
                selectedDesignation +
                "\nResponsibilities: " +
                selectedResponsibilities.join(", ") +
                "\n\nTemporary Password: " +
                temporaryPassword
            );


            await loadExistingUsers();


        } catch (error) {

            console.error(
                "Firebase user creation error:",
                error
            );


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                alert(
                    "यह Email ID पहले से Firebase में मौजूद है।\n\n" +
                    "कृपया दूसरी official SGSITS Email ID इस्तेमाल करें।"
                );

            } else {

                alert(
                    "User account create नहीं हो पाया।\n\n" +
                    "Error: " +
                    error.message
                );

            }

            return;
        }

    }
);

/* =========================================
   INITIAL LOAD
========================================= */

loadDepartments();

function getSelectedResponsibilities() {

    const selectedResponsibilities = [];

    const responsibilityCheckboxes =
        document.querySelectorAll(
            'input[name="userResponsibilities"]:checked'
        );

    responsibilityCheckboxes.forEach(function (checkbox) {

        selectedResponsibilities.push(
            checkbox.value
        );

    });

    return selectedResponsibilities;
}

function generateTemporaryPassword() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789";

    let password = "";

    for (let i = 0; i < 10; i++) {

        const randomIndex =
            Math.floor(
                Math.random() * characters.length
            );

        password += characters[randomIndex];
    }

    return password;
}

/* =========================================
   LOAD EXISTING USERS
========================================= */

async function loadExistingUsers() {

    const usersTableBody =
        document.getElementById("usersTableBody");

    const userCount =
        document.getElementById("userCount");

    try {

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );


        /* =========================
           USER COUNT
        ========================== */

        userCount.textContent =
            usersSnapshot.size + " Users";


        /* =========================
           CLEAR OLD ROWS
        ========================== */

        usersTableBody.innerHTML = "";


        /* =========================
           CREATE USER ROWS
        ========================== */

        usersSnapshot.forEach(function (userDoc) {

            const userData =
                userDoc.data();


            /* =========================
               RESPONSIBILITY DISPLAY
            ========================== */

            let responsibilityText = "";


            if (userData.role === "super_admin") {

                responsibilityText =
                    "Super Admin";

            } else if (
                userData.responsibilities &&
                userData.responsibilities.length > 0
            ) {

                responsibilityText =
                    userData.responsibilities
                        .map(function (responsibility) {

                            if (
                                responsibility ===
                                "csc_member"
                            ) {
                                return "CSC Member";
                            }

                            if (
                                responsibility ===
                                "hod"
                            ) {
                                return "HOD";
                            }

                            if (
                                responsibility ===
                                "section_incharge"
                            ) {
                                return "Section In-charge";
                            }

                            if (
                                responsibility ===
                                "csc_chairman"
                            ) {
                                return "CSC Chairman";
                            }

                            if (
                                responsibility ===
                                "registrar"
                            ) {
                                return "Registrar";
                            }

                            if (
                                responsibility ===
                                "dean"
                            ) {
                                return "Dean";
                            }

                            if (
                                responsibility ===
                                "director"
                            ) {
                                return "Director";
                            }

                            if (
                                responsibility ===
                                "warden"
                            ) {
                                return "Warden";
                            }

                            if (
                                responsibility ===
                                "guard"
                            ) {
                                return "Gate Security / Guard";
                            }

                            return responsibility;

                        })
                        .join(", ");

            } else {

                responsibilityText =
                    "-";

            }


            /* =========================
               STATUS
            ========================== */

            let statusText =
                userData.active === true
                    ? "Active"
                    : "Inactive";


            /* =========================
               TABLE ROW
            ========================== */

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${userData.name || "-"}
                </td>

                <td>
                    ${userData.email || "-"}
                </td>

                <td>
                    ${responsibilityText}
                </td>

                <td>
                    ${userData.department || "-"}
                </td>

                <td>
                    ${userData.designation || "-"}
                </td>

                <td>

                    <span class="${
                        userData.active === true
                            ? "status-active"
                            : "status-inactive"
                    }">

                        ${statusText}

                    </span>

                </td>

<td>

    <button
        type="button"
        class="user-action-button edit-user-button"
        data-user-id="${userDoc.id}"
    >
        Edit
    </button>

    <button
        type="button"
        class="user-action-button delete-user-button"
        data-user-id="${userDoc.id}"
    >
        Delete
    </button>

    ${
        userData.active === true
            ? `
                <button
                    type="button"
                    class="user-action-button deactivate-user-button"
                    data-user-id="${userDoc.id}"
                >
                    Deactivate
                </button>
              `
            : `
                <button
                    type="button"
                    class="user-action-button activate-user-button"
                    data-user-id="${userDoc.id}"
                >
                    Activate
                </button>
              `
    }

</td>
            `;


            usersTableBody.appendChild(row);

        });


        console.log(
            "Existing users loaded successfully:",
            usersSnapshot.size
        );


    } catch (error) {

        console.error(
            "Existing users loading error:",
            error
        );

    }

}

loadExistingUsers();

/* =========================================
   EDIT USER - LOAD USER DETAILS
========================================= */

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "edit-user-button"
            )
        ) {
            return;
        }


        const userId =
            event.target.getAttribute(
                "data-user-id"
            );


        try {

            const usersSnapshot =
                await getDocs(
                    collection(db, "users")
                );


            let selectedUser = null;


            usersSnapshot.forEach(
                function (userDoc) {

                    if (userDoc.id === userId) {

                        selectedUser = {
                            id: userDoc.id,
                            data: userDoc.data()
                        };

                    }

                }
            );


            if (!selectedUser) {

                alert(
                    "User record नहीं मिला।"
                );

                return;
            }


            const userData =
                selectedUser.data;


            /* =========================
               FORM TITLE
            ========================== */

            document.getElementById(
                "userFormTitle"
            ).textContent =
                "Edit User";


            /* =========================
               STORE USER ID
            ========================== */

            document.getElementById(
                "editingUserId"
            ).value =
                selectedUser.id;
console.log("EDITING USER UID:", selectedUser.id);

            /* =========================
               BASIC DETAILS
            ========================== */

            document.getElementById(
                "userName"
            ).value =
                userData.name || "";


            document.getElementById(
                "userEmail"
            ).value =
                userData.email || "";


            /* =========================
               EMAIL SHOULD NOT CHANGE
               DURING EDIT
            ========================== */

            document.getElementById(
                "userEmail"
            ).disabled = true;


            /* =========================
               DEPARTMENT
            ========================== */

            const departmentSelect =
                document.getElementById(
                    "userDepartment"
                );


            departmentSelect.value =
                userData.department || "";


            /* =========================
               LOAD DESIGNATIONS
            ========================== */

            await loadDesignations();


            /* =========================
               DESIGNATION
            ========================== */

            document.getElementById(
                "userDesignation"
            ).value =
                userData.designation || "";


            /* =========================
               CLEAR ALL RESPONSIBILITIES
            ========================== */

            const responsibilityCheckboxes =
                document.querySelectorAll(
                    'input[name="userResponsibilities"]'
                );


            responsibilityCheckboxes.forEach(
                function (checkbox) {

                    checkbox.checked = false;

                }
            );


            /* =========================
               SELECT USER RESPONSIBILITIES
            ========================== */

            if (
                userData.responsibilities &&
                userData.responsibilities.length > 0
            ) {

                userData.responsibilities.forEach(
                    function (responsibility) {

                        const checkbox =
                            document.querySelector(
                                'input[name="userResponsibilities"][value="' +
                                responsibility +
                                '"]'
                            );


                        if (checkbox) {

                            checkbox.checked = true;

                        }

                    }
                );

            }


            /* =========================
               SHOW CANCEL BUTTON
            ========================== */

            document.getElementById(
                "cancelEditButton"
            ).style.display =
                "inline-block";


            /* =========================
               CHANGE SAVE BUTTON TEXT
            ========================== */

            document.getElementById(
                "saveUserButton"
            ).textContent =
                "Update User / यूज़र अपडेट करें";


            /* =========================
               SCROLL TO FORM
            ========================== */

            document.getElementById(
                "userFormTitle"
            ).scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        } catch (error) {

            console.error(
                "Edit user loading error:",
                error
            );

            alert(
                "User details load नहीं हो सकीं।\n\n" +
                "Error: " +
                error.message
            );

        }

    }
);

/* =========================================
   DELETE USER - CONFIRMATION ONLY
========================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.classList.contains(
                "delete-user-button"
            )
        ) {
            return;
        }


        const userId =
            event.target.getAttribute(
                "data-user-id"
            );


        const row =
            event.target.closest("tr");


        const userName =
            row.querySelector("td").textContent.trim();


        const confirmDelete =
            confirm(
                "क्या आप इस User को Delete करना चाहते हैं?\n\n" +
                "Name: " +
                userName +
                "\n\n" +
                "अभी कोई data delete नहीं होगा।"
            );


        if (!confirmDelete) {

            return;

        }


        alert(
            "Delete confirmation received for:\n\n" +
            userName +
            "\n\nActual deletion अभी अगली step में बनाया जाएगा।"
        );


        console.log(
            "Delete requested:",
            userId,
            userName
        );

    }
);

/* =========================================
   DEACTIVATE USER
========================================= */

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "deactivate-user-button"
            )
        ) {
            return;
        }


        const userId =
            event.target.getAttribute(
                "data-user-id"
            );


        const row =
            event.target.closest("tr");


        const userName =
            row.querySelector("td").textContent.trim();


        const confirmDeactivate =
            confirm(
                "क्या आप इस User को Deactivate करना चाहते हैं?\n\n" +
                "Name: " +
                userName +
                "\n\n" +
                "User का OM-GPS access बंद किया जाएगा।"
            );


        if (!confirmDeactivate) {

            return;

        }


        try {

            await updateDoc(
                doc(
                    db,
                    "users",
                    userId
                ),
                {
                    active: false,
                    updatedAt:
                        serverTimestamp(),
                    updatedBy:
                        auth.currentUser.uid
                }
            );


            alert(
                "User successfully deactivated."
            );


            await loadExistingUsers();


        } catch (error) {

            console.error(
                "User deactivation error:",
                error
            );


            alert(
                "User deactivate नहीं हो पाया।\n\n" +
                "Error: " +
                error.message
            );

        }

    }
);

/* =========================================
   ACTIVATE USER
========================================= */

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "activate-user-button"
            )
        ) {
            return;
        }


        const userId =
            event.target.getAttribute(
                "data-user-id"
            );


        const row =
            event.target.closest("tr");


        const userName =
            row.querySelector("td").textContent.trim();


        const confirmActivate =
            confirm(
                "क्या आप इस User को फिर से Activate करना चाहते हैं?\n\n" +
                "Name: " +
                userName +
                "\n\n" +
                "User को OM-GPS में फिर से Login करने की अनुमति मिलेगी।"
            );


        if (!confirmActivate) {

            return;

        }


        try {

            await updateDoc(
                doc(
                    db,
                    "users",
                    userId
                ),
                {
                    active: true,
                    updatedAt:
                        serverTimestamp(),
                    updatedBy:
                        auth.currentUser.uid
                }
            );


            alert(
                "User successfully activated."
            );


            await loadExistingUsers();


        } catch (error) {

            console.error(
                "User activation error:",
                error
            );


            alert(
                "User activate नहीं हो पाया।\n\n" +
                "Error: " +
                error.message
            );

        }

    }
);