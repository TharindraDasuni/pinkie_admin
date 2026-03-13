// --- Sign In Function ---
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

// --- Load HTML Components ---
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

// --- Theme Toggle ---
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) return;

    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// --- Sidebar Collapse/Expand & Hover Effect ---
function initSidebar() {
    const menuToggle = document.getElementById("menu-toggle");
    const wrapper = document.getElementById("wrapper");
    const overlay = document.getElementById("sidebar-overlay");
    const closeBtn = document.getElementById("close-sidebar");
    const sidebar = document.querySelector('.glass-sidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    // Toggle sidebar on menu button click
    if (menuToggle) {
        menuToggle.addEventListener("click", function (e) {
            e.preventDefault();
            wrapper.classList.toggle("sidebar-collapsed");
        });
    }

    // Close sidebar on overlay click (for mobile)
    if (overlay) {
        overlay.addEventListener("click", function () {
            wrapper.classList.remove("toggled"); // Bootstrap class
            wrapper.classList.remove("sidebar-collapsed"); // Our custom class
        });
    }

    // Close sidebar on close button click (if exists in your mobile view)
    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            wrapper.classList.remove("toggled");
            wrapper.classList.remove("sidebar-collapsed");
        });
    }

    // Active link highlighting
    const currentPage = window.location.pathname.split("/").pop();
    const pageMap = {
        "dashboard.html": ".nav-dashboard",
        "products.html": ".nav-products",
        "categories.html": ".nav-categories",
        "inventory.html": ".nav-inventory",
        "orders.html": ".nav-orders",
        "customers.html": ".nav-customers",
        "reports.html": ".nav-reports",
        "settings.html": ".nav-settings"
    };

    if (pageMap[currentPage]) {
        const activeLink = document.querySelector(pageMap[currentPage]);
        if (activeLink) {
            activeLink.classList.add('active-nav');
        }
    }
}

// --- Page Title Update (Moved from old script) ---
function updatePageTitle() {
    const pageTitleElement = document.getElementById('page-title');
    if (!pageTitleElement) return;

    const currentPage = window.location.pathname.split("/").pop();
    const titleMap = {
        "dashboard.html": "Dashboard",
        "products.html": "Products Management",
        "categories.html": "Categories Management",
        "inventory.html": "Inventory",
        "orders.html": "Orders Management",
        "customers.html": "Customers Management",
        "reports.html": "Reports & Analytics",
        "settings.html": "Settings",
        "add-product.html": "Add New Product"
    };
    pageTitleElement.innerText = titleMap[currentPage] || "Overview";
}

// --- Document Ready ---
document.addEventListener("DOMContentLoaded", async function() {
    
    // Load components
    await loadComponent("sidebar-container", "components/sidebar.html");
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("footer-container", "components/footer.html");

    // Initialize features after components are loaded
    setTimeout(() => {
        initSidebar();
        initThemeToggle();
        updatePageTitle();
    }, 100); // Small delay to ensure DOM is updated
});