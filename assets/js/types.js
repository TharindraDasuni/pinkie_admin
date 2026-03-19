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

// 7. Edit Modal එක Open කිරීම (දත්ත පිරවීම)
function openEditTypeModal(id, name, categoryId, status, imageUrl) {
    // Hidden Input එකට ID එක දානවා
    document.getElementById('editTypeId').value = id;
    
    // අනිත් විස්තර ටික පුරවනවා
    document.getElementById('editTypeName').value = name;
    document.getElementById('editTypeCategory').value = categoryId;
    document.getElementById('editTypeStatus').value = status;
    
    // පින්තූරය දානවා
    const previewImg = document.getElementById('editImagePreview');
    if(imageUrl) {
        previewImg.src = imageUrl;
    } else {
        previewImg.src = 'assets/images/placeholder.jpg'; // පින්තූරයක් නැත්නම් Default එක දානවා
    }

    // Bootstrap Modal එක Open කරනවා
    const editModal = new bootstrap.Modal(document.getElementById('editTypeModal'));
    editModal.show();
}

// 8. Update බොත්තම එබූ විට
function updateType() {
    // මෙතනින් ඔයාට Backend එකට Data යවන්න පුළුවන් (fetch API)
    
    // දැනට SweetAlert එකක් පෙන්වමු
    Swal.fire({
        icon: 'success',
        title: 'Updated Successfully!',
        text: 'The product type has been updated.',
        confirmButtonColor: '#da5586'
    }).then(() => {
        // Alert එක Ok කළාම Modal එක වහනවා
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editTypeModal'));
        editModal.hide();
    });
}