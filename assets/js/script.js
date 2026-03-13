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

document.addEventListener("DOMContentLoaded", async function() {
    
    await loadComponent("sidebar-container", "components/sidebar.html");
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("footer-container", "components/footer.html");

    const currentPage = window.location.pathname.split("/").pop(); 
    
    if(currentPage === "dashboard.html" || currentPage === "") {
        document.querySelector('.nav-dashboard').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Overview";
    } 
    else if(currentPage === "products.html") {
        document.querySelector('.nav-products').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Products Management";
    }
     else if(currentPage === "categories.html") {
        document.querySelector('.nav-categories').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Categories Management";
    }

    else if(currentPage === "inventory.html") {
        document.querySelector('.nav-inventory').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Inventory";
    }
          else if(currentPage === "orders.html") {
        document.querySelector('.nav-orders').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Orders Management";
    }
          else if(currentPage === "customers.html") {
        document.querySelector('.nav-customers').classList.add('active-nav');
        document.getElementById('page-title').innerText = "Customers Management";
    }

       else if(currentPage === "settings.html") {
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