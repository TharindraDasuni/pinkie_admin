  function saveOrderUpdate() {
            var myModalEl = document.getElementById('orderDetailsModal');
            var modal = bootstrap.Modal.getInstance(myModalEl);
            modal.hide();

            Swal.fire({
                icon: 'success',
                title: 'Order Updated!',
                text: 'Order status and tracking information have been saved successfully.',
                confirmButtonColor: '#da5586',
                timer: 2000,
                showConfirmButton: false
            });
        }