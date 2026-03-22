let globalTypes = []; // Types ඔක්කොම තියාගන්න Array එකක් (Filter කරන්න ලේසි වෙන්න)

document.addEventListener("DOMContentLoaded", async () => {
    await loadDropdownData();
    loadMaterials();

    // Category එක වෙනස් කරද්දී අදාළ Types ටික විතරක් පෙන්වීමට Event Listeners
    document.getElementById("matCategory").addEventListener("change", function() {
        filterTypesByCategory(this.value, "matType");
    });
    
    document.getElementById("editMatCategory").addEventListener("change", function() {
        filterTypesByCategory(this.value, "editMatType");
    });

    // Search එකට Event Listener එක
    document.getElementById("searchInput").addEventListener("keyup", searchMaterial);
});

// --- 1. Load Categories and Types ---
async function loadDropdownData() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    try {
        // Categories ටික ගන්නවා
        const catRes = await fetch("http://localhost:8080/api/categories/all", { headers: { "Authorization": `Bearer ${token}` } });
        const catData = await catRes.json();
        
        if (catRes.ok && catData.success) {
            const addCatSelect = document.getElementById("matCategory");
            const editCatSelect = document.getElementById("editMatCategory");
            let catOptions = `<option value="" disabled selected>Choose a category...</option>`;
            
            catData.data.forEach(cat => {
                if (cat.status === 'Active') {
                    catOptions += `<option value="${cat.id}">${cat.name}</option>`;
                }
            });
            addCatSelect.innerHTML = catOptions;
            editCatSelect.innerHTML = catOptions;
        }

        // Product Types ටික අරගෙන Global Variable එකේ තියාගන්නවා
        const typeRes = await fetch("http://localhost:8080/api/types/all", { headers: { "Authorization": `Bearer ${token}` } });
        const typeData = await typeRes.json();
        
        if (typeRes.ok && typeData.success) {
            globalTypes = typeData.data.filter(t => t.status === 'Active');
        }

    } catch (error) {
        console.error("Failed to load dropdown data", error);
    }
}

// Category එකට අදාළ Types ටික Dropdown එකට දාන ෆන්ක්ෂන් එක
function filterTypesByCategory(categoryId, typeSelectId, selectedTypeId = "") {
    const typeSelect = document.getElementById(typeSelectId);
    let typeOptions = `<option value="" disabled selected>Choose a type...</option>`;
    
    const filteredTypes = globalTypes.filter(type => type.categoryId === categoryId);
    
    filteredTypes.forEach(type => {
        const isSelected = type.id === selectedTypeId ? "selected" : "";
        typeOptions += `<option value="${type.id}" ${isSelected}>${type.name}</option>`;
    });

    typeSelect.innerHTML = typeOptions;
}

// --- 2. Load Materials Table ---
async function loadMaterials() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    const tableBody = document.getElementById("materialTableBody");
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i>Loading Materials...</td></tr>`;

    try {
        const response = await fetch("http://localhost:8080/api/materials/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const materials = result.data;
            tableBody.innerHTML = ""; 

            if (materials.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No materials found. Add a new one!</td></tr>`;
                return;
            }

            materials.forEach(mat => {
                let statusBadge = mat.status === "Active" 
                    ? `<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Active</span>`
                    : `<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Inactive</span>`;

                const row = `
                    <tr class="bg-white bg-opacity-50 shadow-sm" style="border-radius: 10px;">
                        <td class="ps-3 fw-bold text-muted">${mat.id}</td>
                        <td class="fw-bold text-dark">${mat.name}</td>
                        <td><span class="badge bg-light text-dark border">${mat.categoryName}</span></td>
                        <td><span class="badge bg-light text-dark border">${mat.typeName}</span></td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center pe-3">
                            <button class="btn btn-sm btn-outline-pinkie rounded-circle me-1" onclick="openEditMaterialModal('${mat.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="deleteMaterial('${mat.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Error loading data</td></tr>`;
    }
}

// --- 3. Add New Material ---
async function saveMaterial() {
    const name = document.getElementById("matName").value.trim();
    const catSelect = document.getElementById("matCategory");
    const typeSelect = document.getElementById("matType");

    if (name === "" || catSelect.value === "" || typeSelect.value === "") {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Please fill all the fields!' });
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", catSelect.value);
    formData.append("categoryName", catSelect.options[catSelect.selectedIndex].text);
    formData.append("typeId", typeSelect.value);
    formData.append("typeName", typeSelect.options[typeSelect.selectedIndex].text);

    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    Swal.fire({ title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch("http://localhost:8080/api/materials/add", {
            method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData
        });
        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire('Saved!', 'Material has been added.', 'success').then(() => {
                document.getElementById("addMaterialForm").reset();
                document.getElementById("matType").innerHTML = `<option value="" disabled selected>Choose a type...</option>`; // Type එක Reset කරනවා
                loadMaterials();
            });
        } else {
            Swal.fire('Failed', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Connection failed.', 'error');
    }
}

// --- 4. Edit Material ---
async function openEditMaterialModal(id) {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    try {
        const response = await fetch(`http://localhost:8080/api/materials/get/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const mat = result.data;
            document.getElementById("editMatId").value = mat.id;
            document.getElementById("editMatName").value = mat.name;
            document.getElementById("editMatCategory").value = mat.categoryId;
            document.getElementById("editMatStatus").value = mat.status;

            // Category එකට අදාළව Types ටික පෙන්නලා, පරණ Type එක Select කරනවා
            filterTypesByCategory(mat.categoryId, "editMatType", mat.typeId);

            new bootstrap.Modal(document.getElementById('editMaterialModal')).show();
        }
    } catch (error) {
        Swal.fire('Error', 'Could not fetch data.', 'error');
    }
}

async function updateMaterial() {
    const id = document.getElementById("editMatId").value;
    const name = document.getElementById("editMatName").value.trim();
    const catSelect = document.getElementById("editMatCategory");
    const typeSelect = document.getElementById("editMatType");
    const status = document.getElementById("editMatStatus").value;

    if (name === "" || catSelect.value === "" || typeSelect.value === "") {
        return Swal.fire({ icon: 'warning', title: 'Required', text: 'Please fill all the fields!' });
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", catSelect.value);
    formData.append("categoryName", catSelect.options[catSelect.selectedIndex].text);
    formData.append("typeId", typeSelect.value);
    formData.append("typeName", typeSelect.options[typeSelect.selectedIndex].text);
    formData.append("status", status);

    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`http://localhost:8080/api/materials/update/${id}`, {
            method: "PUT", headers: { "Authorization": `Bearer ${token}` }, body: formData
        });
        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire('Updated!', 'Material updated successfully.', 'success').then(() => {
                bootstrap.Modal.getInstance(document.getElementById('editMaterialModal')).hide();
                loadMaterials();
            });
        } else {
            Swal.fire('Failed', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Connection failed.', 'error');
    }
}

// --- 5. Delete and Search ---
function deleteMaterial(id) {
    Swal.fire({
        title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#da5586', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
            Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(`http://localhost:8080/api/materials/delete/${id}`, {
                    method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire('Deleted!', 'Material has been deleted.', 'success').then(() => loadMaterials());
                } else {
                    Swal.fire('Failed', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Connection failed.', 'error');
            }
        }
    });
}

function searchMaterial() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const tableBody = document.getElementById("materialTableBody");
    const rows = tableBody.getElementsByTagName("tr");
    
    let visibleCount = 0;
    const oldNoResult = document.getElementById("noResultRow");
    if (oldNoResult) oldNoResult.remove();

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].innerText.includes("Loading") || rows[i].innerText.includes("No materials found")) continue;

        const idCol = rows[i].getElementsByTagName("td")[0]; 
        const nameCol = rows[i].getElementsByTagName("td")[1]; // Material Name 
        
        if (idCol || nameCol) {
            const text = (idCol.textContent + " " + nameCol.textContent).toLowerCase();
            if (text.indexOf(input) > -1) {
                rows[i].style.display = "";
                visibleCount++;
            } else {
                rows[i].style.display = "none";
            }
        }
    }

    if (visibleCount === 0 && rows.length > 0 && input !== "") {
        const tr = document.createElement("tr");
        tr.id = "noResultRow";
        tr.innerHTML = `<td colspan="6" class="text-center py-5 text-muted"><i class="fas fa-search-minus fs-1 mb-3 text-pinkie opacity-50"></i><h6 class="fw-bold">No results found</h6></td>`;
        tableBody.appendChild(tr);
    }
}