const API_URL = 'http://localhost:8080/api/admin/orders'; 

let allOrders = [];
let currentViewingOrderId = null;
let currentFilteredOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    document.getElementById('filter-search').addEventListener('input', applyFilters);
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-date').addEventListener('change', applyFilters);

    // ================= අලුතින් දැම්ම කෑල්ල =================
    // Location එක Type කරලා ඉවර වුණාම ඉබේම Coordinates හොයනවා
    const locInput = document.getElementById('modal-input-location');
    if(locInput) {
        locInput.addEventListener('change', autoFetchCoordinates);
    }
    // ======================================================
});

// Location එකෙන් Latitude/Longitude හොයන Function එක
async function autoFetchCoordinates() {
    const locName = document.getElementById('modal-input-location').value.trim();
    const latInput = document.getElementById('modal-input-lat');
    const lngInput = document.getElementById('modal-input-lng');

    if(locName.length > 2) {
        // හොයනකල් Placeholder එක මාරු කරනවා
        latInput.value = "";
        lngInput.value = "";
        latInput.placeholder = "Searching...";
        lngInput.placeholder = "Searching...";

        try {
            // ලංකාව ඇතුළේ තැන් වඩාත් නිවැරදිව හොයන්න ', Sri Lanka' කියලා එකතු කරනවා
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locName + ', Sri Lanka')}`);
            const data = await response.json();

            if(data && data.length > 0) {
                // හොයාගත්තොත් කොටු දෙකට අගයන් දානවා (දශමස්ථාන 4කට)
                latInput.value = parseFloat(data[0].lat).toFixed(4);
                lngInput.value = parseFloat(data[0].lon).toFixed(4);
            } else {
                latInput.placeholder = "Not found (Type manually)";
                lngInput.placeholder = "Not found (Type manually)";
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            latInput.placeholder = "e.g. 6.9271";
            lngInput.placeholder = "e.g. 79.8612";
        }
    }
}

async function fetchOrders() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    if (!token) {
        Swal.fire('Error', 'Authentication token not found. Please login again.', 'error');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        allOrders = await response.json();
        currentFilteredOrders = allOrders;
        updateDashboardCounters(allOrders);
        renderOrdersTable(allOrders);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Could not load orders from server.', 'error');
    }
}

function updateDashboardCounters(orders) {
    let newCount = 0, processingCount = 0, deliveredCount = 0, cancelledCount = 0;

    orders.forEach(order => {
        if (order.status === 'Pending') newCount++;
        else if (order.status === 'Processing') processingCount++;
        else if (order.status === 'Delivered') deliveredCount++;
        else if (order.status === 'Cancelled') cancelledCount++;
    });

    document.getElementById('count-new').textContent = newCount;
    document.getElementById('count-processing').textContent = processingCount;
    document.getElementById('count-delivered').textContent = deliveredCount;
    document.getElementById('count-cancelled').textContent = cancelledCount;
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">No orders found</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const dateObj = new Date(order.orderDate);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        let statusBadge = '';
        if (order.status === 'Pending') statusBadge = '<span class="badge bg-secondary text-white rounded-pill px-3 py-2">Pending</span>';
        else if (order.status === 'Processing') statusBadge = '<span class="badge bg-warning text-dark bg-opacity-75 rounded-pill px-3 py-2">Processing</span>';
        else if (order.status === 'Shipped') statusBadge = '<span class="badge bg-info text-dark rounded-pill px-3 py-2">Shipped</span>';
        else if (order.status === 'Delivered') statusBadge = '<span class="badge bg-success text-white rounded-pill px-3 py-2">Delivered</span>';
        else if (order.status === 'Cancelled') statusBadge = '<span class="badge bg-danger text-white rounded-pill px-3 py-2">Cancelled</span>';
        else statusBadge = `<span class="badge bg-secondary text-white rounded-pill px-3 py-2">${order.status}</span>`;

        const row = `
            <tr style="border-radius: 10px;">
                <td class="fw-bold text-dark ps-3">#${order.orderId}</td>
                <td class="text-muted" style="font-size: 13px;">${dateStr}<br><small>${timeStr}</small></td>
                <td>
                    <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${order.shippingAddress ? order.shippingAddress.fullName : 'N/A'}</h6>
                    <small class="text-muted" style="font-size: 12px;">${order.shippingAddress ? order.shippingAddress.phone : 'N/A'}</small>
                </td>
                <td class="text-pinkie fw-bold">Rs. ${order.finalTotal.toLocaleString()}</td>
                <td class="text-center"><span class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-1">${order.paymentMethod}</span></td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center pe-3">
                    <button class="btn btn-sm btn-light text-primary rounded-circle shadow-sm me-1" onclick="viewOrderDetails('${order.orderId}')" data-bs-toggle="modal" data-bs-target="#orderDetailsModal"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.orderId === orderId);
    if (!order) return;

    currentViewingOrderId = orderId;

    document.getElementById('modal-order-id').textContent = `Order #${order.orderId}`;
    document.getElementById('modal-order-date').textContent = new Date(order.orderDate).toLocaleString();
    
    if (order.shippingAddress) {
        document.getElementById('modal-cus-name').textContent = order.shippingAddress.fullName;
        document.getElementById('modal-cus-phone').innerHTML = `<i class="fas fa-phone-alt me-2 text-secondary"></i>${order.shippingAddress.phone}`;
        const addressStr = `${order.shippingAddress.streetAddress},<br>${order.shippingAddress.city},<br>${order.shippingAddress.province}`;
        document.getElementById('modal-address').innerHTML = addressStr;
    }

    document.getElementById('modal-status-select').value = order.status;
    
    const locInput = document.getElementById('modal-input-location');
    const latInput = document.getElementById('modal-input-lat');
    const lngInput = document.getElementById('modal-input-lng');
    if(locInput) locInput.value = '';
    if(latInput) { latInput.value = ''; latInput.placeholder = "e.g. 6.9271"; }
    if(lngInput) { lngInput.value = ''; lngInput.placeholder = "e.g. 79.8612"; }

    const itemsBody = document.getElementById('modal-items-body');
    itemsBody.innerHTML = '';
    
    if(order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemRow = `
                <tr>
                    <td class="ps-3 py-3">
                        <div class="d-flex align-items-center">
                            <div class="product-img-box bg-white rounded-3 p-1 me-3 shadow-sm" style="width: 45px; height: 45px;">
                                <img src="${item.imageUrl || 'assets/images/placeholder.jpg'}" class="img-fluid" style="opacity: 0.9; object-fit: cover;">
                            </div>
                            <div>
                                <h6 class="mb-0 text-dark fw-bold" style="font-size: 14px;">${item.title}</h6>
                                <small class="text-muted">${item.variant || '-'}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-center align-middle fw-bold text-dark">${item.quantity}</td>
                    <td class="text-end align-middle fw-bold text-dark pe-3">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
            `;
            itemsBody.insertAdjacentHTML('beforeend', itemRow);
        });
    }

    document.getElementById('modal-subtotal').textContent = `Rs. ${order.subtotal.toLocaleString()}`;
    document.getElementById('modal-shipping').textContent = `Rs. ${order.shippingFee.toLocaleString()}`;
    document.getElementById('modal-grandtotal').textContent = `Rs. ${order.finalTotal.toLocaleString()}`;
}

async function saveOrderUpdate() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
        Swal.fire('Error', 'Authentication token not found.', 'error');
        return;
    }

    const newStatus = document.getElementById('modal-status-select').value;
    const locationName = document.getElementById('modal-input-location').value;
    const lat = parseFloat(document.getElementById('modal-input-lat').value);
    const lng = parseFloat(document.getElementById('modal-input-lng').value);
    const courier = document.getElementById('modal-input-courier').value;
    const trackingNo = document.getElementById('modal-input-tracking').value;

    const payload = {
        status: newStatus,
        location: locationName || "",
        latitude: isNaN(lat) ? 0.0 : lat,
        longitude: isNaN(lng) ? 0.0 : lng,
        courierService: courier || "",  
        trackingNumber: trackingNo || ""
    };

    try {
        const response = await fetch(`${API_URL}/${currentViewingOrderId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            Swal.fire('Updated!', 'Order status has been updated.', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
            modal.hide();
            fetchOrders();
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Failed to update order.', 'error');
    }
}

function applyFilters() {
    const searchText = document.getElementById('filter-search').value.toLowerCase().trim();
    const statusValue = document.getElementById('filter-status').value;
    const dateValue = document.getElementById('filter-date').value;

    const filteredOrders = allOrders.filter(order => {
        const orderIdStr = order.orderId ? order.orderId.toLowerCase() : '';
        const customerName = order.shippingAddress && order.shippingAddress.fullName ? order.shippingAddress.fullName.toLowerCase() : '';
        const customerPhone = order.shippingAddress && order.shippingAddress.phone ? order.shippingAddress.phone.toLowerCase() : '';
        
        const matchSearch = orderIdStr.includes(searchText) || 
                            customerName.includes(searchText) || 
                            customerPhone.includes(searchText);

        const matchStatus = (statusValue === 'All' || statusValue === 'Order Status') ? true : order.status === statusValue;

        let matchDate = true;
        if (dateValue) {
            const dateObj = new Date(order.orderDate);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const orderDateString = `${year}-${month}-${day}`;
            
            matchDate = (orderDateString === dateValue);
        }

        return matchSearch && matchStatus && matchDate;
    });

    currentFilteredOrders = filteredOrders;
    renderOrdersTable(filteredOrders);
}

function exportToCSV() {
    if (currentFilteredOrders.length === 0) {
        Swal.fire('Info', 'No orders to export.', 'info');
        return;
    }

    const headers = [
        'Order ID', 'Order Date', 'Customer Name', 'Phone', 'Address', 
        'Subtotal (Rs)', 'Shipping Fee (Rs)', 'Discount (Rs)', 'Final Total (Rs)', 
        'Payment Method', 'Status'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    currentFilteredOrders.forEach(order => {
        const dateObj = new Date(order.orderDate);
        const dateStr = dateObj.toLocaleString(); 

        const cusName = order.shippingAddress ? order.shippingAddress.fullName : 'N/A';
        const phone = order.shippingAddress ? order.shippingAddress.phone : 'N/A';
        const address = order.shippingAddress ? `${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.province}` : 'N/A';

        const escapeCSV = (text) => `"${String(text).replace(/"/g, '""')}"`;

        const row = [
            escapeCSV(order.orderId),
            escapeCSV(dateStr),
            escapeCSV(cusName),
            escapeCSV(phone),
            escapeCSV(address),
            order.subtotal,
            order.shippingFee,
            order.discount,
            order.finalTotal,
            escapeCSV(order.paymentMethod),
            escapeCSV(order.status)
        ];

        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const today = new Date().toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pinkie_Orders_${today}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// PDF Download Function for Orders
window.exportToPDF = function() {
    if (currentFilteredOrders.length === 0) {
        Swal.fire('Info', 'No orders available to export.', 'info');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape mode for wider table

    // Report Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Pinkie Store - Orders Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    doc.text(`Generated on: ${dateStr}`, 14, 30);
    
    // Add active filters info
    const statusFilter = document.getElementById('filter-status').value;
    const dateFilter = document.getElementById('filter-date').value;
    let filterText = "Filters applied: ";
    filterText += statusFilter !== 'All' ? `Status - ${statusFilter}, ` : "Status - All, ";
    filterText += dateFilter ? `Date - ${dateFilter}` : "Date - All";
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(filterText, 14, 36);

    // Table Columns
    const tableColumns = ["Order ID", "Date & Time", "Customer Name", "Phone", "Location", "Items", "Total (Rs.)", "Payment", "Status"];
    
    // Table Rows
    const tableRows = currentFilteredOrders.map(order => {
        const dateObj = new Date(order.orderDate);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const cusName = order.shippingAddress ? order.shippingAddress.fullName : 'N/A';
        const phone = order.shippingAddress ? order.shippingAddress.phone : 'N/A';
        const city = order.shippingAddress ? order.shippingAddress.city : 'N/A';
        
        const itemsCount = order.items ? order.items.length : 0;
        
        return [
            "#" + order.orderId.substring(0, 8),
            `${dateStr}\n${timeStr}`,
            cusName,
            phone,
            city,
            itemsCount,
            (order.finalTotal || 0).toLocaleString(),
            order.paymentMethod || "N/A",
            order.status || "Pending"
        ];
    });

    // Generate Table using AutoTable
    doc.autoTable({
        startY: 42,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
            fillColor: [218, 85, 134], // Pinkie theme color
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            6: { halign: 'right', fontStyle: 'bold', textColor: [218, 85, 134] },
            7: { halign: 'center' },
            8: { halign: 'center' }
        },
        styles: { 
            fontSize: 9,
            cellPadding: 3,
            valign: 'middle'
        },
        alternateRowStyles: {
            fillColor: [250, 240, 245] 
        }
    });

    // Save File
    const fileName = `Pinkie_Orders_${dateStr.replace(/ /g, "_")}.pdf`;
    doc.save(fileName);

    Swal.fire({
        icon: 'success',
        title: 'PDF Exported!',
        text: 'Orders list downloaded successfully.',
        confirmButtonColor: '#da5586',
        timer: 2000,
        showConfirmButton: false
    });
}