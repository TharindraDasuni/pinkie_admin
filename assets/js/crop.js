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
// 3. "Crop & Save" බොත්තම එබූ විට
function applyCrop() {
    if (!cropper) return;

    // Quality එක 600x600 ලෙස සකසා ඇත
    const canvas = cropper.getCroppedCanvas({
        width: 600, 
        height: 600
    });
    
    // Transparent PNG සඳහා සහය දැක්වීමට 'image/png' භාවිතා කරයි
    const croppedImageDataURL = canvas.toDataURL('image/png');
    
    // අදාළ Preview Box එකට පින්තූරය දැමීම
    const previewImg = document.getElementById(currentPreviewBoxId);
    if(previewImg) {
        previewImg.src = croppedImageDataURL;
        previewImg.classList.remove('d-none');
    }
    
    // අකුරු (Placeholder) හැංගීම සහ රතු බොත්තම (Remove) පෙන්වීම
    if (currentPreviewBoxId === 'imagePreview') {
        // පළමු කොටුවට (Main Image) අදාළව
        const mainPlaceholder = document.getElementById('uploadPlaceholder');
        const mainRemoveBtn = document.getElementById('removeImageBtn');
        if (mainPlaceholder) mainPlaceholder.classList.add('d-none');
        if (mainRemoveBtn) mainRemoveBtn.classList.remove('d-none');
        
    } else if (currentPreviewBoxId === 'iconPreview') {
        // දෙවන කොටුවට (Vector Icon) අදාළව
        const iconPlaceholder = document.getElementById('iconUploadPlaceholder');
        const iconRemoveBtn = document.getElementById('removeIconBtn');
        if (iconPlaceholder) iconPlaceholder.classList.add('d-none');
        if (iconRemoveBtn) iconRemoveBtn.classList.remove('d-none');
    }
    
    // Modal එක වැසීම
    const cropModal = bootstrap.Modal.getInstance(document.getElementById('cropModal'));
    cropModal.hide();
}