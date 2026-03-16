function banCustomer(name) {
    Swal.fire({
        title: 'Ban Customer?',
        text: `Are you sure you want to ban ${name}? They will no longer be able to place orders.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Ban',
        customClass: {
            popup: 'glass-panel rounded-4'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Banned!',
                text: `${name} has been banned successfully.`,
                icon: 'success',
                confirmButtonColor: '#da5586',
                customClass: {
                    popup: 'glass-panel rounded-4'
                }
            });
        }
    });
}