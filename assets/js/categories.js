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