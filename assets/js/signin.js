async function signIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember_me").checked;

    // Frontend Validation
    if (email === "" || password === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter both Email and Password!',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
        return;
    }

    // Loading Alert
    Swal.fire({
        title: 'Signing In...',
        text: 'Please wait while we authenticate your credentials.',
        allowOutsideClick: false,
        showConfirmButton: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Call Spring Boot Backend API
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                rememberMe: rememberMe
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Save JWT Token and Admin Name
            if (rememberMe) {
                localStorage.setItem("adminToken", result.data.token);
                localStorage.setItem("adminName", result.data.name);
            } else {
                sessionStorage.setItem("adminToken", result.data.token);
                sessionStorage.setItem("adminName", result.data.name);
            }

            window.location.href = "dashboard.html";

        } else {
            // Handle Backend Errors (Validation or Invalid Credentials)
            if (result.data && typeof result.data === "object" && Object.keys(result.data).length > 0) {
                // Spring Boot Validation Errors 
                let errorHtml = '<ul style="text-align: left; list-style-type: disc; padding-left: 20px;">';
                for (const field in result.data) {
                    errorHtml += `<li style="margin-bottom: 5px;">${result.data[field]}</li>`;
                }
                errorHtml += '</ul>';

                Swal.fire({
                    icon: 'error',
                    title: 'Validation Failed',
                    html: errorHtml,
                    confirmButtonColor: '#da5586',
                    heightAuto: false
                });
            } else {
                // Invalid Password or Email
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: result.message || 'Invalid Email or Password!',
                    confirmButtonColor: '#da5586',
                    heightAuto: false
                });
            }
        }
    } catch (error) {
        // Handle Network Errors (Server down)
        console.error("Login Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Connection Failed',
            text: 'Could not connect to the server. Please check if the backend is running.',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
    }
}

// Forgot Password 
function sendOTP() {
    const emailInput = document.getElementById('resetEmail').value;

    if (emailInput.trim() === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Email Required',
            text: 'Please enter your email address to receive the OTP.',
            confirmButtonColor: '#da5586'
        });
        return;
    }

    // Close the modal
    var myModalEl = document.getElementById('forgotPasswordModal');
    var modal = bootstrap.Modal.getInstance(myModalEl);
    modal.hide();

    // Simulate sending OTP 
    Swal.fire({
        title: 'Sending OTP...',
        text: 'Please wait while we send the code to your email.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: 'OTP Sent!',
            text: `A 6-digit verification code has been sent to ${emailInput}.`,
            confirmButtonColor: '#da5586'
        }).then(() => {
            console.log("Proceed to OTP verification step");
        });
    }, 1500);
}