document.addEventListener("DOMContentLoaded", function () {
    loadCustomers();
    setupSearchAndSort();
});

let allCustomers = [];

async function loadCustomers() {
    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

        const response = await fetch("http://localhost:8080/api/customers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            allCustomers = result.data.customers;
            
            document.querySelectorAll(".dash-card h3")[0].innerText = result.data.totalCount;
            document.querySelectorAll(".dash-card h3")[1].innerText = "+" + result.data.newThisMonth;
            document.querySelectorAll(".dash-card h3")[2].innerText = result.data.activeCount;

            renderCustomersTable(allCustomers);
        } else {
            console.error("Failed to load customers", result.message);
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
}

function toggleCustomerStatus(customerId, newStatus, customerName) {
    const actionWord = newStatus === "Banned" ? "ban" : "unban";

    Swal.fire({
        title: `Are you sure?`,
        text: `Do you really want to ${actionWord} ${customerName || "this customer"}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus === "Banned" ? '#dc3545' : '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${actionWord}!`
    }).then(async (result) => {
        if (result.isConfirmed) {
            
            Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken"); 

                const response = await fetch(`http://localhost:8080/api/customers/${customerId}/toggle-status`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                const resData = await response.json();

                if (response.ok && resData.success) {
                    Swal.fire('Success!', `Customer has been ${newStatus.toLowerCase()}.`, 'success');
                    loadCustomers(); 
                } else {
                    Swal.fire('Error!', resData.message || 'Failed to update status.', 'error');
                }
            } catch (error) {
                Swal.fire('Error!', 'Connection error.', 'error');
            }
        }
    });
}

function renderCustomersTable(customers) {
    const tbody = document.querySelector(".glass-table tbody");
    tbody.innerHTML = "";

    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No customers found.</td></tr>`;
        return;
    }

    customers.forEach(cus => {
        
        const joinedDate = cus.createdAt ? new Date(cus.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
        
        let avatarHtml = "";
        if (cus.profile_img && cus.profile_img !== "null" && cus.profile_img.trim() !== "") {
            avatarHtml = `<img src="${cus.profile_img}" class="rounded-circle" width="40" height="40" style="object-fit: cover;">`;
        } else {
            const initial = (cus.fname ? cus.fname.charAt(0).toUpperCase() : "U");
            avatarHtml = `<div class="bg-white rounded-circle d-flex align-items-center justify-content-center border shadow-sm" style="width: 40px; height: 40px;"><span class="fw-bold text-pinkie">${initial}</span></div>`;
        }

        const isActive = (!cus.status || cus.status === "Active");
        const statusBadge = isActive 
            ? `<span class="badge bg-success bg-opacity-75 rounded-pill px-3 py-2">Active</span>`
            : `<span class="badge bg-danger bg-opacity-75 rounded-pill px-3 py-2">Banned</span>`;

        const banButtonTitle = isActive ? "Ban User" : "Unban User";
        const banButtonIcon = isActive ? "fa-ban" : "fa-unlock";
        const banButtonColor = isActive ? "text-danger" : "text-success";
        const targetStatus = isActive ? "Banned" : "Active";

        const row = `
            <tr style="border-radius: 10px; transition: 0.3s;">
                <td class="fw-bold text-muted ps-3" style="font-size: 13px;">${cus.id.substring(0, 8)}...</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="me-3">${avatarHtml}</div>
                        <div>
                            <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${cus.fname || ""} ${cus.lname || ""}</h6>
                            <small class="text-muted" style="font-size: 12px;">${cus.email || "No Email"} | ${cus.contact_no || "No Phone"}</small>
                        </div>
                    </div>
                </td>
                <td class="text-muted" style="font-size: 13px;">${joinedDate}</td>
                <td class="text-center fw-bold text-dark fs-6">${cus.totalOrders || 0}</td>
                <td class="text-center fw-bold text-pinkie fs-6">Rs. ${(cus.totalSpent || 0).toLocaleString()}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center pe-3">
                    <button class="btn btn-sm btn-light text-primary rounded-circle shadow-sm me-1" title="View Profile" onclick="viewCustomer('${cus.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-light ${banButtonColor} rounded-circle shadow-sm" title="${banButtonTitle}" onclick="toggleCustomerStatus('${cus.id}', '${targetStatus}', '${cus.fname}')">
                        <i class="fas ${banButtonIcon}"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function setupSearchAndSort() {
    const searchInput = document.querySelector("input[placeholder='Search by name, email or phone...']");
    const sortSelect = document.querySelector("select.form-select");

    searchInput.addEventListener("input", function (e) {
        const query = e.target.value.toLowerCase();
        const filtered = allCustomers.filter(cus => {
            const fullName = `${cus.fname || ""} ${cus.lname || ""}`.toLowerCase();
            const email = (cus.email || "").toLowerCase();
            const phone = (cus.contact_no || "").toLowerCase();
            return fullName.includes(query) || email.includes(query) || phone.includes(query);
        });
        renderCustomersTable(filtered);
    });

    sortSelect.addEventListener("change", function (e) {
        const val = e.target.value;
        let sorted = [...allCustomers];

        if (val === "1") {
            sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else if (val === "2") {
            sorted.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        } else if (val === "3") {
            sorted.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0));
        }

        renderCustomersTable(sorted);
    });
}

window.viewCustomer = function(customerId) {
    const cus = allCustomers.find(c => c.id === customerId);
    if (!cus) return;

    // Modal එකේ දත්ත වෙනස් කරනවා
    document.querySelector("#customerProfileModal h5.mb-1").innerText = `${cus.fname || ""} ${cus.lname || ""}`;
    document.querySelector("#customerProfileModal p.text-muted.mb-3").innerText = `Customer ID: #${cus.id.substring(0,8)}`;
    
    // Email & Phone Update
    const infoParagraphs = document.querySelectorAll("#customerProfileModal .text-start p");
    infoParagraphs[0].innerHTML = `<i class="fas fa-envelope text-secondary me-2"></i> ${cus.email || "N/A"}`;
    infoParagraphs[1].innerHTML = `<i class="fas fa-phone-alt text-secondary me-2"></i> ${cus.contact_no || "N/A"}`;
    
    const joinedDate = cus.createdAt ? new Date(cus.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
    infoParagraphs[2].innerHTML = `<i class="fas fa-calendar-alt text-secondary me-2"></i> Joined: ${joinedDate}`;

    // Stats Update
    const statCards = document.querySelectorAll("#customerProfileModal .col-lg-8 .row h4");
    statCards[0].innerText = cus.totalOrders || 0;
    statCards[1].innerText = `Rs. ${(cus.totalSpent || 0).toLocaleString()}`;
    
    const avg = cus.totalOrders > 0 ? (cus.totalSpent / cus.totalOrders) : 0;
    statCards[2].innerText = `Rs. ${avg.toLocaleString()}`;

    // Modal එක පෙන්වනවා
    const modal = new bootstrap.Modal(document.getElementById('customerProfileModal'));
    modal.show();
}