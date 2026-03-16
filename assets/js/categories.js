function saveCategory() {
    Swal.fire({
        icon: 'success',
        title: 'Category Saved!',
        text: 'New product category has been added successfully.',
        confirmButtonColor: '#da5586',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        document.getElementById('addCategoryForm').reset();
    });
}