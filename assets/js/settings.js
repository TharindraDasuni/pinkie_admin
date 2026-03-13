      // Save alert
        function saveSettings(section) {
            Swal.fire({
                icon: 'success',
                title: 'Saved Successfully!',
                text: `Your ${section} details have been updated.`,
                confirmButtonColor: '#da5586',
                timer: 2000,
                showConfirmButton: false
            });
        }

        // Copy API key alert
        function copyToClipboard() {
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'API Key copied to clipboard.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
        }

        // Generate new API keys alert
        function generateNewAPI() {
            Swal.fire({
                title: 'Generate New Keys?',
                text: "This will invalidate your current API keys. Apps using the old keys will stop working.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#da5586',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Generate!'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Generated!',
                        text: 'New API keys have been generated.',
                        confirmButtonColor: '#da5586'
                    });
                }
            });
        }