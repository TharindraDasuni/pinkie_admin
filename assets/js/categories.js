// 1. Image Preview Function එක
function previewImage(event) {
    const reader = new FileReader();
    const imageFile = event.target.files[0];

    if (imageFile) {
        reader.onload = function () {
            const preview = document.getElementById('imagePreview');
            const placeholder = document.getElementById('uploadPlaceholder');
            const removeBtn = document.getElementById('removeImageBtn');

            preview.src = reader.result;
            preview.classList.remove('d-none'); // Image එක පෙන්නනවා
            placeholder.classList.add('d-none'); // පරණ අයිකන් එක හංගනවා
            removeBtn.classList.remove('d-none'); // Remove බොත්තම පෙන්නනවා
        }
        reader.readAsDataURL(imageFile);
    }
}

// 2. අලුතින් එකතු කළ Remove Image Function එක
function removeImage(event) {
    // මේක අනිවාර්යයි! මේකෙන් කරන්නේ Remove බොත්තම එබුවම යටින් තියෙන File Upload එක ආයේ ඕපන් වෙන එක නවත්වන එකයි.
    event.stopPropagation();

    const input = document.getElementById('catImage');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');

    // Input එකේ තියෙන ෆයිල් එක මකා දානවා
    input.value = "";
    preview.src = "";

    // UI එක මුල් (පින්තූරයක් නැති) තත්ත්වයට පත් කරනවා
    preview.classList.add('d-none');
    removeBtn.classList.add('d-none');
    placeholder.classList.remove('d-none');
}

// 2. Save Category Logic
async function saveCategory() {
    const name = document.getElementById("catName").value.trim();
    const description = document.getElementById("catDesc").value.trim();
    const imageInput = document.getElementById("catImage");

    // Validations
    if (name === "") {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Category Name is required!' });
        return;
    }
    
    if (imageInput.files.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Please upload a Category Image!' });
        return;
    }

    const imageFile = imageInput.files[0];

    // Form Data එක හැදීම (පින්තූර යවන්න මේක අත්‍යවශ්‍යයි)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", imageFile);

    // Local Storage / Session Storage එකෙන් JWT Token එක ගැනීම
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

    if (!token) {
        Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Please login again!' }).then(() => {
            window.location.href = "index.html";
        });
        return;
    }

    // Loading Alert
    Swal.fire({
        title: 'Saving Category...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const response = await fetch("http://localhost:8080/api/categories/add", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}` 
                // මෙතන Content-Type: application/json දාන්නේ නෑ, Browser එකෙන් Auto 'multipart/form-data' දාගන්නවා.
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Category has been added successfully.'
            }).then(() => {
                loadCategories();
                // Form එක Clear කිරීම
                document.getElementById("addCategoryForm").reset();
                document.getElementById('imagePreview').classList.add('d-none');
                document.getElementById('uploadPlaceholder').classList.remove('d-none');
                document.getElementById('removeImageBtn').classList.add('d-none');
                
                // TODO: Table එක Update කරන්න ඕනේ (පස්සේ හදමු)
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: result.message || 'Error saving category.' });
        }
    } catch (error) {
        console.error("Save Category Error:", error);
        Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Backend server is unreachable.' });
    }
}

// පිටුව Load වෙද්දීම Categories ටික ගන්නවා
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
});

// Categories ටික Backend එකෙන් ගන්න ෆන්ක්ෂන් එක
async function loadCategories() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

    if (!token) return;

    const tableBody = document.getElementById("categoryTableBody");
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i>Loading Categories...</td></tr>`;

    try {
        const response = await fetch("http://localhost:8080/api/categories/all", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const categories = result.data;
            tableBody.innerHTML = ""; // Loading text එක මකා දානවා

            if (categories.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No categories found. Add a new one!</td></tr>`;
                return;
            }

            // එකින් එක Table Row එක හදනවා
            categories.forEach(cat => {
                
                // Status Badge එකේ පාට වෙනස් කරනවා
                let statusBadge = cat.status === "Active" 
                    ? `<span class="badge bg-success bg-opacity-75 rounded-pill px-3 py-2">Active</span>`
                    : `<span class="badge bg-danger bg-opacity-75 rounded-pill px-3 py-2">Inactive</span>`;

                const row = `
                    <tr class="bg-white bg-opacity-50 shadow-sm" style="border-radius: 10px;">
                        <td class="fw-bold text-muted ps-3">${cat.id}</td>
                        <td>
                            <div class="product-img-box glass-input rounded-circle p-1 d-flex align-items-center justify-content-center overflow-hidden" style="width: 45px; height: 45px;">
                                <img src="${cat.imageUrl}" class="w-100 h-100" style="object-fit: cover; opacity: 0.9;">
                            </div>
                        </td>
                        <td>
                            <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${cat.name}</h6>
                            <small class="text-muted" style="font-size: 11px;">${cat.description || 'No description'}</small>
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

        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Error loading categories!</td></tr>`;
        }
    } catch (error) {
        console.error("Load Categories Error:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Backend server is unreachable!</td></tr>`;
    }
}

// 1. Edit බොත්තම එබුවම Modal එකට දත්ත ගෙනැල්ලා පෙන්වීම
async function editCategory(id) {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

    try {
        const response = await fetch(`http://localhost:8080/api/categories/get/${id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const cat = result.data;
            
            // Modal එකේ Inputs වලට දත්ත දැමීම
            document.getElementById("editCatId").value = cat.id;
            document.getElementById("editCatName").value = cat.name;
            document.getElementById("editCatDesc").value = cat.description;
            document.getElementById("editCatStatus").value = cat.status;
            document.getElementById("editImagePreview").src = cat.imageUrl; // පරණ පින්තූරය පෙන්වනවා
            document.getElementById("editCatImage").value = ""; // අලුත් File input එක හිස් කරනවා

            // Bootstrap Modal එක ඕපන් කිරීම
            const editModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
            editModal.show();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch category details.' });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Backend is unreachable.' });
    }
}

// 2. Edit Modal එකේ පින්තූරය මාරු කරද්දී Preview එක වෙනස් කිරීම
function previewEditImage(event) {
    const reader = new FileReader();
    if (event.target.files[0]) {
        reader.onload = function () {
            document.getElementById('editImagePreview').src = reader.result;
        }
        reader.readAsDataURL(event.target.files[0]);
    }
}

// 3. Update කරපු දත්ත Backend එකට යැවීම
async function submitEditCategory() {
    const id = document.getElementById("editCatId").value;
    const name = document.getElementById("editCatName").value.trim();
    const description = document.getElementById("editCatDesc").value.trim();
    const status = document.getElementById("editCatStatus").value;
    const imageInput = document.getElementById("editCatImage");

    if (name === "") {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Category Name is required!' });
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("status", status);
    
    // අලුත් පින්තූරයක් තෝරලා තියෙනවා නම් විතරක් ඒක යවනවා
    if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

    Swal.fire({ title: 'Updating Category...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`http://localhost:8080/api/categories/update/${id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: 'Category has been updated successfully.' })
            .then(() => {
                // Modal එක වහනවා
                const modalElement = document.getElementById('editCategoryModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                // Table එක Auto Refresh කරනවා
                loadCategories(); 
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: result.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Backend is unreachable.' });
    }
}