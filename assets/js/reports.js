document.addEventListener('DOMContentLoaded', function () {
    setDefaultDates();
    setupGenerateButton();
    generateReport(); // Initial load
});

let salesLineChart;
let categoryPieChart;

// මුලින්ම පේජ් එකට එද්දි අන්තිම දවස් 7 Select කරලා තියන්න
function setDefaultDates() {
    const endDateInput = document.querySelectorAll("input[type='date']")[1];
    const startDateInput = document.querySelectorAll("input[type='date']")[0];
    
    if (endDateInput && startDateInput) {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = lastWeek.toISOString().split('T')[0];
    }
}

function setupGenerateButton() {
    const generateBtn = document.querySelector(".btn-outline-pinkie");
    if (generateBtn) {
        generateBtn.addEventListener("click", generateReport);
    }
}

async function generateReport() {
    try {
        Swal.fire({ title: 'Generating Report...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        
        const startDate = document.querySelectorAll("input[type='date']")[0].value;
        const endDate = document.querySelectorAll("input[type='date']")[1].value;
        const reportType = document.querySelector("select.form-select").value;

        const response = await fetch(`http://localhost:8080/api/reports/generate?startDate=${startDate}&endDate=${endDate}&reportType=${reportType}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        Swal.close();

        if (response.ok && result.success) {
            const data = result.data;

            // 1. Update Summary Cards
            const summaryCards = document.querySelectorAll(".dash-card h4.fw-bold");
            if (summaryCards.length >= 4) {
                summaryCards[0].innerText = `Rs. ${(data.totalRevenue || 0).toLocaleString()}`;
                summaryCards[1].innerText = (data.totalOrders || 0).toLocaleString();
                summaryCards[2].innerText = `Rs. ${(data.avgOrderValue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                summaryCards[3].innerText = `Rs. ${(data.netProfit || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            }

            // 2. Render Line Chart
            renderSalesChart(data.chartLabels, data.chartData);

            // 3. Render Category Chart (Pie/Doughnut)
            renderCategoryChart(data.categoryLabels, data.categoryData);

            // 4. Update Table
            renderProductsTable(data.topProducts);

            // Title එක Date අනුව වෙනස් කිරීම
            document.querySelector("h6.fw-bold.text-dark").innerText = `Revenue Overview (${startDate} to ${endDate})`;

        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Connection failed.', 'error');
    }
}

function renderSalesChart(labels, dataPoints) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesLineChart) salesLineChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(218, 85, 134, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    salesLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [{
                label: 'Revenue (Rs.)',
                data: dataPoints,
                borderColor: '#da5586',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#da5586',
                pointRadius: 4,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5] }, ticks: { callback: v => v >= 1000 ? (v/1000)+'k' : v } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderCategoryChart(labels, dataPoints) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (categoryPieChart) categoryPieChart.destroy();

    // Pinkie Theme Colors for Pie Chart
    const colors = ['#da5586', '#f28eac', '#ffb3c6', '#ffcbf2', '#f3d2c1', '#a0587c'];

    categoryPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: {size: 11} } }
            }
        }
    });
}

function renderProductsTable(products) {
    const tbody = document.querySelector(".glass-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No sales data found for this period.</td></tr>`;
        return;
    }

    products.forEach(prod => {
        const rowHtml = `
            <tr style="border-radius: 10px;">
                <td class="fw-bold text-muted ps-3" style="font-size: 13px;">#${prod.id.length > 8 ? prod.id.substring(0,8) : prod.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="product-img-box glass-input-pink rounded-3 p-1 me-3 bg-white" style="width: 40px; height: 40px; display:flex; align-items:center; justify-content:center;">
                            <img src="${prod.image}" style="max-height: 35px; object-fit: contain;">
                        </div>
                        <h6 class="mb-0 fw-bold text-dark text-truncate" style="font-size: 14px; max-width: 250px;" title="${prod.title}">${prod.title}</h6>
                    </div>
                </td>
                <td class="text-muted" style="font-size: 13px;">${prod.category}</td>
                <td class="text-center fw-bold text-dark">${prod.qty}</td>
                <td class="text-end fw-bold text-pinkie pe-3">Rs. ${prod.revenue.toLocaleString()}</td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });
}

// PDF Download Function
window.downloadReport = function() {
    Swal.fire({
        title: 'Generating PDF...',
        text: 'Please wait while we capture the report.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const reportContent = document.querySelector(".container-fluid"); // මුළු රිපෝට් එකම අල්ලගන්නවා

    html2canvas(reportContent, { scale: 2, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        
        // A4 ප්‍රමාණයට PDF එක හදනවා
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        
        const startDate = document.querySelectorAll("input[type='date']")[0].value;
        const endDate = document.querySelectorAll("input[type='date']")[1].value;
        
        pdf.save(`Pinkie_Report_${startDate}_to_${endDate}.pdf`);
        Swal.close();
        Swal.fire('Success!', 'Report downloaded successfully.', 'success');
    }).catch(err => {
        Swal.close();
        Swal.fire('Error', 'Failed to generate PDF.', 'error');
        console.error(err);
    });
}