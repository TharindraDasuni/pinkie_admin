// crop.js ෆයිල් එකේ applyCrop() කොටස පමණි
function applyCrop() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: 600,
        height: 600
    });
    
    const croppedImageDataURL = canvas.toDataURL('image/png');
    
    // Preview Box එකට Image එක දානවා
    const previewImg = document.getElementById(currentPreviewBoxId);
    if (previewImg) {
        previewImg.src = croppedImageDataURL;
        previewImg.classList.remove('d-none');
    }
    
    // කුමන Placeholder එකද හැංගිය යුත්තේ කියා සෙවීම
    let placeholderId = 'uploadPlaceholder';
    let removeBtnId = 'removeImageBtn';

    if (currentPreviewBoxId === 'iconPreview') {
        placeholderId = 'iconUploadPlaceholder';
        removeBtnId = 'removeIconBtn';
    } else if (currentPreviewBoxId === 'imagePreview') {
        placeholderId = 'uploadPlaceholder';
        removeBtnId = 'removeImageBtn';
    } 
    // Edit Modal වලදී Placeholder හංගන්න අවශ්‍ය නැහැ (ඒවායේ තියෙන්නේ වෙනස් design එකක්)
    
    const placeholder = document.getElementById(placeholderId);
    const removeBtn = document.getElementById(removeBtnId);

    if (placeholder) placeholder.classList.add('d-none');
    if (removeBtn) removeBtn.classList.remove('d-none');
    
    const cropModal = bootstrap.Modal.getInstance(document.getElementById('cropModal'));
    cropModal.hide();
}