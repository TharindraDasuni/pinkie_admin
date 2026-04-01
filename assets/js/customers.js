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
        
        // Database එකේ image එක තියෙන නම මොකක් වුණත් අල්ලගන්න පුළුවන් වෙන්න හැදුවා
        const cusImage = cus.profile_img || cus.photoUrl || cus.photo_url || cus.image;

        let avatarHtml = "";
        if (cusImage && cusImage !== "null" && cusImage.trim() !== "") {
            avatarHtml = `<img src="${cusImage}" class="rounded-circle shadow-sm border" width="40" height="40" style="object-fit: cover;">`;
        } else {
            const formattedName = encodeURIComponent((cus.fname || "U") + " " + (cus.lname || ""));
            avatarHtml = `<img src="https://ui-avatars.com/api/?name=${formattedName}&background=da5586&color=fff" class="rounded-circle shadow-sm border" width="40" height="40">`;
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

// ==========================================
// Modal එකට දත්ත යවන කොටස 
// ==========================================
window.viewCustomer = function(customerId) {
    const cus = allCustomers.find(c => c.id === customerId);
    if (!cus) return;

    // 1. Profile පින්තූරය 
    const cusImage = cus.profile_img || cus.photoUrl || cus.photo_url || cus.image;
    const imageWrapper = document.querySelector("#customerProfileModal .col-lg-4 .bg-white.rounded-circle") || 
                         document.querySelector("#customerProfileModal .col-lg-4 .mx-auto.mb-3");
                         
    if (imageWrapper) {
        imageWrapper.className = "bg-white rounded-circle shadow-sm mx-auto mb-3 overflow-hidden d-flex align-items-center justify-content-center"; 
        
        if (cusImage && cusImage !== "null" && cusImage.trim() !== "") {
            imageWrapper.innerHTML = `<img src="${cusImage}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            const formattedName = encodeURIComponent((cus.fname || "U") + " " + (cus.lname || ""));
            imageWrapper.innerHTML = `<img src="https://ui-avatars.com/api/?name=${formattedName}&background=da5586&color=fff" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
    }

    // 2. නම සහ ID එක
    document.querySelector("#customerProfileModal h5.mb-1").innerText = `${cus.fname || ""} ${cus.lname || ""}`;
    document.querySelector("#customerProfileModal p.text-muted.mb-3").innerText = `Customer ID: #${cus.id.substring(0,8)}`;
    
    // 3. Status Badge එක
    const statusBadge = document.querySelector("#customerProfileModal .col-lg-4 .badge");
    if(statusBadge){
         const isActive = (!cus.status || cus.status === "Active");
         if(isActive){
             statusBadge.className = "badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mb-4";
             statusBadge.innerText = "Active Member";
         } else {
             statusBadge.className = "badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill mb-4";
             statusBadge.innerText = "Banned Member";
         }
    }

    // 4. Contact Details සහ Address (මෙතනයි Address Logic එක හැදුවේ)
    const infoParagraphs = document.querySelectorAll("#customerProfileModal .text-start p");
    if(infoParagraphs.length >= 4) {
        infoParagraphs[0].innerHTML = `<i class="fas fa-envelope text-secondary me-2"></i> ${cus.email || "N/A"}`;
        infoParagraphs[1].innerHTML = `<i class="fas fa-phone-alt text-secondary me-2"></i> ${cus.contact_no || cus.phone || "N/A"}`;
        
        const joinedDate = cus.createdAt ? new Date(cus.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
        infoParagraphs[2].innerHTML = `<i class="fas fa-calendar-alt text-secondary me-2"></i> Joined: ${joinedDate}`;

        // Address එක ලෝඩ් කරන අලුත් කේතය
        let addressText = "Address not provided.";

        if (typeof cus.address === 'object' && cus.address !== null) {
            // Address එක Database එකේ Object/Map එකක් විදිහට තියෙනවා නම්
            let parts = [];
            if (cus.address.addressLine1) parts.push(cus.address.addressLine1);
            if (cus.address.street) parts.push(cus.address.street);
            if (cus.address.city) parts.push(cus.address.city);
            if (cus.address.district) parts.push(cus.address.district);
            
            if (parts.length > 0) addressText = parts.join(",<br>");
        } else {
            // Address එක වෙනම field විදිහට තියෙනවා නම් (street, city, ආදිය)
            const street = cus.address || cus.street || cus.addressLine1 || "";
            const city = cus.city || cus.district || "";
            const province = cus.province || cus.state || "";
            
            let addressParts = [];
            if (street && typeof street === 'string' && street.trim() !== "") addressParts.push(street);
            if (city && typeof city === 'string' && city.trim() !== "") addressParts.push(city);
            if (province && typeof province === 'string' && province.trim() !== "") addressParts.push(province);
            
            if (addressParts.length > 0) {
                addressText = addressParts.join(",<br>");
            }
        }
        
        infoParagraphs[3].innerHTML = addressText;
    }

    // 5. Total Orders & Spent
    const statCards = document.querySelectorAll("#customerProfileModal .col-lg-8 .row h4");
    if (statCards.length >= 3) {
        statCards[0].innerText = cus.totalOrders || 0;
        statCards[1].innerText = `Rs. ${(cus.totalSpent || 0).toLocaleString()}`;
        
        const avg = cus.totalOrders > 0 ? (cus.totalSpent / cus.totalOrders) : 0;
        statCards[2].innerText = `Rs. ${avg.toLocaleString()}`;
    }

    // 6. Recent Orders
    const recentOrdersTbody = document.querySelector("#customerProfileModal .table tbody");
    if(recentOrdersTbody) {
        recentOrdersTbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted" style="font-size: 13px;">Please check the Orders Management page for full order history.</td></tr>`;
    }

    const modal = new bootstrap.Modal(document.getElementById('customerProfileModal'));
    modal.show();
}