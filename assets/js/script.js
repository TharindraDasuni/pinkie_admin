// Sign In Function
function signIn() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if(email === "" || password === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter both Email and Password!',
            confirmButtonColor: '#d9467d',
            heightAuto: false,
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
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
            heightAuto: false,
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
        }).then(() => {
            window.location.href = "dashboard.html";
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Invalid Email or Password!',
            confirmButtonColor: '#d9467d',
            heightAuto: false,
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
        });
    }
}

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

// Update Active Navigation and Page Title
function updateActiveNav() {
    const currentPage = window.location.pathname.split("/").pop();
    const pageTitle = document.getElementById('page-title');
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class based on current page
    if(currentPage === "dashboard.html" || currentPage === "") {
        document.querySelector('.nav-dashboard')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Dashboard";
    } 
    else if(currentPage === "products.html") {
        document.querySelector('.nav-products')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Products";
    }
    else if(currentPage === "categories.html") {
        document.querySelector('.nav-categories')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Categories";
    }
    else if(currentPage === "inventory.html") {
        document.querySelector('.nav-inventory')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Inventory";
    }
    else if(currentPage === "orders.html") {
        document.querySelector('.nav-orders')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Orders";
    }
    else if(currentPage === "customers.html") {
        document.querySelector('.nav-customers')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Customers";
    }
    else if(currentPage === "reports.html") {
        document.querySelector('.nav-reports')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Reports";
    }
    else if(currentPage === "settings.html") {
        document.querySelector('.nav-settings')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Settings";
    }
    else if(currentPage === "add-product.html") {
        document.querySelector('.nav-products')?.classList.add('active');
        if(pageTitle) pageTitle.textContent = "Add Product";
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const wrapper = document.getElementById("wrapper");
    const overlay = document.getElementById("sidebar-overlay");

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
}

// Document Ready
document.addEventListener("DOMContentLoaded", async function() {
    // Load components
    await loadComponent("sidebar-container", "components/sidebar.html");
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("footer-container", "components/footer.html");
    
    // Update active navigation
    setTimeout(() => {
        updateActiveNav();
        initMobileMenu();
    }, 100);
});