
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
     else if (currentPage === "types.html") {
        document.querySelector('.nav-types').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Types Management";
    }

     else if (currentPage === "materials.html") {
        document.querySelector('.nav-materials').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Materials Management";
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

   
    else if (currentPage === "messages.html") {
        document.getElementById('page-title').innerText = "Customer Chats";
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

// පිටුව ලෝඩ් වෙද්දීම මේක වැඩ කරනවා
document.addEventListener("DOMContentLoaded", function() {
    loadAdminProfile();
});

function loadAdminProfile() {
    // Storage එකෙන් නම සහ පින්තූරය ගන්නවා
    const adminName = localStorage.getItem("adminName") || sessionStorage.getItem("adminName") || "Admin User";
    const adminImage = localStorage.getItem("adminImage") || sessionStorage.getItem("adminImage");

    // නම Update කිරීම
    const nameDisplay = document.getElementById("admin-name-display");
    if (nameDisplay) {
        nameDisplay.textContent = adminName;
    }

    // පින්තූරය Update කිරීම
    const imageDisplay = document.getElementById("admin-image-display");
    if (imageDisplay) {
        // Image එකක් Database එකේ තියෙනවා නම් ඒක පෙන්වනවා
        if (adminImage && adminImage !== "null" && adminImage !== "undefined") {
            imageDisplay.src = adminImage;
        } else {
            // Image එකක් නැත්නම් නමේ මුල් අකුරු වලින් Avatar එකක් හදලා පෙන්වනවා
            const encodedName = encodeURIComponent(adminName);
            imageDisplay.src = `https://ui-avatars.com/api/?name=${encodedName}&background=da5586&color=fff`;
        }
    }
}