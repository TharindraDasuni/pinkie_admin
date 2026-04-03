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
        
        const cusFName = cus.firstName || cus.fname || "";
        const cusLName = cus.lastName || cus.lname || "";
        const cusPhone = cus.mobile || cus.contact_no || cus.phone || "No Phone";

        const joinedDate = cus.createdAt ? new Date(cus.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
        
        let avatarHtml = "";
        const cusImage = cus.profile_img || cus.photoUrl || cus.photo_url || cus.image;

        if (cusImage && cusImage !== "null" && cusImage.trim() !== "") {
            avatarHtml = `<img src="${cusImage}" class="rounded-circle shadow-sm border" width="40" height="40" style="object-fit: cover;">`;
        } else {
            const formattedName = encodeURIComponent((cusFName || "U") + " " + cusLName);
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
                            <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${cusFName} ${cusLName}</h6>
                            <small class="text-muted" style="font-size: 12px;">${cus.email || "No Email"} | ${cusPhone}</small>
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
                    <button class="btn btn-sm btn-light ${banButtonColor} rounded-circle shadow-sm" title="${banButtonTitle}" onclick="toggleCustomerStatus('${cus.id}', '${targetStatus}', '${cusFName}')">
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
            const fullName = `${cus.firstName || cus.fname || ""} ${cus.lastName || cus.lname || ""}`.toLowerCase();
            const email = (cus.email || "").toLowerCase();
            const phone = (cus.mobile || cus.contact_no || "").toLowerCase();
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

    const cusFName = cus.firstName || cus.fname || "";
    const cusLName = cus.lastName || cus.lname || "";
    const cusPhone = cus.mobile || cus.contact_no || cus.phone || "N/A";

    const cusImage = cus.profile_img || cus.photoUrl || cus.photo_url || cus.image;

    const imageWrapper = document.querySelector("#customerProfileModal .col-lg-4 .bg-white.rounded-circle") || 
                         document.querySelector("#customerProfileModal .col-lg-4 .mx-auto.mb-3");
                         
    if (imageWrapper) {
        imageWrapper.className = "bg-white rounded-circle shadow-sm mx-auto mb-3 overflow-hidden d-flex align-items-center justify-content-center"; 
        
        if (cusImage && cusImage !== "null" && cusImage.trim() !== "") {
            imageWrapper.innerHTML = `<img src="${cusImage}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            const formattedName = encodeURIComponent((cusFName || "U") + " " + cusLName);
            imageWrapper.innerHTML = `<img src="https://ui-avatars.com/api/?name=${formattedName}&background=da5586&color=fff" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
    }

    document.querySelector("#customerProfileModal h5.mb-1").innerText = `${cusFName} ${cusLName}`;
    document.querySelector("#customerProfileModal p.text-muted.mb-3").innerText = `Customer ID: #${cus.id.substring(0,8)}`;
    
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

    const infoParagraphs = document.querySelectorAll("#customerProfileModal .text-start p");
    if(infoParagraphs.length >= 4) {
        infoParagraphs[0].innerHTML = `<i class="fas fa-envelope text-secondary me-2"></i> ${cus.email || "N/A"}`;
        infoParagraphs[1].innerHTML = `<i class="fas fa-phone-alt text-secondary me-2"></i> ${cusPhone}`;
        
        const joinedDate = cus.createdAt ? new Date(cus.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
        infoParagraphs[2].innerHTML = `<i class="fas fa-calendar-alt text-secondary me-2"></i> Joined: ${joinedDate}`;

        let addressText = "Address not provided.";
        if (cus.addressMap) {
            let parts = [];
            if (cus.addressMap.streetAddress) parts.push(cus.addressMap.streetAddress);
            if (cus.addressMap.city) parts.push(cus.addressMap.city);
            if (cus.addressMap.district) parts.push(cus.addressMap.district);
            if (cus.addressMap.province) parts.push(cus.addressMap.province);
            if (cus.addressMap.postalCode) parts.push(cus.addressMap.postalCode);
            
            if (parts.length > 0) addressText = parts.join(",<br>");
        } 
        infoParagraphs[3].innerHTML = addressText;
    }

    const statCards = document.querySelectorAll("#customerProfileModal .col-lg-8 .row h4");
    if (statCards.length >= 3) {
        statCards[0].innerText = cus.totalOrders || 0;
        statCards[1].innerText = `Rs. ${(cus.totalSpent || 0).toLocaleString()}`;
        
        const avg = cus.totalOrders > 0 ? (cus.totalSpent / cus.totalOrders) : 0;
        statCards[2].innerText = `Rs. ${avg.toLocaleString()}`;
    }

    const recentOrdersTbody = document.querySelector("#customerProfileModal .table tbody");
    if(recentOrdersTbody) {
        recentOrdersTbody.innerHTML = "";

        if (cus.recentOrders && cus.recentOrders.length > 0) {
            cus.recentOrders.forEach(order => {
                const orderId = order.orderId || "N/A";
                const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
                const itemsCount = order.items && Array.isArray(order.items) ? order.items.length : 0;
                const total = order.finalTotal || order.total || order.subtotal || 0;
                
                let statusClass = "bg-warning text-dark";
                const statusStr = order.status || "Pending";
                
                if (statusStr.toLowerCase() === "delivered" || statusStr.toLowerCase() === "completed") {
                    statusClass = "bg-success text-white";
                } else if (statusStr.toLowerCase() === "cancelled") {
                    statusClass = "bg-danger text-white";
                }

                const rowHtml = `
                    <tr>
                        <td class="ps-3 py-2 fw-bold text-dark" style="font-size: 13px;">#${orderId.substring(0,8)}</td>
                        <td class="py-2 text-muted" style="font-size: 13px;">${orderDate}</td>
                        <td class="py-2 text-muted" style="font-size: 13px;">${itemsCount} Items</td>
                        <td class="py-2 fw-bold text-pinkie" style="font-size: 13px;">Rs. ${total.toLocaleString()}</td>
                        <td class="py-2 text-center">
                            <span class="badge ${statusClass} px-2 rounded-pill" style="font-size: 11px;">${statusStr}</span>
                        </td>
                    </tr>
                `;
                recentOrdersTbody.innerHTML += rowHtml;
            });
        } else {
            recentOrdersTbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted" style="font-size: 13px;">No recent orders found for this customer.</td></tr>`;
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('customerProfileModal'));
    modal.show();
}

window.exportToPDF = function() {
    if (allCustomers.length === 0) {
        Swal.fire('Info', 'No customers data available to export.', 'info');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Pinkie Store - Customers Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    const tableColumns = ["ID", "Full Name", "Email", "Phone", "Joined Date", "Orders", "Spent (Rs.)", "Status"];
    
    const tableRows = allCustomers.map(cus => {
        const cusFName = cus.firstName || cus.fname || "";
        const cusLName = cus.lastName || cus.lname || "";
        const joinedDate = cus.createdAt ? new Date(cus.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "N/A";
        const statusStr = (!cus.status || cus.status === "Active") ? "Active" : "Banned";

        return [
            cus.id.substring(0, 8),
            `${cusFName} ${cusLName}`.trim(),
            cus.email || "N/A",
            cus.mobile || cus.contact_no || cus.phone || "N/A",
            joinedDate,
            cus.totalOrders || 0,
            (cus.totalSpent || 0).toLocaleString(),
            statusStr
        ];
    });

    doc.autoTable({
        startY: 36,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
            fillColor: [218, 85, 134],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 9,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [250, 240, 245]
        }
    });

    doc.save(`Pinkie_Customers_${dateStr.replace(/ /g, "_")}.pdf`);
}