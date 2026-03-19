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

// 2. Modal එක Open වුණාට පස්සේ Cropper.js එක On කරනවා
document.getElementById('cropModal').addEventListener('shown.bs.modal', function () {
    const imageElement = document.getElementById('imageToCrop');
    
    // කලින් Cropper එකක් තිබ්බා නම් ඒක මකනවා
    if (cropper) {
        cropper.destroy();
    }
    
    // අලුත් Cropper එකක් හදනවා (aspectRatio: 1 කියන්නේ 1:1 කොටුවක්)
    cropper = new Cropper(imageElement, {
        aspectRatio: 1,
        viewMode: 2,
        autoCropArea: 1,
        background: false,
    });
});

// 3. Modal එක වැහුවම Cropper එක Off කරනවා (Memory එක ඉතුරු කරන්න)
document.getElementById('cropModal').addEventListener('hidden.bs.modal', function () {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    // File input එක reset කරනවා
    document.getElementById(currentFileInputId).value = '';
});

// 4. "Crop & Save" බොත්තම එබූ විට ක්‍රියාත්මක වන කොටස
function applyCrop() {
    if (!cropper) return;

    // Crop කරපු කොටස Canvas එකක් විදිහට අරන් Base64 Image එකක් කරනවා
    const canvas = cropper.getCroppedCanvas({
        width: 600, // Quality එක
        height: 600
    });
    
   const croppedImageDataURL = canvas.toDataURL('image/png');
    
    // ඒ Image එක අපේ Preview Box එකට දානවා
    const previewImg = document.getElementById(currentPreviewBoxId);
    previewImg.src = croppedImageDataURL;
    previewImg.classList.remove('d-none');
    
    // Placeholder එක හංගනවා
    document.getElementById('uploadPlaceholder').classList.add('d-none');
    document.getElementById('removeImageBtn').classList.remove('d-none');
    
    // Modal එක වහනවා
    const cropModal = bootstrap.Modal.getInstance(document.getElementById('cropModal'));
    cropModal.hide();
}

// 5. දාපු පින්තූරය මකා දැමීම
function removeTypeImage(event) {
    event.stopPropagation(); 
    
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').classList.add('d-none');
    
    document.getElementById('uploadPlaceholder').classList.remove('d-none');
    document.getElementById('removeImageBtn').classList.add('d-none');
}

// 6. Save බොත්තම (Alert)
function saveType() {
    // අවශ්‍ය Validations මෙතනින් ලියන්න
    Swal.fire({
        icon: 'success',
        title: 'Type Saved!',
        text: 'Product Type has been added successfully.',
        confirmButtonColor: '#da5586'
    });
}