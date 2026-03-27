// function saveOrderUpdate() {
//     var myModalEl = document.getElementById('orderDetailsModal');
//     var modal = bootstrap.Modal.getInstance(myModalEl);
//     modal.hide();

//     Swal.fire({
//         icon: 'success',
//         title: 'Order Updated!',
//         text: 'Order status and tracking information have been saved successfully.',
//         confirmButtonColor: '#da5586',
//         timer: 2000,
//         showConfirmButton: false
//     });
// }

// Spring Boot Backend URL එක
const API_URL = 'http://localhost:8080/api/admin/orders'; 

let allOrders = [];
let currentViewingOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

// 1. Spring Boot එකෙන් Orders අරන් එනවා
async function fetchOrders() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        allOrders = await response.json();
        updateDashboardCounters(allOrders);
        renderOrdersTable(allOrders);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Could not load orders from server.', 'error');
    }
}

// 2. Dashboard එකේ ගණන් Update කරනවා
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

// 3. Table එකට Data දානවා
function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const dateObj = new Date(order.orderDate);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Status Badge වර්ණය
        let statusBadge = '';
        if (order.status === 'Pending') statusBadge = '<span class="badge bg-secondary text-white rounded-pill px-3 py-2">Pending</span>';
        else if (order.status === 'Processing') statusBadge = '<span class="badge bg-warning text-dark bg-opacity-75 rounded-pill px-3 py-2">Processing</span>';
        else if (order.status === 'Shipped') statusBadge = '<span class="badge bg-info text-dark rounded-pill px-3 py-2">Shipped</span>';
        else if (order.status === 'Delivered') statusBadge = '<span class="badge bg-success text-white rounded-pill px-3 py-2">Delivered</span>';
        else if (order.status === 'Cancelled') statusBadge = '<span class="badge bg-danger text-white rounded-pill px-3 py-2">Cancelled</span>';

        const row = `
            <tr style="border-radius: 10px;">
                <td class="fw-bold text-dark ps-3">#${order.orderId}</td>
                <td class="text-muted" style="font-size: 13px;">${dateStr}<br><small>${timeStr}</small></td>
                <td>
                    <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${order.shippingAddress.fullName}</h6>
                    <small class="text-muted" style="font-size: 12px;">${order.shippingAddress.phone}</small>
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

// 4. Modal එකට විස්තර දානවා
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.orderId === orderId);
    if (!order) return;

    currentViewingOrderId = orderId;

    document.getElementById('modal-order-id').textContent = `Order #${order.orderId}`;
    document.getElementById('modal-order-date').textContent = new Date(order.orderDate).toLocaleString();
    
    document.getElementById('modal-cus-name').textContent = order.shippingAddress.fullName;
    document.getElementById('modal-cus-phone').innerHTML = `<i class="fas fa-phone-alt me-2 text-secondary"></i>${order.shippingAddress.phone}`;
    
    const addressStr = `${order.shippingAddress.streetAddress},<br>${order.shippingAddress.city},<br>${order.shippingAddress.province}`;
    document.getElementById('modal-address').innerHTML = addressStr;

    document.getElementById('modal-status-select').value = order.status;

    // Items දානවා
    const itemsBody = document.getElementById('modal-items-body');
    itemsBody.innerHTML = '';
    order.items.forEach(item => {
        const itemRow = `
            <tr>
                <td class="ps-3 py-3">
                    <div class="d-flex align-items-center">
                        <div class="product-img-box bg-white rounded-3 p-1 me-3 shadow-sm" style="width: 45px; height: 45px;">
                            <img src="${item.imageUrl || 'assets/images/placeholder.png'}" class="img-fluid" style="opacity: 0.9; object-fit: cover;">
                        </div>
                        <div>
                            <h6 class="mb-0 text-dark fw-bold" style="font-size: 14px;">${item.title}</h6>
                            <small class="text-muted">${item.variant}</small>
                        </div>
                    </div>
                </td>
                <td class="text-center align-middle fw-bold text-dark">${item.quantity}</td>
                <td class="text-end align-middle fw-bold text-dark pe-3">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `;
        itemsBody.insertAdjacentHTML('beforeend', itemRow);
    });

    document.getElementById('modal-subtotal').textContent = `Rs. ${order.subtotal.toLocaleString()}`;
    document.getElementById('modal-shipping').textContent = `Rs. ${order.shippingFee.toLocaleString()}`;
    document.getElementById('modal-grandtotal').textContent = `Rs. ${order.finalTotal.toLocaleString()}`;
}

// 5. Spring Boot එකට Update එක යවනවා
async function saveOrderUpdate() {
    const newStatus = document.getElementById('modal-status-select').value;
    // (අවශ්‍ය නම් Courier, Tracking අගයන් අරන් යවන්නත් පුළුවන්)

    try {
        const response = await fetch(`${API_URL}/${currentViewingOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            Swal.fire('Updated!', 'Order status has been updated.', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
            modal.hide();
            fetchOrders(); // ආයෙත් Data අරන් UI එක Update කරනවා
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Failed to update order.', 'error');
    }
}