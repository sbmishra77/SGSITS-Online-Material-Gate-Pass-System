import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    db,
    auth
} from "./firebase-config.js";


// =========================================================
// VARIABLES
// =========================================================

let editingResponsibilityId = "";


// =========================================================
// LOAD RESPONSIBILITIES
// =========================================================

async function loadResponsibilities() {

    const tableBody =
        document.getElementById(
            "responsibilitiesTableBody"
        );

    const responsibilityCount =
        document.getElementById(
            "responsibilityCount"
        );

    if (!tableBody) return;

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "systemResponsibilities"
                )
            );

        tableBody.innerHTML = "";

        let count = 0;

        snapshot.forEach(
            (responsibilityDoc) => {

                const data =
                    responsibilityDoc.data();

                count++;

                const row =
                    document.createElement("tr");

                const statusText =
                    data.active === true
                        ? "Active"
                        : "Inactive";

                const statusClass =
                    data.active === true
                        ? "responsibility-status-active"
                        : "responsibility-status-inactive";

                const actionButton =
                    data.active === true
                        ? `
                            <button
                                type="button"
                                class="responsibility-action-button deactivate-responsibility-button"
                                data-responsibility-id="${responsibilityDoc.id}">
                                Deactivate
                            </button>
                          `
                        : `
                            <button
                                type="button"
                                class="responsibility-action-button activate-responsibility-button"
                                data-responsibility-id="${responsibilityDoc.id}">
                                Activate
                            </button>
                          `;

                row.innerHTML = `

                    <td>
                        ${count}
                    </td>

                    <td>
                        ${data.name || ""}
                    </td>

                    <td class="${statusClass}">
                        ${statusText}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="responsibility-action-button edit-responsibility-button"
                            data-responsibility-id="${responsibilityDoc.id}">
                            Edit
                        </button>

                        ${actionButton}

                        <button
                            type="button"
                            class="responsibility-action-button delete-responsibility-button"
                            data-responsibility-id="${responsibilityDoc.id}">
                            Delete
                        </button>

                    </td>

                `;

                tableBody.appendChild(row);

            }
        );

        if (responsibilityCount) {

            responsibilityCount.textContent =
                count;

        }

        if (count === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="responsibility-empty"
                    >
                        कोई System Responsibility उपलब्ध नहीं है।
                    </td>

                </tr>

            `;

        }

    } catch (error) {

        console.error(
            "Error loading System Responsibilities:",
            error
        );

        alert(
            "System Responsibilities load नहीं हो सकीं।"
        );

    }

}


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadResponsibilities();

    }
);


// =========================================================
// ADD / UPDATE RESPONSIBILITY
// =========================================================

const saveResponsibilityButton =
    document.getElementById(
        "saveResponsibilityButton"
    );


if (saveResponsibilityButton) {

    saveResponsibilityButton.addEventListener(
        "click",
        async function () {

            const responsibilityInput =
                document.getElementById(
                    "responsibilityName"
                );

            const responsibilityName =
                responsibilityInput.value.trim();

            if (!responsibilityName) {

                alert(
                    "कृपया Responsibility Name दर्ज करें।"
                );

                return;

            }


            try {

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "systemResponsibilities"
                        )
                    );


                const duplicate =
                    snapshot.docs.some(
                        (responsibilityDoc) => {

                            const data =
                                responsibilityDoc.data();

                            return (
                                data.name
                                    ?.trim()
                                    .toLowerCase()
                                ===
                                responsibilityName
                                    .toLowerCase()
                            );

                        }
                    );


                if (
                    duplicate &&
                    editingResponsibilityId === ""
                ) {

                    alert(
                        "यह System Responsibility पहले से मौजूद है।"
                    );

                    return;

                }


                if (
                    editingResponsibilityId !== ""
                ) {

                    await updateDoc(

                        doc(
                            db,
                            "systemResponsibilities",
                            editingResponsibilityId
                        ),

                        {

                            name:
                                responsibilityName,

                            updatedAt:
                                serverTimestamp(),

                            updatedBy:
                                auth.currentUser.uid

                        }

                    );

                    alert(
                        "System Responsibility successfully updated."
                    );

                } else {

                    await addDoc(

                        collection(
                            db,
                            "systemResponsibilities"
                        ),

                        {

                            name:
                                responsibilityName,

                            active:
                                true,

                            createdAt:
                                serverTimestamp(),

                            createdBy:
                                auth.currentUser.uid

                        }

                    );

                    alert(
                        "System Responsibility successfully added."
                    );

                }


                responsibilityInput.value = "";

                editingResponsibilityId = "";

                saveResponsibilityButton.textContent =
                    "Add Responsibility / जिम्मेदारी जोड़ें";

                await loadResponsibilities();


            } catch (error) {

                console.error(
                    "Error saving System Responsibility:",
                    error
                );

                alert(
                    "System Responsibility save नहीं हो सकी।"
                );

            }

        }
    );

}

// =========================================================
// EDIT RESPONSIBILITY
// =========================================================

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "edit-responsibility-button"
            )
        ) {
            return;
        }


        const responsibilityId =
            event.target.dataset.responsibilityId;


        try {

            const responsibilityRef =
                doc(
                    db,
                    "systemResponsibilities",
                    responsibilityId
                );


            const responsibilitySnapshot =
                await getDocs(
                    collection(
                        db,
                        "systemResponsibilities"
                    )
                );


            const responsibilityDoc =
                responsibilitySnapshot.docs.find(
                    (item) =>
                        item.id === responsibilityId
                );


            if (!responsibilityDoc) {

                alert(
                    "System Responsibility record नहीं मिला।"
                );

                return;

            }


            const responsibilityData =
                responsibilityDoc.data();


            const responsibilityInput =
                document.getElementById(
                    "responsibilityName"
                );


            responsibilityInput.value =
                responsibilityData.name || "";


            editingResponsibilityId =
                responsibilityId;


            saveResponsibilityButton.textContent =
                "Update Responsibility / जिम्मेदारी अपडेट करें";


            responsibilityInput.focus();


        } catch (error) {

            console.error(
                "Error loading Responsibility for edit:",
                error
            );


            alert(
                "System Responsibility data load नहीं हो सका।"
            );

        }

    }
);

// =========================================================
// DEACTIVATE RESPONSIBILITY
// =========================================================

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "deactivate-responsibility-button"
            )
        ) {
            return;
        }

        const responsibilityId =
            event.target.dataset.responsibilityId;

        try {

            await updateDoc(
                doc(
                    db,
                    "systemResponsibilities",
                    responsibilityId
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
                "System Responsibility successfully deactivated."
            );

            await loadResponsibilities();

        } catch (error) {

            console.error(
                "Error deactivating System Responsibility:",
                error
            );

            alert(
                "System Responsibility deactivate नहीं हो सकी।"
            );
        }
    }
);

// =========================================================
// ACTIVATE RESPONSIBILITY
// =========================================================

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "activate-responsibility-button"
            )
        ) {
            return;
        }

        const responsibilityId =
            event.target.dataset.responsibilityId;

        try {

            await updateDoc(
                doc(
                    db,
                    "systemResponsibilities",
                    responsibilityId
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
                "System Responsibility successfully activated."
            );

            await loadResponsibilities();

        } catch (error) {

            console.error(
                "Error activating System Responsibility:",
                error
            );

            alert(
                "System Responsibility activate नहीं हो सकी।"
            );
        }
    }
);

// =========================================================
// DELETE RESPONSIBILITY
// =========================================================

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "delete-responsibility-button"
            )
        ) {
            return;
        }

        const responsibilityId =
            event.target.dataset.responsibilityId;

        const confirmDelete =
            confirm(
                "क्या आप इस System Responsibility को permanently delete करना चाहते हैं?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteDoc(
                doc(
                    db,
                    "systemResponsibilities",
                    responsibilityId
                )
            );

            alert(
                "System Responsibility successfully deleted."
            );

            await loadResponsibilities();

        } catch (error) {

            console.error(
                "Error deleting System Responsibility:",
                error
            );

            alert(
                "System Responsibility delete नहीं हो सकी।"
            );
        }
    }
);