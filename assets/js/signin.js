async function signIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember_me").checked;

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
            if (rememberMe) {
                localStorage.setItem("adminToken", result.data.token);
                localStorage.setItem("adminName", result.data.name);
                localStorage.setItem("adminImage", result.data.photoUrl);
            } else {
                sessionStorage.setItem("adminToken", result.data.token);
                sessionStorage.setItem("adminName", result.data.name);
                sessionStorage.setItem("adminImage", result.data.photoUrl);
            }

            window.location.href = "dashboard.html";

        } else {
            if (result.data && typeof result.data === "object" && Object.keys(result.data).length > 0) {
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

async function sendOTP() {
    const email = document.getElementById("resetEmail").value;

    if (email === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Required!',
            text: 'Please enter your registered email address.',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
        return;
    }

    Swal.fire({
        title: 'Sending OTP...',
        text: 'Please wait while we send the code to your email.',
        allowOutsideClick: false,
        showConfirmButton: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch("http://localhost:8080/api/forgot-password/send-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.close();

            document.getElementById("emailSection").classList.add("d-none");
            document.getElementById("resetSection").classList.remove("d-none");

            document.getElementById("modalTitle").innerText = "Enter OTP";
            document.getElementById("modalDesc").innerHTML = `We have sent a 6-digit OTP to <b>${email}</b>. Please enter it below.`;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: result.message || 'Could not send OTP. Please try again.',
                confirmButtonColor: '#da5586',
                heightAuto: false
            });
        }
    } catch (error) {
        console.error("OTP Send Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Could not connect to the server. Please check your backend.',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
    }
}

async function updatePassword() {
    const email = document.getElementById("resetEmail").value;
    const otp = document.getElementById("otpCode").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;

    if (otp === "" || newPassword === "" || confirmPassword === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete',
            text: 'Please fill in all the fields.',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Mismatch!',
            text: 'New password and confirm password do not match.',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
        return;
    }

    Swal.fire({
        title: 'Resetting Password...',
        allowOutsideClick: false,
        showConfirmButton: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        
        const response = await fetch("http://localhost:8080/api/forgot-password/reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                otp: otp,
                newPassword: newPassword
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Password Reset Successful!',
                text: 'You can now log in with your new password.',
                confirmButtonColor: '#da5586',
                heightAuto: false
            }).then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                modal.hide();
                resetModalUI();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Reset Failed',
                text: result.message || 'Invalid OTP or expired.',
                confirmButtonColor: '#da5586',
                heightAuto: false
            });
        }
    } catch (error) {
        console.error("Password Reset Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Could not connect to the server.',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
    }
}

function resetModalUI() {
    document.getElementById("emailSection").classList.remove("d-none");
    document.getElementById("resetSection").classList.add("d-none");
    
    document.getElementById("modalTitle").innerText = "Forgot Password?";
    document.getElementById("modalDesc").innerText = "Enter the email address associated with your admin account. We'll send an OTP to reset your password.";
    
    document.getElementById("resetEmail").value = "";
    document.getElementById("otpCode").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";
}