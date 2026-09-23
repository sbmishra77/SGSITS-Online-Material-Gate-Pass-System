import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    db,
    auth
} from "./firebase-config.js";

const departmentCount = document.getElementById("departmentCount");
const departmentsTableBody = document.getElementById("departmentsTableBody");
const departmentName = document.getElementById("departmentName");
const saveDepartmentButton = document.getElementById("saveDepartmentButton");


// =========================================
// LOAD DEPARTMENTS
// =========================================
async function loadDepartments() {

    try {

        const departmentsSnapshot =
            await getDocs(collection(db, "departments"));

        departmentsTableBody.innerHTML = "";

        let count = 0;

        departmentsSnapshot.forEach((departmentDoc) => {

            const departmentData = departmentDoc.data();

            count++;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${count}</td>

                <td>${departmentData.name || ""}</td>

                <td>
                    ${
                        departmentData.active === true
                            ? `<span class="status-badge active-status">Active</span>`
                            : `<span class="status-badge inactive-status">Inactive</span>`
                    }
                </td>

                <td>

                    <button
                        type="button"
                        class="user-action-button edit-department-button"
                        data-department-id="${departmentDoc.id}"
                        data-department-name="${departmentData.name || ""}">
                        Edit
                    </button>

                    ${
                        departmentData.active === true

                        ? `
                            <button
                                type="button"
                                class="user-action-button deactivate-department-button"
                                data-department-id="${departmentDoc.id}">
                                Deactivate
                            </button>
                          `

                        : `
                            <button
                                type="button"
                                class="user-action-button activate-department-button"
                                data-department-id="${departmentDoc.id}">
                                Activate
                            </button>
                          `
                    }

                </td>
            `;

            departmentsTableBody.appendChild(row);

        });

        departmentCount.textContent = count;

    } catch (error) {

        console.error("Error loading departments:", error);

        departmentsTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Departments load नहीं हो सके।
                </td>
            </tr>
        `;

        departmentCount.textContent = "0";
    }
}


// =========================================
// ADD DEPARTMENT
// =========================================
saveDepartmentButton.addEventListener("click", async function () {

    const name = departmentName.value.trim();

    if (name === "") {

        alert("कृपया Department Name दर्ज करें।");

        departmentName.focus();

        return;
    }

    try {

        saveDepartmentButton.disabled = true;

        saveDepartmentButton.textContent = "Saving...";

        await addDoc(collection(db, "departments"), {

            name: name,

            active: true,

            createdAt: serverTimestamp(),

            createdBy: auth.currentUser.uid

        });

        alert("Department successfully added.");

        departmentName.value = "";

        await loadDepartments();

    } catch (error) {

        console.error("Error adding department:", error);

        alert("Department save नहीं हो सका।");

    } finally {

        saveDepartmentButton.disabled = false;

        saveDepartmentButton.textContent =
            "Add Department / विभाग जोड़ें";
    }

});


// =========================================
// EDIT DEPARTMENT
// =========================================
document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("edit-department-button")) {
        return;
    }

    const departmentId =
        event.target.getAttribute("data-department-id");

    const oldName =
        event.target.getAttribute("data-department-name");

    const newName =
        prompt("Department Name बदलें:", oldName);

    if (newName === null) {
        return;
    }

    const trimmedName = newName.trim();

    if (trimmedName === "") {

        alert("Department Name खाली नहीं हो सकता।");

        return;
    }

    try {

        await updateDoc(
            doc(db, "departments", departmentId),
            {
                name: trimmedName,
                updatedAt: serverTimestamp(),
                updatedBy: auth.currentUser.uid
            }
        );

        alert("Department successfully updated.");

        await loadDepartments();

    } catch (error) {

        console.error("Error updating department:", error);

        alert("Department update नहीं हो सका।");
    }

});


// =========================================
// DEACTIVATE DEPARTMENT
// =========================================
document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("deactivate-department-button")) {
        return;
    }

    const departmentId =
        event.target.getAttribute("data-department-id");

    const row = event.target.closest("tr");

    const departmentNameText =
        row.querySelectorAll("td")[1].textContent.trim();

    const confirmed = confirm(
        `"${departmentNameText}" को Deactivate करना है?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await updateDoc(
            doc(db, "departments", departmentId),
            {
                active: false,
                updatedAt: serverTimestamp(),
                updatedBy: auth.currentUser.uid
            }
        );

        alert("Department successfully deactivated.");

        await loadDepartments();

    } catch (error) {

        console.error("Error deactivating department:", error);

        alert("Department deactivate नहीं हो सका।");
    }

});


// =========================================
// ACTIVATE DEPARTMENT
// =========================================
document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("activate-department-button")) {
        return;
    }

    const departmentId =
        event.target.getAttribute("data-department-id");

    try {

        await updateDoc(
            doc(db, "departments", departmentId),
            {
                active: true,
                updatedAt: serverTimestamp(),
                updatedBy: auth.currentUser.uid
            }
        );

        alert("Department successfully activated.");

        await loadDepartments();

    } catch (error) {

        console.error("Error activating department:", error);

        alert("Department activate नहीं हो सका।");
    }

});


// =========================================
// INITIAL LOAD
// =========================================
loadDepartments();