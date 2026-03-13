// Load Components
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

// Initialize on page load
document.addEventListener("DOMContentLoaded", async function() {
    // Load components
    await loadComponent("sidebar-container", "components/sidebar.html");
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("footer-container", "components/footer.html");
    
    // Set active navigation
    setTimeout(() => {
        const currentPage = window.location.pathname.split("/").pop();
        const navLinks = document.querySelectorAll('.nav-item');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.classList.contains(`nav-${currentPage.replace('.html', '')}`)) {
                link.classList.add('active');
            }
        });
        
        // Special case for dashboard
        if (currentPage === '' || currentPage === 'dashboard.html') {
            document.querySelector('.nav-dashboard')?.classList.add('active');
        }
    }, 100);
    
    // Mobile menu toggle
    setTimeout(() => {
        const menuToggle = document.getElementById("menu-toggle");
        const wrapper = document.getElementById("wrapper");
        const overlay = document.getElementById("sidebar-overlay");
        
        if (menuToggle) {
            menuToggle.addEventListener("click", function(e) {
                e.preventDefault();
                wrapper.classList.toggle("toggled");
            });
        }
        
        if (overlay) {
            overlay.addEventListener("click", function() {
                wrapper.classList.remove("toggled");
            });
        }
    }, 200);
});

// Login Function
function signIn() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    
    if(email === "" || password === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter both Email and Password!',
            confirmButtonColor: '#da5586'
        });
        return;
    }
    
    if(email === "admin@pinkie.com" && password === "1234") {
        Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'Logging into Admin Workspace...',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "dashboard.html";
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Invalid Email or Password!',
            confirmButtonColor: '#da5586'
        });
    }
}