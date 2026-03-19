// 1. Save Material 
function saveMaterial() {
    const name = document.getElementById("matName").value.trim();
    const category = document.getElementById("matCategory").value;
    const type = document.getElementById("matType").value;

    if (name === "" || category === "" || type === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Required Fields',
            text: 'Please fill all the required fields!',
            confirmButtonColor: '#da5586'
        });
        return;
    }

    // මෙතනින් Backend API Call එක ලියන්න (fetch POST request)
    
    Swal.fire({
        icon: 'success',
        title: 'Material Saved!',
        text: 'New material has been added successfully.',
        confirmButtonColor: '#da5586'
    }).then(() => {
        document.getElementById("addMaterialForm").reset();
    });
}

// 2. Edit Modal එක Open කිරීම (දත්ත පිරවීම)
function openEditMaterialModal(id, name, categoryId, typeId, status) {
    document.getElementById('editMatId').value = id;
    document.getElementById('editMatName').value = name;
    document.getElementById('editMatCategory').value = categoryId;
    document.getElementById('editMatType').value = typeId;
    document.getElementById('editMatStatus').value = status;
    
    const editModal = new bootstrap.Modal(document.getElementById('editMaterialModal'));
    editModal.show();
}

// 3. Update Material
function updateMaterial() {
    const id = document.getElementById('editMatId').value;
    const name = document.getElementById('editMatName').value.trim();

    if (name === "") {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Material name cannot be empty!' });
        return;
    }

    // මෙතනින් Backend API Call එක ලියන්න (fetch PUT request)

    Swal.fire({
        icon: 'success',
        title: 'Updated Successfully!',
        text: 'The material details have been updated.',
        confirmButtonColor: '#da5586'
    }).then(() => {
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editMaterialModal'));
        editModal.hide();
    });
}