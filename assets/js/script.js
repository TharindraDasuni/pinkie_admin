function signIn() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if(email === "" || password === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter both Email and Password!',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
        return;
    }

    if(email === "admin@pinkie.com" && password === "1234") {
        Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'Logging into Admin Workspace...',
            showConfirmButton: false,
            timer: 1500,
            heightAuto: false
        }).then(() => {
            window.location.href = "dashboard.html";
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Invalid Email or Password!',
            confirmButtonColor: '#da5586',
            heightAuto: false
        });
    }
}