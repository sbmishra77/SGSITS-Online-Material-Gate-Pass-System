import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    serverTimestamp,
    getDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    db,
    auth
} from "./firebase-config.js";


/* =========================================================
   LOAD DEPARTMENTS
   ========================================================= */

async function loadDepartments() {

    const departmentSelect =
        document.getElementById(
            "designationDepartmentSelect"
        );

    if (!departmentSelect) {
        return;
    }

    try {

        const departmentsQuery =
            query(
                collection(db, "departments"),
                where("active", "==", true)
            );

        const snapshot =
            await getDocs(departmentsQuery);


        /* Keep default option */

        departmentSelect.innerHTML = `
            <option value="">
                -- Department चुनें --
            </option>
        `;


        snapshot.forEach((departmentDoc) => {

            const departmentData =
                departmentDoc.data();

            const option =
                document.createElement("option");

            option.value =
                departmentDoc.id;

            option.textContent =
                departmentData.name || "";

            departmentSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Error loading departments:",
            error
        );

        alert(
            "Departments load नहीं हो सके।"
        );
    }
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDepartments();

    }
);

/* =========================================================
   ADD / SAVE DESIGNATION
   ========================================================= */

const saveDesignationButton =
    document.getElementById(
        "saveDesignationButton"
    );

    let editingDesignationId = "";


saveDesignationButton.addEventListener(
    "click",
    async function () {

        const departmentSelect =
            document.getElementById(
                "designationDepartmentSelect"
            );

        const designationNameInput =
            document.getElementById(
                "designationName"
            );


        const departmentId =
            departmentSelect.value;

        const designationName =
            designationNameInput.value.trim();


        /* -------------------------------------------------
           VALIDATION
           ------------------------------------------------- */

        if (departmentId === "") {

            alert(
                "कृपया Department चुनें।"
            );

            departmentSelect.focus();

            return;
        }


        if (designationName === "") {

            alert(
                "कृपया Designation / पदनाम दर्ज करें।"
            );

            designationNameInput.focus();

            return;
        }


        try {

            saveDesignationButton.disabled = true;

            saveDesignationButton.textContent =
                "Saving...";


            /* -------------------------------------------------
               CHECK EXISTING DESIGNATIONS
               Same Department
               ------------------------------------------------- */

            const designationsSnapshot =
                await getDocs(
                    collection(
                        db,
                        "designations"
                    )
                );


            let duplicateFound = false;


            designationsSnapshot.forEach(
                (designationDoc) => {

                    const designationData =
                        designationDoc.data();


                    if (
                        designationData.departmentId
                        === departmentId
                        &&
                        (
                            designationData.name || ""
                        )
                        .trim()
                        .toLowerCase()
                        ===
                        designationName
                            .trim()
                            .toLowerCase()
                    ) {

                        duplicateFound = true;

                    }

                }
            );


            /* -------------------------------------------------
               DUPLICATE WARNING
               ------------------------------------------------- */

            if (duplicateFound) {

                alert(
                    "यह Designation इस Department में पहले से मौजूद है।"
                );

                saveDesignationButton.disabled =
                    false;

                saveDesignationButton.textContent =
                    "Add Designation / पदनाम जोड़ें";

                return;
            }


/* -------------------------------------------------
   SAVE / UPDATE TO FIRESTORE
   ------------------------------------------------- */

if (editingDesignationId !== "") {

    /* =============================================
       UPDATE EXISTING DESIGNATION
       ============================================= */

    await updateDoc(
        doc(
            db,
            "designations",
            editingDesignationId
        ),
        {
            departmentId:
                departmentId,

            name:
                designationName,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                auth.currentUser.uid
        }
    );


    alert(
        "Designation successfully updated."
    );

} else {

    /* =============================================
       ADD NEW DESIGNATION
       ============================================= */

    await addDoc(
        collection(
            db,
            "designations"
        ),
        {
            departmentId:
                departmentId,

            name:
                designationName,

            active:
                true,

            createdAt:
                serverTimestamp(),

            createdBy:
                auth.currentUser.uid
        }
    );


    alert(
        "Designation successfully added."
    );

}
            /* -------------------------------------------------
               CLEAR FORM
               ------------------------------------------------- */

            designationNameInput.value = "";

            departmentSelect.value = "";


            editingDesignationId = "";

saveDesignationButton.textContent =
    "Add Designation / पदनाम जोड़ें";

await loadDesignations();

        } catch (error) {

            console.error(
                "Error adding Designation:",
                error
            );

            alert(
                "Designation save नहीं हो सका।"
            );

        } finally {

            saveDesignationButton.disabled =
                false;

            saveDesignationButton.textContent =
                "Add Designation / पदनाम जोड़ें";

        }

    }
);

/* =========================================================
   LOAD EXISTING DESIGNATIONS
   ========================================================= */

async function loadDesignations() {

    const tableBody =
        document.getElementById(
            "designationsTableBody"
        );

    const designationCount =
        document.getElementById(
            "designationCount"
        );


    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Loading...
                </td>
            </tr>
        `;


        /* -------------------------------------------------
           LOAD DEPARTMENTS
           ------------------------------------------------- */

        const departmentsSnapshot =
            await getDocs(
                collection(
                    db,
                    "departments"
                )
            );


        const departmentMap = {};


        departmentsSnapshot.forEach(
            (departmentDoc) => {

                const departmentData =
                    departmentDoc.data();

                departmentMap[
                    departmentDoc.id
                ] =
                    departmentData.name || "";

            }
        );


        /* -------------------------------------------------
           LOAD DESIGNATIONS
           ------------------------------------------------- */

        const designationsSnapshot =
            await getDocs(
                collection(
                    db,
                    "designations"
                )
            );


        tableBody.innerHTML = "";


        let serialNumber = 0;


        designationsSnapshot.forEach(
            (designationDoc) => {

                const designationData =
                    designationDoc.data();


                serialNumber++;


                const departmentName =
    departmentMap[
        designationData.departmentId
    ]
    ||
    designationData.department
    ||
    "Department not found";


                const status =
                    designationData.active === true
                    ? "Active"
                    : "Inactive";


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${serialNumber}
                    </td>

                    <td>
                        ${departmentName}
                    </td>

                    <td>
                        ${designationData.name || ""}
                    </td>

                    <td>
                        <span
                            style="
                                color:
                                ${
                                    designationData.active === true
                                    ? "#008a3c"
                                    : "#a00000"
                                };

                                font-weight: 700;
                            ">

                            ${status}

                        </span>
                    </td>

                    <td>

                        <button
    type="button"
    class="user-action-button edit-designation-button"
    data-designation-id="${designationDoc.id}">

    Edit

</button>

                        ${
    designationData.active === true

    ? `
        <button
            type="button"
            class="user-action-button deactivate-designation-button"
            data-designation-id="${designationDoc.id}">

            Deactivate

        </button>
      `

    : `
        <button
            type="button"
            class="user-action-button activate-designation-button"
            data-designation-id="${designationDoc.id}">

            Activate

        </button>
      `
}



                        <button
                            type="button"
                            class="user-action-button">

                            Delete

                        </button>

                    </td>
                `;


                tableBody.appendChild(row);

            }
        );


        designationCount.textContent =
            serialNumber;


        /* -------------------------------------------------
           NO RECORDS
           ------------------------------------------------- */

        if (serialNumber === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        style="text-align:center;">

                        इस समय कोई Designation उपलब्ध नहीं है।

                    </td>
                </tr>
            `;

        }


    } catch (error) {

        console.error(
            "Error loading Designations:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="text-align:center;">

                    Designations load नहीं हो सके।

                </td>
            </tr>
        `;

    }

}


/* =========================================================
   LOAD DESIGNATIONS ON PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDesignations();

    }
);

/* =========================================================
   EDIT DESIGNATION - LOAD DATA INTO FORM
   ========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "edit-designation-button"
            )
        ) {
            return;
        }


        const designationId =
            event.target.dataset.designationId;


        editingDesignationId =
            designationId;


        try {

            const designationRef =
                doc(
                    db,
                    "designations",
                    designationId
                );


            const designationSnapshot =
                await getDoc(
                    designationRef
                );


            if (
                !designationSnapshot.exists()
            ) {

                alert(
                    "Designation record नहीं मिला।"
                );

                editingDesignationId = "";

                return;
            }


            const designationData =
                designationSnapshot.data();


            /* -------------------------------------------------
               LOAD DEPARTMENT
               ------------------------------------------------- */

            const departmentSelect =
                document.getElementById(
                    "designationDepartmentSelect"
                );


            departmentSelect.value =
                designationData.departmentId || "";


            /* -------------------------------------------------
               OLD RECORD SUPPORT
               ------------------------------------------------- */

            if (
                !designationData.departmentId
                &&
                designationData.department
            ) {

                const departmentsSnapshot =
                    await getDocs(
                        collection(
                            db,
                            "departments"
                        )
                    );


                departmentsSnapshot.forEach(
                    (departmentDoc) => {

                        const departmentData =
                            departmentDoc.data();


                        if (
                            departmentData.name
                            ===
                            designationData.department
                        ) {

                            departmentSelect.value =
                                departmentDoc.id;

                        }

                    }
                );

            }


            /* -------------------------------------------------
               LOAD DESIGNATION NAME
               ------------------------------------------------- */

            const designationNameInput =
                document.getElementById(
                    "designationName"
                );


            designationNameInput.value =
                designationData.name || "";


            /* -------------------------------------------------
               CHANGE BUTTON TO UPDATE
               ------------------------------------------------- */

            saveDesignationButton.textContent =
                "Update Designation / पदनाम अपडेट करें";


            alert(
                "Designation का data Edit के लिए load हो गया।"
            );


        } catch (error) {

            console.error(
                "Error loading Designation for edit:",
                error
            );


            alert(
                "Designation data load नहीं हो सका।"
            );

        }

    }
);

/* =========================================================
   DEACTIVATE DESIGNATION
   ========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "deactivate-designation-button"
            )
        ) {
            return;
        }

        const designationId =
            event.target.dataset.designationId;

        try {

            await updateDoc(
                doc(
                    db,
                    "designations",
                    designationId
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
                "Designation successfully deactivated."
            );

            await loadDesignations();

        } catch (error) {

            console.error(
                "Error deactivating Designation:",
                error
            );

            alert(
                "Designation deactivate नहीं हो सका।"
            );
        }
    }
);

/* =========================================================
   ACTIVATE DESIGNATION
   ========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "activate-designation-button"
            )
        ) {
            return;
        }

        const designationId =
            event.target.dataset.designationId;

        try {

            await updateDoc(
                doc(
                    db,
                    "designations",
                    designationId
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
                "Designation successfully activated."
            );

            await loadDesignations();

        } catch (error) {

            console.error(
                "Error activating Designation:",
                error
            );

            alert(
                "Designation activate नहीं हो सका।"
            );
        }
    }
);