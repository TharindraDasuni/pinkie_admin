// 1. දාපු පින්තූරය මකා දැමීම (Add Type Form එකේ)
function removeTypeImage(event) {
    event.stopPropagation(); 
    
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').classList.add('d-none');
    
    document.getElementById('uploadPlaceholder').classList.remove('d-none');
    document.getElementById('removeImageBtn').classList.add('d-none');
    
    // File Input එකත් හිස් කරනවා
    document.getElementById('typeImage').value = '';
}

// 2. Save බොත්තම 
function saveType() {
    Swal.fire({
        icon: 'success',
        title: 'Type Saved!',
        text: 'Product Type has been added successfully.',
        confirmButtonColor: '#da5586'
    });
}

// 3. Edit Modal එක Open කිරීම (දත්ත පිරවීම)
function openEditTypeModal(id, name, categoryId, status, imageUrl) {
    document.getElementById('editTypeId').value = id;
    
    document.getElementById('editTypeName').value = name;
    document.getElementById('editTypeCategory').value = categoryId;
    document.getElementById('editTypeStatus').value = status;
    
    const previewImg = document.getElementById('editImagePreview');
    if(imageUrl) {
        previewImg.src = imageUrl;
    } else {
        previewImg.src = 'assets/images/placeholder.jpg'; 
    }

    const editModal = new bootstrap.Modal(document.getElementById('editTypeModal'));
    editModal.show();
}

// 4. Update බොත්තම එබූ විට
function updateType() {
    Swal.fire({
        icon: 'success',
        title: 'Updated Successfully!',
        text: 'The product type has been updated.',
        confirmButtonColor: '#da5586'
    }).then(() => {
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editTypeModal'));
        editModal.hide();
    });
}