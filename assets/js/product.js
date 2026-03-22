document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

async function loadProducts() {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) return;

    const tableBody = document.querySelector("#page-content-wrapper tbody");
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i>Loading Products...</td></tr>`;

    try {
        const response = await fetch("http://localhost:8080/api/products/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const products = result.data;
            
            let total = products.length;
            let published = 0;
            let lowStock = 0;
            let outOfStock = 0;

            if (tableBody) tableBody.innerHTML = ""; 

            if (total === 0 && tableBody) {
                tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No products found. Add a new one!</td></tr>`;
            }

            products.forEach(p => {
                if (p.status === "Published") published++;
                if (p.stock === 0) outOfStock++;
                else if (p.stock <= 10) lowStock++;

                if (tableBody) {
                    let stockBadge = "";
                    if (p.stock === 0) {
                        stockBadge = `<span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">Out of Stock</span>`;
                    } else if (p.stock <= 10) {
                        stockBadge = `<span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">${p.stock} Low Stock</span>`;
                    } else {
                        stockBadge = `<span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">${p.stock} in stock</span>`;
                    }

                    let statusBtn = p.status === "Published"
                        ? `<button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" style="font-size: 12px;"><i class="fas fa-eye me-1"></i> Published</button>`
                        : `<button class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" style="font-size: 12px;"><i class="fas fa-eye-slash me-1"></i> Hidden</button>`;

                    const row = `
                        <tr>
                            <td class="fw-bold text-muted ps-4" style="font-size: 13px;">${p.id}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="product-img-box glass-input-pink rounded-3 p-1 me-3" style="width: 45px; height: 45px;">
                                        <img src="${p.mainImage || 'assets/images/placeholder.jpg'}" class="img-fluid w-100 h-100 rounded-2" style="object-fit: cover;">
                                    </div>
                                    <div><h6 class="mb-0 fw-bold text-dark" style="font-size: 13px;">${p.title}</h6></div>
                                </div>
                            </td>
                            <td class="text-muted" style="font-size: 13px;">${p.categoryName || '-'}</td>
                            <td class="text-muted" style="font-size: 13px;">${p.typeName || '-'}</td>
                            <td class="text-muted" style="font-size: 13px;">${p.materialName || '-'}</td>
                            <td class="fw-bold text-dark" style="font-size: 13px;">Rs. ${p.price.toLocaleString()}</td>
                            <td class="text-center">${stockBadge}</td>
                            <td class="text-center">
                                <div class="dropdown">
                                    ${statusBtn}
                                    <ul class="dropdown-menu shadow-sm rounded-3 border-0" style="font-size: 13px;">
                                        <li><a class="dropdown-item text-success fw-bold" href="#" onclick="changeStatus(event, '${p.id}', 'Published')"><i class="fas fa-eye me-2"></i> Published</a></li>
                                        <li><a class="dropdown-item text-secondary fw-bold" href="#" onclick="changeStatus(event, '${p.id}', 'Hidden')"><i class="fas fa-eye-slash me-2"></i> Hidden</a></li>
                                    </ul>
                                </div>
                            </td>
                            <td class="text-end pe-4">
                                <a href="add-product.html?mode=edit&id=${p.id}" class="btn btn-sm btn-light text-primary shadow-sm rounded-circle me-1" style="width: 32px; height: 32px; padding-top: 5px;" title="Edit"><i class="fas fa-pen"></i></a>
                                <button class="btn btn-sm btn-light text-danger shadow-sm rounded-circle" style="width: 32px; height: 32px;" title="Delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                }
            });

            const cardValues = document.querySelectorAll(".dash-card h3");
            if (cardValues.length >= 4) {
                cardValues[0].innerText = total.toLocaleString();
                cardValues[1].innerText = published.toLocaleString();
                cardValues[2].innerText = lowStock.toLocaleString();
                cardValues[3].innerText = outOfStock.toLocaleString();
            }
        }
    } catch (error) {
        console.error("Failed to load products", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">Error loading data</td></tr>`;
    }
}

async function changeStatus(event, id, newStatus) {
    event.preventDefault();
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    
    try {
        const response = await fetch(`http://localhost:8080/api/products/change-status/${id}?status=${newStatus}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
            loadProducts();
        } else {
            Swal.fire('Failed', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Connection failed.', 'error');
    }
}

function deleteProduct(id) {
    Swal.fire({
        title: 'Are you sure?', text: "Do you want to delete this product?", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#da5586', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
            Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(`http://localhost:8080/api/products/delete/${id}`, {
                    method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire('Deleted!', 'Product has been deleted.', 'success').then(() => loadProducts());
                } else {
                    Swal.fire('Failed', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Connection failed.', 'error');
            }
        }
    });
}