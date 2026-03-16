// Change Status (published/hidden) Alert
function changeStatus(event, element, newStatus, productName) {
    event.preventDefault();

    const button = element.closest('.dropdown').querySelector('.dropdown-toggle');

    if (newStatus === 'Published') {
        button.className = 'btn btn-sm btn-outline-success rounded-pill px-3 fw-bold dropdown-toggle';
        button.innerHTML = '<i class="fas fa-eye me-1"></i> Published';
    } else {
        button.className = 'btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold dropdown-toggle';
        button.innerHTML = '<i class="fas fa-eye-slash me-1"></i> Hidden';
    }

    // Close dropdown menu programmatically
    const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(button);
    dropdownInstance.hide();

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    Toast.fire({
        icon: newStatus === 'Published' ? 'success' : 'info',
        title: `"${productName}" is now ${newStatus}.`
    });
}

// Delete Product Alert
function deleteProduct(productName) {
    Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete "${productName}". This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The product has been deleted.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}