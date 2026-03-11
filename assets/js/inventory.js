function updateStock(sku) {
            Swal.fire({
                title: 'Update Stock',
                html: `<p class="text-muted mb-2">Enter new quantity for <strong>${sku}</strong></p>
                       <input type="number" id="newQty" class="form-control glass-input rounded-pill px-3 py-2 text-center" placeholder="e.g. 50">`,
                showCancelButton: true,
                confirmButtonColor: '#da5586',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Save Changes',
                customClass: {
                    popup: 'glass-panel rounded-4'
                },
                preConfirm: () => {
                    const qty = Swal.getPopup().querySelector('#newQty').value;
                    if (!qty) {
                        Swal.showValidationMessage(`Please enter a quantity`);
                    }
                    return { qty: qty }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Stock Updated!',
                        text: `The stock for ${sku} has been updated to ${result.value.qty}.`,
                        confirmButtonColor: '#da5586',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            });
        }