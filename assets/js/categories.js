function previewImage(event, type) {
    const previewId = (type === 'image') ? 'imagePreview' : 'iconPreview';
    triggerCropModal(event, previewId);
}

function previewEditImage(event, type) {
    const previewId = (type === 'image') ? 'editImagePreview' : 'editIconPreview';
    triggerCropModal(event, previewId);
}

function removeImage(event, type) {
    event.stopPropagation();

    let inputId, previewId, placeholderId, removeBtnId;

    if (type === 'image') {
        inputId = 'catImage';
        previewId = 'imagePreview';
        placeholderId = 'uploadPlaceholder';
        removeBtnId = 'removeImageBtn';
    } else {
        inputId = 'catIcon';
        previewId = 'iconPreview';
        placeholderId = 'iconUploadPlaceholder';
        removeBtnId = 'removeIconBtn';
    }

    document.getElementById(inputId).value = "";
    
    const preview = document.getElementById(previewId);
    preview.src = "";
    preview.classList.add('d-none');

    document.getElementById(placeholderId).classList.remove('d-none');
    document.getElementById(removeBtnId).classList.add('d-none');
}

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
});

async function loadCategories() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) return;

    const tableBody = document.getElementById("categoryTableBody");
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i>Loading Categories...</td></tr>`;

    try {
        const response = await fetch("http://localhost:8080/api/categories/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const categories = result.data;
            tableBody.innerHTML = ""; 

            if (categories.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No categories found. Add a new one!</td></tr>`;
                return;
            }

            categories.forEach(cat => {
                let statusBadge = cat.status === "Active" 
                    ? `<span class="badge bg-success bg-opacity-75 rounded-pill px-3 py-2">Active</span>`
                    : `<span class="badge bg-danger bg-opacity-75 rounded-pill px-3 py-2">Inactive</span>`;

                const row = `
                    <tr class="bg-white bg-opacity-50 shadow-sm" style="border-radius: 10px;">
                        <td class="fw-bold text-muted ps-3">${cat.id}</td>
                        <td>
                            <div class="product-img-box glass-input-pink rounded-circle p-1 d-flex align-items-center justify-content-center overflow-hidden" style="width: 45px; height: 45px;">
                                <img src="${cat.imageUrl}" class="w-100 h-100" style="object-fit: cover;">
                            </div>
                        </td>
                        <td>
                            <div class="product-img-box glass-input-pink rounded-circle p-2 d-flex align-items-center justify-content-center overflow-hidden" style="width: 45px; height: 45px; background: rgba(218, 85, 134, 0.05);">
                                <img src="${cat.iconUrl}" class="w-100 h-100" style="object-fit: contain;">
                            </div>
                        </td>
                        <td>
                            <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${cat.name}</h6>
                        </td>
                        <td class="text-center fw-bold text-dark fs-6">${cat.productCount}</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center pe-3">
                            <button class="btn btn-sm btn-light text-primary rounded-circle shadow-sm me-1" onclick="editCategory('${cat.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" onclick="deleteCategory('${cat.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Error loading data</td></tr>`;
    }
}

async function saveCategory() {
    const name = document.getElementById("catName").value.trim();
    const imagePreview = document.getElementById("imagePreview");
    const iconPreview = document.getElementById("iconPreview");

    if (name === "" || imagePreview.classList.contains("d-none") || iconPreview.classList.contains("d-none")) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Please provide Category Name, Image, and Icon!' });
        return;
    }

    Swal.fire({ title: 'Saving Category...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const formData = new FormData();
        formData.append("name", name);

        const imageBlob = await (await fetch(imagePreview.src)).blob();
        formData.append("image", imageBlob, "main_image.png");

        const iconBlob = await (await fetch(iconPreview.src)).blob();
        formData.append("icon", iconBlob, "icon_image.png");

        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

        const response = await fetch("http://localhost:8080/api/categories/add", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({ icon: 'success', title: 'Saved!', text: 'Category added.' }).then(() => {
                document.getElementById("addCategoryForm").reset();
                removeImage(new Event('click'), 'image');
                removeImage(new Event('click'), 'icon');
                loadCategories();
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: result.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed.' });
    }
}

async function editCategory(id) {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    try {
        const response = await fetch(`http://localhost:8080/api/categories/get/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const cat = result.data;
            document.getElementById("editCatId").value = cat.id;
            document.getElementById("editCatName").value = cat.name;
            document.getElementById("editCatStatus").value = cat.status;
            document.getElementById("editImagePreview").src = cat.imageUrl;
            document.getElementById("editIconPreview").src = cat.iconUrl;
            
            document.getElementById("editCatImage").value = "";
            document.getElementById("editCatIcon").value = "";

            new bootstrap.Modal(document.getElementById('editCategoryModal')).show();
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch data.' });
    }
}

function previewEditImage(event, type) {
    const reader = new FileReader();
    
    if (event.target.files[0]) {
        reader.onload = function () {
            if (type === 'image') {
                document.getElementById('editImagePreview').src = reader.result;
            } else if (type === 'icon') {
                document.getElementById('editIconPreview').src = reader.result;
            }
        }
        reader.readAsDataURL(event.target.files[0]);
    }
}

async function submitEditCategory() {
    const id = document.getElementById("editCatId").value;
    const name = document.getElementById("editCatName").value.trim();
    const status = document.getElementById("editCatStatus").value;

    if (name === "") return Swal.fire({ icon: 'warning', title: 'Required', text: 'Category Name is required!' });

    Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("status", status);
        
        const imgPreviewSrc = document.getElementById("editImagePreview").src;
        if (imgPreviewSrc.startsWith("data:") || imgPreviewSrc.startsWith("blob:")) {
            const imgBlob = await (await fetch(imgPreviewSrc)).blob();
            formData.append("image", imgBlob, "updated_image.png");
        }

        const iconPreviewSrc = document.getElementById("editIconPreview").src;
        if (iconPreviewSrc.startsWith("data:") || iconPreviewSrc.startsWith("blob:")) {
            const iconBlob = await (await fetch(iconPreviewSrc)).blob();
            formData.append("icon", iconBlob, "updated_icon.png");
        }

        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

        const response = await fetch(`http://localhost:8080/api/categories/update/${id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: 'Category updated.' }).then(() => {
                bootstrap.Modal.getInstance(document.getElementById('editCategoryModal')).hide();
                loadCategories();
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: result.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed.' });
    }
}

async function deleteCategory(id) {
    
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this category? This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#da5586',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        heightAuto: false
    }).then(async (result) => {
        
        if (result.isConfirmed) {
            const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

            Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(`http://localhost:8080/api/categories/delete/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'The category has been deleted.',
                        confirmButtonColor: '#da5586',
                        heightAuto: false
                    }).then(() => {
                        loadCategories();
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Failed', text: data.message });
                }
            } catch (error) {
                console.error("Delete Error:", error);
                Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Backend server is unreachable.' });
            }
        }
    });
}

function searchCategory() {
    
    const input = document.getElementById("searchInput").value.toLowerCase();
    
    const tableBody = document.getElementById("categoryTableBody");
    const rows = tableBody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        
        const idCol = rows[i].getElementsByTagName("td")[0]; 
        const nameCol = rows[i].getElementsByTagName("td")[2]; 

        if (idCol || nameCol) {
            
            const idText = idCol.textContent || idCol.innerText;
            const nameText = nameCol.textContent || nameCol.innerText;

            if (idText.toLowerCase().indexOf(input) > -1 || nameText.toLowerCase().indexOf(input) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}