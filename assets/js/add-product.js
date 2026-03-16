// Image Upload Preview 

let uploadedImagesCount = 0;
const maxImages = 6;

function previewImages() {
    const fileInput = document.getElementById('productImage');
    const container = document.getElementById('imagePreviewContainer');
    const files = Array.from(fileInput.files);

    files.forEach(file => {
        if (uploadedImagesCount < maxImages) {
            uploadedImagesCount++;

            const reader = new FileReader();
            reader.onload = function (e) {
                const div = document.createElement('div');
                div.className = 'col-4 position-relative mb-2';
                div.innerHTML = `
                            <div class="glass-input rounded-3 overflow-hidden shadow-sm" style="height: 80px; border: 1px solid rgba(218,85,134,0.3);">
                                <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 10px;" onclick="removeImage(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                container.appendChild(div);
            }
            reader.readAsDataURL(file);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached!',
                text: 'You can only upload a maximum of 6 images.',
                confirmButtonColor: '#da5586'
            });
        }
    });
    fileInput.value = '';
}

function removeImage(btn) {
    btn.parentElement.remove();
    uploadedImagesCount--;
}

function updateCustomizationText() {
    const toggle = document.getElementById('customizationSwitch');
    const label = document.getElementById('customizationLabel');

    if (toggle.checked) {
        label.innerText = "Available";
        label.classList.remove("text-muted");
        label.classList.add("text-pinkie");
    } else {
        label.innerText = "Not Available";
        label.classList.remove("text-pinkie");
        label.classList.add("text-muted");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const productId = urlParams.get('id');

    const pageTitle = document.getElementById('pageTitle');
    const headerTitle = document.getElementById('headerTitle');
    const submitBtn = document.getElementById('submitBtn');

    if (mode === 'edit' && productId) {
        // PRODUCT EDIT MODE
        pageTitle.textContent = 'Pinkie Admin | Edit Product';
        headerTitle.innerHTML = `Edit Jewelry <span class="text-muted fs-6 ms-2">#${productId}</span>`;
        submitBtn.textContent = 'Update Product';

        if (productId === '1001') {
            document.getElementById('productName').value = 'Premium Rose Gold Ring';
            document.getElementById('productPrice').value = '45000';
            document.getElementById('productStock').value = '24';
            document.getElementById('productCategory').value = '1';
            document.getElementById('productMaterial').value = '1';
        }
    } else {
        // PRODCUT ADD MODE (Default)
        pageTitle.textContent = 'Pinkie Admin | Add Product';
        headerTitle.textContent = 'Add New Jewelry';
        submitBtn.textContent = 'Save Product';
    }
});

function saveProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    let alertTitle = 'Product Saved!';
    let alertText = 'The new product has been successfully added to the store.';

    if (mode === 'edit') {
        alertTitle = 'Product Updated!';
        alertText = 'The changes have been successfully saved.';
    }

    Swal.fire({
        icon: 'success',
        title: alertTitle,
        text: alertText,
        confirmButtonColor: '#da5586'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'products.html';
        }
    });
}
