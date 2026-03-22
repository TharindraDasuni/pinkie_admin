function removeTypeImage(event) {
    event.stopPropagation(); 
    
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').classList.add('d-none');
    
    document.getElementById('uploadPlaceholder').classList.remove('d-none');
    document.getElementById('removeImageBtn').classList.add('d-none');
    
    document.getElementById('typeImage').value = '';
}

document.addEventListener("DOMContentLoaded", async () => {
    // මුලින්ම Dropdowns වලට Categories ටික පුරවනවා
    await loadCategoryDropdowns();
    // ඊටපස්සේ Table එකට Types ටික පුරවනවා
    loadTypes();
});

// --- 1. Load Categories into Dropdowns ---
async function loadCategoryDropdowns() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    try {
        const response = await fetch("http://localhost:8080/api/categories/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const addSelect = document.getElementById("typeCategory");
            const editSelect = document.getElementById("editTypeCategory");
            
            let optionsHtml = `<option value="" disabled selected>Choose a category...</option>`;
            result.data.forEach(cat => {
                // Active Categories විතරක් පෙන්වමු
                if(cat.status === 'Active') {
                    optionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
                }
            });

            addSelect.innerHTML = optionsHtml;
            editSelect.innerHTML = optionsHtml;
        }
    } catch (error) {
        console.error("Failed to load categories for dropdowns");
    }
}

// --- 2. Load Product Types Table ---
async function loadTypes() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    const tableBody = document.getElementById("typeTableBody");
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i>Loading Types...</td></tr>`;

    try {
        const response = await fetch("http://localhost:8080/api/types/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const types = result.data;
            tableBody.innerHTML = ""; 

            if (types.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No product types found. Add a new one!</td></tr>`;
                return;
            }

            types.forEach(type => {
                let statusBadge = type.status === "Active" 
                    ? `<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Active</span>`
                    : `<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Inactive</span>`;

                const row = `
                    <tr>
                        <td class="ps-3 fw-bold text-muted">${type.id}</td>
                        <td><img src="${type.imageUrl}" class="rounded-3 shadow-sm" style="width: 45px; height: 45px; object-fit: cover;"></td>
                        <td class="fw-bold text-dark">${type.name}</td>
                        <td><span class="badge bg-light text-dark border">${type.categoryName}</span></td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center pe-3">
                            <button class="btn btn-sm btn-outline-pinkie rounded-circle me-1" onclick="openEditTypeModal('${type.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="deleteType('${type.id}')"><i class="fas fa-trash"></i></button>
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

// --- 3. Image Remove Logic (Add Form) ---
function removeTypeImage(event) {
    event.stopPropagation();
    document.getElementById('typeImage').value = "";
    document.getElementById('imagePreview').src = "";
    document.getElementById('imagePreview').classList.add('d-none');
    document.getElementById('removeImageBtn').classList.add('d-none');
    document.getElementById('uploadPlaceholder').classList.remove('d-none');
}

// --- 4. Add New Product Type ---
async function saveType() {
    const name = document.getElementById("typeName").value.trim();
    const categorySelect = document.getElementById("typeCategory");
    const categoryId = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex]?.text;
    const imagePreview = document.getElementById("imagePreview");

    if (name === "" || categoryId === "" || imagePreview.classList.contains("d-none")) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Please provide Type Name, Category, and Image!' });
        return;
    }

    Swal.fire({ title: 'Saving Type...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("categoryId", categoryId);
        formData.append("categoryName", categoryName);

        const imageBlob = await (await fetch(imagePreview.src)).blob();
        formData.append("image", imageBlob, "type_image.png");

        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

        const response = await fetch("http://localhost:8080/api/types/add", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({ icon: 'success', title: 'Saved!', text: 'Product Type added.' }).then(() => {
                document.getElementById("addTypeForm").reset();
                removeTypeImage(new Event('click'));
                loadTypes();
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: result.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed.' });
    }
}

// --- 5. Edit & Update Type ---
async function openEditTypeModal(id) {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    try {
        const response = await fetch(`http://localhost:8080/api/types/get/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const type = result.data;
            document.getElementById("editTypeId").value = type.id;
            document.getElementById("editTypeName").value = type.name;
            document.getElementById("editTypeCategory").value = type.categoryId;
            document.getElementById("editTypeStatus").value = type.status;
            document.getElementById("editImagePreview").src = type.imageUrl;
            
            document.getElementById("editTypeImage").value = "";

            new bootstrap.Modal(document.getElementById('editTypeModal')).show();
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch data.' });
    }
}

async function updateType() {
    const id = document.getElementById("editTypeId").value;
    const name = document.getElementById("editTypeName").value.trim();
    const categorySelect = document.getElementById("editTypeCategory");
    const categoryId = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex]?.text;
    const status = document.getElementById("editTypeStatus").value;

    if (name === "" || categoryId === "") return Swal.fire({ icon: 'warning', title: 'Required', text: 'Name and Category are required!' });

    Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("categoryId", categoryId);
        formData.append("categoryName", categoryName);
        formData.append("status", status);
        
        const imgPreviewSrc = document.getElementById("editImagePreview").src;
        if (imgPreviewSrc.startsWith("data:") || imgPreviewSrc.startsWith("blob:")) {
            const imgBlob = await (await fetch(imgPreviewSrc)).blob();
            formData.append("image", imgBlob, "updated_image.png");
        }

        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

        const response = await fetch(`http://localhost:8080/api/types/update/${id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: 'Type updated.' }).then(() => {
                bootstrap.Modal.getInstance(document.getElementById('editTypeModal')).hide();
                loadTypes();
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: result.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed.' });
    }
}

function deleteType(id) {
    Swal.fire({
        title: 'Are you sure?', text: "Do you want to delete this product type?", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#da5586', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
            Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(`http://localhost:8080/api/types/delete/${id}`, {
                    method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire('Deleted!', 'The type has been deleted.', 'success').then(() => loadTypes());
                } else {
                    Swal.fire('Failed', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Connection failed.', 'error');
            }
        }
    });
}

function searchType() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const tableBody = document.getElementById("typeTableBody");
    const rows = tableBody.getElementsByTagName("tr");
    
    let visibleCount = 0;

    const oldNoResult = document.getElementById("noResultRow");
    if (oldNoResult) oldNoResult.remove();

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].innerText.includes("Loading") || rows[i].innerText.includes("No product types found")) continue;

        const idCol = rows[i].getElementsByTagName("td")[0]; 
        const nameCol = rows[i].getElementsByTagName("td")[2]; 
        
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
        tr.innerHTML = `
            <td colspan="6" class="text-center py-5 text-muted">
                <i class="fas fa-search-minus fs-1 mb-3 text-pinkie opacity-50"></i>
                <h6 class="fw-bold">No results found</h6>
                <p class="mb-0" style="font-size: 13px;">We couldn't find anything matching "<b>${document.getElementById("searchInput").value}</b>"</p>
            </td>
        `;
        tableBody.appendChild(tr);
    }
}