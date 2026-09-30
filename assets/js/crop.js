let cropper = null;
let currentPreviewBoxId = '';
let currentFileInputId = '';

function triggerCropModal(event, previewImgId) {
    const file = event.target.files[0];
    
    if (file) {
        currentPreviewBoxId = previewImgId;
        currentFileInputId = event.target.id;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageToCrop = document.getElementById('imageToCrop');
            imageToCrop.src = e.target.result;
            
            const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
            cropModal.show();
        };
        reader.readAsDataURL(file);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const cropModalElement = document.getElementById('cropModal');
    
    if (cropModalElement) {
        cropModalElement.addEventListener('shown.bs.modal', function () {
            const imageElement = document.getElementById('imageToCrop');
            
            if (cropper) {
                cropper.destroy();
            }
            
            cropper = new Cropper(imageElement, {
                aspectRatio: 1,
                viewMode: 2,
                autoCropArea: 1,
                background: false,
            });
        });

        cropModalElement.addEventListener('hidden.bs.modal', function () {
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            const fileInput = document.getElementById(currentFileInputId);
            if(fileInput) fileInput.value = '';
        });
    }
});

function applyCrop() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: 600, 
        height: 600
    });
    
    const croppedImageDataURL = canvas.toDataURL('image/png');
    
    const previewImg = document.getElementById(currentPreviewBoxId);
    if(previewImg) {
        previewImg.src = croppedImageDataURL;
        previewImg.classList.remove('d-none');
    }
    
    if (currentPreviewBoxId === 'imagePreview') {
        const mainPlaceholder = document.getElementById('uploadPlaceholder');
        const mainRemoveBtn = document.getElementById('removeImageBtn');
        if (mainPlaceholder) mainPlaceholder.classList.add('d-none');
        if (mainRemoveBtn) mainRemoveBtn.classList.remove('d-none');
        
    } else if (currentPreviewBoxId === 'iconPreview') {
        const iconPlaceholder = document.getElementById('iconUploadPlaceholder');
        const iconRemoveBtn = document.getElementById('removeIconBtn');
        if (iconPlaceholder) iconPlaceholder.classList.add('d-none');
        if (iconRemoveBtn) iconRemoveBtn.classList.remove('d-none');
    }
    
    const cropModal = bootstrap.Modal.getInstance(document.getElementById('cropModal'));
    cropModal.hide();
}