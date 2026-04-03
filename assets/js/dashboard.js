document.addEventListener('DOMContentLoaded', function () {
    setupMonthSelect();
    loadDashboardStats();
});

let salesChart;

// මාස Dropdown එකට Current Data දාන Function එක
function setupMonthSelect() {
    const monthSelect = document.querySelector("select.form-select.glass-input-pink");
    if (!monthSelect) return;

    monthSelect.innerHTML = ""; // Clear Dummy Options
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const option = document.createElement("option");
        option.value = monthName;
        option.text = monthName;
        monthSelect.appendChild(option);
    }

    // Dropdown එක වෙනස් කරද්දි Chart එක පොඩ්ඩක් animate වෙනවා පෙන්නන්න
    monthSelect.addEventListener("change", function() {
        loadDashboardStats(); 
    });
}

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

        const response = await fetch("http://localhost:8080/api/dashboard/stats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const data = result.data;

            // 1. Update H3 tags (Summary Cards)
            const statCards = document.querySelectorAll(".dash-card h3");
            if (statCards.length >= 4) {
                statCards[0].innerText = `Rs. ${(data.totalRevenue || 0).toLocaleString()}`;
                statCards[1].innerText = (data.totalOrders || 0).toLocaleString();
                statCards[2].innerText = (data.totalCustomers || 0).toLocaleString();
                statCards[3].innerText = (data.pendingOrders || 0).toLocaleString();
            }

            // 2. Update Growth Percentages
            updateGrowthUI(0, data.revGrowth);
            updateGrowthUI(1, data.ordGrowth);
            updateGrowthUI(2, data.cusGrowth);

            // 3. Update Income, Expenses, Balance
            const analyticValues = document.querySelectorAll(".card .row.mb-3 h4.fw-bold");
            if(analyticValues.length >= 3) {
                analyticValues[0].innerText = `Rs. ${(data.income || 0).toLocaleString()}`;
                analyticValues[1].innerText = `Rs. ${(data.expenses || 0).toLocaleString()}`;
                analyticValues[2].innerText = `Rs. ${(data.balance || 0).toLocaleString()}`;
            }

            // 4. Render Chart 
            renderSalesChart(data.chartLabels, data.chartData);

            // 5. Render Top Products
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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ' Rs. ' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5], color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: function (value) { return value >= 1000 ? (value / 1000) + 'k' : value; },
                        color: '#6c757d'
                    },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6c757d' },
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
        topProductsContainer.innerHTML = `<div class="col-12 py-4"><p class="text-muted m-0">No product sales data available yet.</p></div>`;
        return;
    }

    products.forEach(prod => {
        const prodHtml = `
            <div class="col-md-2 col-6">
                <div class="product-img-box glass-input-pink rounded-4 mb-3 p-3 border-0 d-flex justify-content-center align-items-center" style="height: 110px;">
                    <img src="${prod.image}" class="img-fluid" style="max-height: 80px; object-fit: contain;">
                </div>
                <h6 class="fw-bold text-dark mb-1 text-truncate" style="font-size: 14px;" title="${prod.name}">${prod.name}</h6>
                <p class="text-muted m-0" style="font-size: 12px;">${prod.qty} Pcs Sold</p>
            </div>
        `;
        topProductsContainer.innerHTML += prodHtml;
    });
}