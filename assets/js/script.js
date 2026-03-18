async function signIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember_me").checked;

    // 1. Basic Frontend Validation
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

    // 2. Show Loading Alert
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
        // 3. Call Spring Boot Backend API
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
            // 4. Save the JWT Token and Admin Name
            if (rememberMe) {
                localStorage.setItem("adminToken", result.data.token);
                localStorage.setItem("adminName", result.data.name);
            } else {
                sessionStorage.setItem("adminToken", result.data.token);
                sessionStorage.setItem("adminName", result.data.name);
            }

            // 5. Success Alert and Redirect
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                text: `Logging into Admin Workspace, ${result.data.name}...`,
                showConfirmButton: false,
                timer: 1500,
                heightAuto: false
            }).then(() => {
                window.location.href = "dashboard.html";
            });

        } else {
            // 6. Handle Backend Errors (Validation or Invalid Credentials)
            if (result.data && typeof result.data === "object" && Object.keys(result.data).length > 0) {
                // Spring Boot Validation Errors (e.g., Email is invalid)
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
        // 7. Handle Network Errors (Server down)
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



async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } else {
            console.error('Error loading component:', filePath);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

document.addEventListener("DOMContentLoaded", async function () {

    await loadComponent("sidebar-container", "components/sidebar.html");
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("footer-container", "components/footer.html");

    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "dashboard.html" || currentPage === "") {
        document.querySelector('.nav-dashboard').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Overview";
    }
    else if (currentPage === "products.html") {
        document.querySelector('.nav-products').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Products Management";
    }
    else if (currentPage === "categories.html") {
        document.querySelector('.nav-categories').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Categories Management";
    }

    else if (currentPage === "inventory.html") {
        document.querySelector('.nav-inventory').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Inventory";
    }
    else if (currentPage === "orders.html") {
        document.querySelector('.nav-orders').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Orders Management";
    }
    else if (currentPage === "customers.html") {
        document.querySelector('.nav-customers').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Customers Management";
    }

    else if (currentPage === "reports.html") {
        document.querySelector('.nav-reports').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Reports & Analytics";
    }

    else if (currentPage === "settings.html") {
        document.querySelector('.nav-settings').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Settings";
    }

    setTimeout(() => {
        const menuToggle = document.getElementById("menu-toggle");
        const wrapper = document.getElementById("wrapper");
        const overlay = document.getElementById("sidebar-overlay");
        const closeBtn = document.getElementById("close-sidebar");

        if (menuToggle) {
            menuToggle.addEventListener("click", function (e) {
                e.preventDefault();
                wrapper.classList.toggle("toggled");
            });
        }

        if (overlay) {
            overlay.addEventListener("click", function () {
                wrapper.classList.remove("toggled");
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                wrapper.classList.remove("toggled");
            });
        }
    }, 100);

});

// Theme Toggle Logic
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        if (icon) {
            icon.classList.remove('fa-moon', 'text-dark');
            icon.classList.add('fa-sun', 'text-warning');
        }
        localStorage.setItem('theme', 'dark');
    } else {
        if (icon) {
            icon.classList.remove('fa-sun', 'text-warning');
            icon.classList.add('fa-moon', 'text-dark');
        }
        localStorage.setItem('theme', 'light');
    }
}

// Check saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const icon = document.getElementById('themeIcon');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (icon) {
            icon.classList.remove('fa-moon', 'text-dark');
            icon.classList.add('fa-sun', 'text-warning');
        }
    }
});