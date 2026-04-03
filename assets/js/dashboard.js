document.addEventListener('DOMContentLoaded', function () {
    loadDashboardStats();
});

let salesChart; // Global variable for the chart

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

            // 1. Update Summary Cards (Total Revenue, Orders, Customers, Pending)
            const statCards = document.querySelectorAll(".dash-card h3");
            if (statCards.length >= 4) {
                statCards[0].innerText = `Rs. ${(data.totalRevenue || 0).toLocaleString()}`;
                statCards[1].innerText = (data.totalOrders || 0).toLocaleString();
                statCards[2].innerText = (data.totalCustomers || 0).toLocaleString();
                statCards[3].innerText = (data.pendingOrders || 0).toLocaleString();
            }

            // 2. Render Chart with real data
            renderSalesChart(data.chartLabels, data.chartData);

            // 3. Render Top Products
            renderTopProducts(data.topProducts);

        } else {
            console.error("Failed to load dashboard stats", result.message);
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
}

function renderSalesChart(labels, dataPoints) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Destroy existing chart if it exists (to prevent overlap when reloading)
    if (salesChart) {
        salesChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(218, 85, 134, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Data from Backend (e.g. ['22 July', '23 July'...])
            datasets: [{
                label: 'Income (Rs.)',
                data: dataPoints, // Data from Backend
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
                    grid: {
                        borderDash: [5, 5],
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value >= 1000 ? (value / 1000) + 'k' : value;
                        },
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
    // HTML එකේ Top Products පෙන්නන Row එක හොයාගන්නවා
    const topProductsContainer = document.querySelector(".row.g-4.text-center");
    if (!topProductsContainer) return;

    topProductsContainer.innerHTML = ""; // පරණ dummy data මකනවා

    if (!products || products.length === 0) {
        topProductsContainer.innerHTML = `<p class="text-muted text-center w-100">No product sales data available yet.</p>`;
        return;
    }

    products.forEach(prod => {
        const prodHtml = `
            <div class="col-md-2 col-6">
                <div class="product-img-box glass-input-pink rounded-4 mb-3 p-3 border-0 d-flex justify-content-center align-items-center" style="height: 110px;">
                    <img src="${prod.image}" class="img-fluid" style="max-height: 80px; object-fit: contain;">
                </div>
                <h6 class="fw-bold text-dark mb-1 text-truncate" style="font-size: 14px;" title="${prod.name}">${prod.name}</h6>
                <p class="text-muted m-0" style="font-size: 12px;">${prod.qty} Sold</p>
            </div>
        `;
        topProductsContainer.innerHTML += prodHtml;
    });
}