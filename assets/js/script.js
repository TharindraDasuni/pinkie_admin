// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme icons if they exist
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    
    if (sunIcon && moonIcon) {
        if (savedTheme === 'dark') {
            sunIcon.classList.remove('active');
            moonIcon.classList.add('active');
        } else {
            sunIcon.classList.add('active');
            moonIcon.classList.remove('active');
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    
    if (sunIcon && moonIcon) {
        if (newTheme === 'dark') {
            sunIcon.classList.remove('active');
            moonIcon.classList.add('active');
        } else {
            sunIcon.classList.add('active');
            moonIcon.classList.remove('active');
        }
    }
    
    // Update chart if exists
    if (window.salesChart && typeof window.salesChart.destroy === 'function') {
        window.salesChart.destroy();
        if (typeof initSalesChart === 'function') {
            initSalesChart();
        }
    }
}

// Sign In Function
function signIn() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if(email === "" || password === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter both Email and Password!',
            confirmButtonColor: '#da5586',
            background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
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
            background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
        }).then(() => {
            window.location.href = "dashboard.html";
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Invalid Email or Password!',
            confirmButtonColor: '#da5586',
            background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
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

// Sidebar Toggle
function toggleSidebar() {
    const wrapper = document.getElementById("wrapper");
    const overlay = document.getElementById("sidebar-overlay");
    
    if (wrapper && overlay) {
        wrapper.classList.toggle("toggled");
        overlay.style.display = wrapper.classList.contains("toggled") ? "block" : "none";
    }
}

// Logout Function
function logoutAdmin() {
    Swal.fire({
        title: 'Ready to Leave?',
        text: 'You are about to logout from the admin panel.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#da5586',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Logout',
        background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'index.html';
        }
    });
}

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", async function() {
    initTheme();
    
    await loadComponent("sidebar-container", "components/sidebar.html");
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("footer-container", "components/footer.html");

    const currentPage = window.location.pathname.split("/").pop();
    
    // Set active nav and page title
    const pageTitle = document.getElementById('page-title');
    
    if(currentPage === "dashboard.html" || currentPage === "") {
        document.querySelector('.nav-dashboard')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Dashboard";
    } 
    else if(currentPage === "products.html") {
        document.querySelector('.nav-products')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Products";
    }
    else if(currentPage === "categories.html") {
        document.querySelector('.nav-categories')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Categories";
    }
    else if(currentPage === "inventory.html") {
        document.querySelector('.nav-inventory')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Inventory";
    }
    else if(currentPage === "orders.html") {
        document.querySelector('.nav-orders')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Orders";
    }
    else if(currentPage === "customers.html") {
        document.querySelector('.nav-customers')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Customers";
    }
    else if(currentPage === "reports.html") {
        document.querySelector('.nav-reports')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Reports";
    }
    else if(currentPage === "settings.html") {
        document.querySelector('.nav-settings')?.classList.add('active');
        if(pageTitle) pageTitle.innerText = "Settings";
    }

    // Setup sidebar toggle
    setTimeout(() => {
        const menuToggle = document.getElementById("menu-toggle");
        const wrapper = document.getElementById("wrapper");
        const overlay = document.getElementById("sidebar-overlay");
        const closeBtn = document.getElementById("close-sidebar");

        if (menuToggle) {
            menuToggle.addEventListener("click", function (e) {
                e.preventDefault();
                toggleSidebar();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", toggleSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", toggleSidebar);
        }
        
        // Setup theme toggle
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", toggleTheme);
        }
    }, 100);
});