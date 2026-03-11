// Image Upload Preview Logic
        let uploadedImagesCount = 0;
        const maxImages = 6;

        function previewImages() {
            const fileInput = document.getElementById('productImage');
            const container = document.getElementById('imagePreviewContainer');
            const files = Array.from(fileInput.files);

            files.forEach(file => {
                if(uploadedImagesCount < maxImages) {
                    uploadedImagesCount++;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
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

        // Save Button Alert
        function saveNewProduct() {
            Swal.fire({
                icon: 'success',
                title: 'Product Added!',
                text: 'The new jewelry item has been successfully added.',
                confirmButtonColor: '#da5586',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "products.html";
            });
        }