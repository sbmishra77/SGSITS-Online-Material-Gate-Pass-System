import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    getDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    db,
    auth
} from "./firebase-config.js";


// =========================================
// LOAD ACTIVE DEPARTMENTS
// =========================================

async function loadDepartments() {

    const departmentSelect =
        document.getElementById("departmentSelect");

    try {

        const departmentsQuery = query(
            collection(db, "departments"),
            where("active", "==", true)
        );

        const departmentsSnapshot =
            await getDocs(departmentsQuery);

        departmentsSnapshot.forEach((departmentDoc) => {

            const departmentData =
                departmentDoc.data();

            const option =
                document.createElement("option");

            option.value = departmentDoc.id;

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


// =========================================
// LOAD SECTIONS / LABS
// =========================================

async function loadSectionsLabs() {

    const tableBody =
        document.getElementById(
            "sectionsLabsTableBody"
        );

    const countElement =
        document.getElementById(
            "sectionLabCount"
        );

    const departmentSelect =
        document.getElementById(
            "departmentSelect"
        );


    // Selected Department
    const selectedDepartmentId =
        departmentSelect.value;


    // =========================================
    // NO DEPARTMENT SELECTED
    // =========================================

    if (selectedDepartmentId === "") {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    कृपया पहले Department चुनें।
                </td>
            </tr>
        `;

        countElement.textContent = "0";

        return;
    }


    try {

        // =========================================
        // LOAD DEPARTMENTS
        // =========================================

        const departmentsSnapshot =
            await getDocs(
                collection(db, "departments")
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


        // =========================================
        // LOAD SECTIONS / LABS
        // =========================================

        const sectionsSnapshot =
            await getDocs(
                collection(db, "sectionsLabs")
            );


        tableBody.innerHTML = "";

        let count = 0;


        sectionsSnapshot.forEach(
            (sectionDoc) => {

                const sectionData =
                    sectionDoc.data();


                // =========================================
                // ONLY SELECTED DEPARTMENT
                // =========================================

                if (
                    sectionData.departmentId
                    !== selectedDepartmentId
                ) {

                    return;
                }


                count++;


                const departmentName =
                    departmentMap[
                        sectionData.departmentId
                    ] || "Department not found";


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${count}
                    </td>

                    <td>
                        ${departmentName}
                    </td>

                    <td>
                        ${sectionData.name || ""}
                    </td>

                    <td>

                        ${
                            sectionData.active === true
                                ? "Active"
                                : "Inactive"
                        }

                    </td>

                    <td>

                       <button
    type="button"
    class="user-action-button edit-section-lab-button"
    data-section-lab-id="${sectionDoc.id}">
    Edit
</button>

                        ${
                            sectionData.active === true

                            ? `
                                <button
                                    type="button"
                                    class="user-action-button">
                                    Deactivate
                                </button>
                              `

                            : `
                                <button
                                    type="button"
                                    class="user-action-button">
                                    Activate
                                </button>
                              `
                        }

                    </td>

                `;


                tableBody.appendChild(row);

            }
        );


        // =========================================
        // NO RECORD FOUND
        // =========================================

        if (count === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        इस Department में अभी कोई Section / Lab नहीं है।
                    </td>
                </tr>
            `;

        }


        countElement.textContent = count;


    } catch (error) {

        console.error(
            "Error loading Sections / Labs:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td colspan="5">

                    Sections / Labs load नहीं हो सके।

                </td>

            </tr>

        `;


        countElement.textContent = "0";
    }
}

// =========================================
// SECTION / LAB SUGGESTIONS
// =========================================

const sectionLabNameInput =
    document.getElementById("sectionLabName");

const sectionLabSuggestions =
    document.getElementById("sectionLabSuggestions");


// =========================================
// NORMALIZE TEXT
// =========================================

function normalizeLabName(text) {

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097f]/g, "")
        .trim();
}


// =========================================
// CALCULATE SIMILARITY
// =========================================

function calculateSimilarity(text1, text2) {

    const a = normalizeLabName(text1);
    const b = normalizeLabName(text2);

    if (a === "" || b === "") {
        return 0;
    }

    if (a === b) {
        return 1;
    }

    if (a.includes(b) || b.includes(a)) {
        return 0.90;
    }


    // Levenshtein Distance

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }


    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            if (b.charAt(i - 1) === a.charAt(j - 1)) {

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            } else {

                matrix[i][j] =
                    Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
            }
        }
    }


    const distance =
        matrix[b.length][a.length];

    const maxLength =
        Math.max(a.length, b.length);

    return 1 - (distance / maxLength);
}


// =========================================
// SHOW SUGGESTIONS
// =========================================

sectionLabNameInput.addEventListener(
    "input",
    async function () {

        const typedText =
            sectionLabNameInput.value.trim();

        const selectedDepartmentId =
            document.getElementById(
                "departmentSelect"
            ).value;


        // No department selected

        if (selectedDepartmentId === "") {

            sectionLabSuggestions.style.display =
                "none";

            sectionLabSuggestions.innerHTML =
                "";

            return;
        }


        // Too short

        if (typedText.length < 2) {

            sectionLabSuggestions.style.display =
                "none";

            sectionLabSuggestions.innerHTML =
                "";

            return;
        }


        try {

            const sectionsSnapshot =
                await getDocs(
                    collection(db, "sectionsLabs")
                );


            const matches = [];


            sectionsSnapshot.forEach(
                (sectionDoc) => {

                    const sectionData =
                        sectionDoc.data();


                    // Same Department only

                    if (
                        sectionData.departmentId
                        !== selectedDepartmentId
                    ) {

                        return;
                    }


                    const existingName =
                        sectionData.name || "";


                    const similarity =
                        calculateSimilarity(
                            typedText,
                            existingName
                        );


                    // Similarity threshold

                    if (similarity >= 0.55) {

                        matches.push({

                            name:
                                existingName,

                            similarity:
                                similarity

                        });

                    }

                }
            );


            // Highest similarity first

            matches.sort(
                (a, b) =>
                    b.similarity - a.similarity
            );


            sectionLabSuggestions.innerHTML =
                "";


            if (matches.length === 0) {

                sectionLabSuggestions.style.display =
                    "none";

                return;
            }


            // Maximum 5 suggestions

            matches
                .slice(0, 5)
                .forEach(
                    (match) => {

                        const suggestion =
                            document.createElement(
                                "div"
                            );


                        suggestion.className =
                            "suggestion-item";


                        suggestion.innerHTML = `

                            <div class="suggestion-name">
                                ${match.name}
                            </div>

                            <div class="suggestion-department">
                                Existing Section / Lab
                            </div>

                        `;


                        suggestion.addEventListener(
                            "click",
                            function () {

                                sectionLabNameInput.value =
                                    match.name;

                                sectionLabSuggestions.style.display =
                                    "none";

                            }
                        );


                        sectionLabSuggestions.appendChild(
                            suggestion
                        );

                    }
                );


            sectionLabSuggestions.style.display =
                "block";


        } catch (error) {

            console.error(
                "Error loading suggestions:",
                error
            );

            sectionLabSuggestions.style.display =
                "none";
        }

    }
);


// =========================================
// HIDE SUGGESTIONS WHEN CLICKING OUTSIDE
// =========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !sectionLabNameInput.contains(
                event.target
            )
            &&
            !sectionLabSuggestions.contains(
                event.target
            )
        ) {

            sectionLabSuggestions.style.display =
                "none";
        }

    }
);

// =========================================
// HIDE SUGGESTIONS WHEN CLICKING OUTSIDE
// =========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !sectionLabNameInput.contains(
                event.target
            )
            &&
            !sectionLabSuggestions.contains(
                event.target
            )
        ) {

            sectionLabSuggestions.style.display =
                "none";
        }

    }
);

// =========================================
// ADD SECTION / LAB
// =========================================

const saveSectionLabButton =
    document.getElementById(
        "saveSectionLabButton"
    );

let editingSectionLabId = "";

// =========================================
// EDIT SECTION / LAB
// =========================================

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "edit-section-lab-button"
            )
        ) {
            return;
        }

        const sectionLabId =
            event.target.dataset.sectionLabId;


            editingSectionLabId =
    sectionLabId;


        try {

            const sectionLabRef =
                doc(
                    db,
                    "sectionsLabs",
                    sectionLabId
                );

            const sectionLabSnapshot =
                await getDoc(
                    sectionLabRef
                );

            if (
                !sectionLabSnapshot.exists()
            ) {

                alert(
                    "Section / Lab record नहीं मिला।"
                );

                return;
            }

            const sectionData =
                sectionLabSnapshot.data();

            // Fill Department

            departmentSelect.value =
                sectionData.departmentId || "";

            // Fill Section / Lab Name

            sectionLabName.value =
                sectionData.name || "";

                saveSectionLabButton.textContent =
    "Update Section / Lab / अनुभाग / लैब अपडेट करें";

            alert(
                "Section / Lab का data Edit के लिए load हो गया।"
            );

        } catch (error) {

            console.error(
                "Error loading Section / Lab for edit:",
                error
            );

            alert(
                "Section / Lab data load नहीं हो सका।"
            );
        }

    }
);
    
// =========================================
// ADD SECTION / LAB
// =========================================

saveSectionLabButton.addEventListener(
    "click",
    async function () {

        const departmentSelect =
            document.getElementById(
                "departmentSelect"
            );

        const sectionLabName =
            document.getElementById(
                "sectionLabName"
            );


        const departmentId =
            departmentSelect.value;


        const name =
            sectionLabName.value.trim();


        // =========================================
        // BASIC VALIDATION
        // =========================================

        if (departmentId === "") {

            alert(
                "कृपया Department चुनें।"
            );

            departmentSelect.focus();

            return;
        }


        if (name === "") {

            alert(
                "कृपया Section / Lab Name दर्ज करें।"
            );

            sectionLabName.focus();

            return;
        }


        try {

            saveSectionLabButton.disabled =
                true;

            saveSectionLabButton.textContent =
                "Checking...";


            // =========================================
            // CHECK EXISTING SECTIONS / LABS
            // =========================================

            const sectionsSnapshot =
                await getDocs(
                    collection(db, "sectionsLabs")
                );


            const similarLabs = [];


            sectionsSnapshot.forEach(
                (sectionDoc) => {

                    const sectionData =
                        sectionDoc.data();


                        // Ignore the record currently being edited

if (
    editingSectionLabId !== ""
    &&
    sectionDoc.id === editingSectionLabId
) {

    return;
}

                    // Same Department only

                                      if (
                        sectionData.departmentId
                        !== departmentId
                    ) {

                        return;
                    }


const existingName =
    sectionData.name || "";

const normalizedName =
    name.trim();

const normalizedExistingName =
    existingName.trim();

const similarity =
    calculateSimilarity(
        normalizedName,
        normalizedExistingName
    );

                    if (similarity >= 0.55) {

                        similarLabs.push({

                            name:
                                existingName,

                            similarity:
                                similarity

                        });

                    }

                }
            );


            // =========================================
            // SORT SIMILAR LABS
            // =========================================

            similarLabs.sort(
                (a, b) =>
                    b.similarity - a.similarity
            );


            // =========================================
            // DUPLICATE / SIMILAR WARNING
            // =========================================

            if (similarLabs.length > 0) {

                const bestMatch =
                    similarLabs[0];


                const userConfirmed =
                    confirm(

                        "⚠️ Similar Section / Lab पहले से मौजूद है:\n\n"
                        +
                        bestMatch.name
                        +
                        "\n\n"
                        +
                        "क्या आप फिर भी नया Section / Lab जोड़ना चाहते हैं?"
                    );


                if (!userConfirmed) {

                    saveSectionLabButton.disabled =
                        false;

                    saveSectionLabButton.textContent =
                        "Add Section / Lab / अनुभाग / लैब जोड़ें";

                    return;
                }

            }


            // =========================================
// SAVE / UPDATE SECTION / LAB
// =========================================

saveSectionLabButton.textContent =
    editingSectionLabId !== ""
        ? "Updating..."
        : "Saving...";


if (editingSectionLabId !== "") {

    // UPDATE EXISTING RECORD

    await updateDoc(
        doc(
            db,
            "sectionsLabs",
            editingSectionLabId
        ),
        {

            departmentId:
                departmentId,

            name:
                name,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                auth.currentUser.uid

        }
    );

} else {

    // ADD NEW RECORD

    await addDoc(
        collection(db, "sectionsLabs"),
        {

            departmentId:
                departmentId,

            name:
                name,

            active:
                true,

            createdAt:
                serverTimestamp(),

            createdBy:
                auth.currentUser.uid

        }
    );

}

            if (editingSectionLabId !== "") {

    alert(
        "Section / Lab successfully updated."
    );

} else {

    alert(
        "Section / Lab successfully added."
    );

}


// Exit Edit Mode

editingSectionLabId = "";


// Clear fields

departmentSelect.value = "";

sectionLabName.value = "";

await loadSectionsLabs();

            // Hide suggestions

            sectionLabSuggestions.style.display =
                "none";


        } catch (error) {

            console.error(
                "Error adding Section / Lab:",
                error
            );


            alert(
                "Section / Lab save नहीं हो सका।"
            );


        } finally {

            saveSectionLabButton.disabled =
                false;

            saveSectionLabButton.textContent =
                "Add Section / Lab / अनुभाग / लैब जोड़ें";
        }

    }
);

// =========================================
// DEPARTMENT CHANGE
// =========================================

const departmentSelect =
    document.getElementById(
        "departmentSelect"
    );

departmentSelect.addEventListener(
    "change",
    function () {

        loadSectionsLabs();

    }
);

// =========================================
// INITIAL LOAD
// =========================================

loadDepartments();

loadSectionsLabs();