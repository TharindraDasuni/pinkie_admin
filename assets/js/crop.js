let cropper = null;
let currentPreviewBoxId = '';
let currentFileInputId = '';

// 1. පින්තූරයක් තේරූ විට ක්‍රියාත්මක වන කොටස
function triggerCropModal(event, previewImgId) {
    const file = event.target.files[0];
    
    if (file) {
        currentPreviewBoxId = previewImgId;
        currentFileInputId = event.target.id;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Modal එක ඇතුළේ තියෙන Image එකට File එක දානවා
            const imageToCrop = document.getElementById('imageToCrop');
            imageToCrop.src = e.target.result;
            
            // Bootstrap Modal එක Open කරනවා
            const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
            cropModal.show();
        };
        reader.readAsDataURL(file);
    }
}

// පිටුව සම්පූර්ණයෙන්ම Load වුණාට පස්සේ Modal Events ටික අල්ලගන්නවා
document.addEventListener('DOMContentLoaded', function() {
    const cropModalElement = document.getElementById('cropModal');
    
    if (cropModalElement) {
        // 2. Modal එක Open වුණාට පස්සේ Cropper.js එක On කරනවා
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

        // 3. Modal එක වැහුවම Cropper එක Off කරනවා
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

// 4. "Crop & Save" බොත්තම එබූ විට
function applyCrop() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: 600, 
        height: 600
    });
    
    const croppedImageDataURL = canvas.toDataURL('image/png');
    
    // Preview Box එකට දානවා
    const previewImg = document.getElementById(currentPreviewBoxId);
    if(previewImg) {
        previewImg.src = croppedImageDataURL;
        previewImg.classList.remove('d-none');
    }
    
    // Add Type එකේ නම් Placeholder එක හංගන්න ඕනේ (Edit එකේ එහෙම එකක් නෑ)
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');
    
    if (placeholder && currentPreviewBoxId === 'imagePreview') {
        placeholder.classList.add('d-none');
    }
    if (removeBtn && currentPreviewBoxId === 'imagePreview') {
        removeBtn.classList.remove('d-none');
    }
    
    // Modal එක වහනවා
    const cropModal = bootstrap.Modal.getInstance(document.getElementById('cropModal'));
    cropModal.hide();
}