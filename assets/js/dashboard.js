document.addEventListener('DOMContentLoaded', function () {
    setupMonthSelect();
    setupViewAllButton();
});

let salesChart;
let allTopProducts = [];

function setupMonthSelect() {
    const monthSelect = document.querySelector("select.form-select.glass-input-pink");
    if (!monthSelect) return;

    monthSelect.innerHTML = ""; 
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const option = document.createElement("option");
        option.value = monthName;
        option.text = monthName;
        monthSelect.appendChild(option);
    }

    monthSelect.addEventListener("change", function() {
        loadDashboardStats(); 
    });

    loadDashboardStats();
}

function setupViewAllButton() {
    const viewAllBtn = document.querySelector(".card.dash-card a.text-decoration-none");
    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", function(e) {
            e.preventDefault();
            showAllProductsModal();
        });
    }
}

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        
        const monthSelect = document.querySelector("select.form-select.glass-input-pink");
        let selectedMonth = monthSelect ? monthSelect.value : "";
        let queryParams = selectedMonth ? `?monthYear=${encodeURIComponent(selectedMonth)}` : "";

        const response = await fetch(`http://localhost:8080/api/dashboard/stats${queryParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const data = result.data;

            allTopProducts = data.allProducts || [];

            const statCards = document.querySelectorAll(".dash-card h3");
            if (statCards.length >= 4) {
                statCards[0].innerText = `Rs. ${(data.totalRevenue || 0).toLocaleString()}`;
                statCards[1].innerText = (data.totalOrders || 0).toLocaleString();
                statCards[2].innerText = (data.totalCustomers || 0).toLocaleString();
                statCards[3].innerText = (data.pendingOrders || 0).toLocaleString();
            }

            updateGrowthUI(0, data.revGrowth);
            updateGrowthUI(1, data.ordGrowth);
            updateGrowthUI(2, data.cusGrowth);

            const analyticValues = document.querySelectorAll(".card .row.mb-3 h4.fw-bold");
            if(analyticValues.length >= 3) {
                analyticValues[0].innerText = `Rs. ${(data.income || 0).toLocaleString()}`;
                analyticValues[1].innerText = `Rs. ${(data.expenses || 0).toLocaleString()}`;
                analyticValues[2].innerText = `Rs. ${(data.balance || 0).toLocaleString()}`;
            }

            renderSalesChart(data.chartLabels, data.chartData);
            renderTopProducts(data.topProducts);

        } else {
            console.error("Failed to load dashboard stats", result.message);
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
}

function updateGrowthUI(index, growthValue) {
    const spanElements = document.querySelectorAll(".dash-card p.mb-0 span.fw-bold");
    if(spanElements[index]) {
        const span = spanElements[index];
        const isPositive = growthValue >= 0;
        
        const textClass = isPositive ? "text-success" : "text-danger";
        const iconClass = isPositive ? "fa-arrow-up" : "fa-arrow-down";
        
        span.className = `${textClass} fw-bold`;
        span.innerHTML = `<i class="fas ${iconClass}"></i> ${Math.abs(growthValue).toFixed(1)}%`;
    }
}

function renderSalesChart(labels, dataPoints) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    if (salesChart) {
        salesChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(218, 85, 134, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [{
                label: 'Income (Rs.)',
                data: dataPoints,
                borderColor: '#da5586',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#da5586',
                pointBorderWidth: 2,
                pointRadius: 5,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function(context) { return ' Rs. ' + context.raw.toLocaleString(); } } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5], color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { callback: function (value) { return value >= 1000 ? (value / 1000) + 'k' : value; }, color: '#6c757d' },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6c757d', maxTicksLimit: 10 },
                    border: { display: false }
                }
            }
        }
    });
}

function renderTopProducts(products) {
    const topProductsContainer = document.querySelector(".row.g-4.text-center");
    if (!topProductsContainer) return;

    topProductsContainer.innerHTML = ""; 

    if (!products || products.length === 0) {
        topProductsContainer.innerHTML = `<div class="col-12 py-4"><p class="text-muted m-0">No product sales data available.</p></div>`;
        return;
    }

    products.forEach(prod => {
        const prodName = prod.name || "Unknown Item";
        const prodImage = prod.image || "https://cdn-icons-png.flaticon.com/512/1004/1004389.png";
        const prodQty = prod.qty || 0;
        
        const prodHtml = `
            <div class="col-md-2 col-6">
                <div class="product-img-box glass-input-pink rounded-4 mb-3 p-3 border-0 d-flex justify-content-center align-items-center" style="height: 110px;">
                    <img src="${prodImage}" class="img-fluid" style="max-height: 80px; object-fit: contain;">
                </div>
                <h6 class="fw-bold text-dark mb-1 text-truncate" style="font-size: 14px;" title="${prodName}">${prodName}</h6>
                <p class="text-muted m-0" style="font-size: 12px;">${prodQty} Pcs Sold</p>
            </div>
        `;
        topProductsContainer.innerHTML += prodHtml;
    });
}

function showAllProductsModal() {
    let modalEl = document.getElementById('allProductsModal');
    
    if (!modalEl) {
        const modalHtml = `
        <div class="modal fade" id="allProductsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content glass-panel rounded-4 border-0 shadow-lg" style="backdrop-filter: blur(25px);">
                    <div class="modal-header border-bottom-0 pb-2 px-4 pt-4">
                        <h5 class="modal-title fw-bold text-dark m-0"><i class="fas fa-gem text-pinkie me-2"></i> All Selling Jewelry</h5>
                        <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body px-4 pt-2 pb-4">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0 glass-table">
                                <thead style="background: rgba(218,85,134,0.08);">
                                    <tr>
                                        <th scope="col" class="text-muted ps-3 py-2" style="font-size: 12px;">PRODUCT INFO</th>
                                        <th scope="col" class="text-center text-muted py-2" style="font-size: 12px;">TOTAL SOLD</th>
                                    </tr>
                                </thead>
                                <tbody id="allProductsTableBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalEl = document.getElementById('allProductsModal');
    }

    const tbody = document.getElementById('allProductsTableBody');
    tbody.innerHTML = "";

    if (allTopProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">No products found.</td></tr>`;
    } else {
        allTopProducts.forEach((prod, index) => {
            const prodName = prod.name || "Unknown Item";
            const prodImage = prod.image || "https://cdn-icons-png.flaticon.com/512/1004/1004389.png";
            const prodQty = prod.qty || 0;
            
            const row = `
                <tr>
                    <td class="ps-3 py-2">
                        <div class="d-flex align-items-center">
                            <span class="text-muted me-3 fw-bold" style="font-size: 14px;">#${index + 1}</span>
                            <div class="product-img-box glass-input-pink rounded-3 p-2 me-3 border-0 d-flex justify-content-center align-items-center" style="width: 50px; height: 50px;">
                                <img src="${prodImage}" style="max-height: 40px; object-fit: contain;">
                            </div>
                            <h6 class="fw-bold text-dark mb-0" style="font-size: 14px;">${prodName}</h6>
                        </div>
                    </td>
                    <td class="text-center py-2 fw-bold text-pinkie" style="font-size: 14px;">${prodQty} Pcs</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}