let salesBarChart;
let categoryDoughnutChart;
let currentReportData = null; // PDF එකට Data තියාගන්න

document.addEventListener("DOMContentLoaded", function () {
    setDefaultDates();
    fetchReportData(); // Initial Load

    // Generate Button Click Event
    const generateBtn = document.querySelector(".btn-outline-pinkie");
    if (generateBtn) {
        generateBtn.addEventListener("click", fetchReportData);
    }
});

// අද දවස සහ දවස් 7කට කලින් දවස Input වලට Set කිරීම
function setDefaultDates() {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);

    const dateInputs = document.querySelectorAll("input[type='date']");
    if (dateInputs.length >= 2) {
        dateInputs[0].value = lastWeek.toISOString().split('T')[0];
        dateInputs[1].value = today.toISOString().split('T')[0];
    }
}

async function fetchReportData() {
    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        
        const dateInputs = document.querySelectorAll("input[type='date']");
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;

        // Loading පෙන්වීම
        Swal.fire({ title: 'Generating Report...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const response = await fetch(`http://localhost:8080/api/reports/generate?startDate=${startDate}&endDate=${endDate}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        Swal.close();

        if (response.ok && result.success) {
            currentReportData = result.data;
            updateSummaryCards(currentReportData.summary);
            renderBarChart(currentReportData.barChart.labels, currentReportData.barChart.data);
            renderDoughnutChart(currentReportData.doughnutChart.labels, currentReportData.doughnutChart.data);
            renderTopProductsTable(currentReportData.topProducts);
        } else {
            Swal.fire("Error", "Failed to generate report.", "error");
        }
    } catch (error) {
        console.error("Report Error:", error);
        Swal.fire("Error", "Connection failed.", "error");
    }
}

function updateSummaryCards(summary) {
    const statCards = document.querySelectorAll(".dash-card h4");
    if (statCards.length >= 4) {
        statCards[0].innerText = `Rs. ${(summary.totalRevenue || 0).toLocaleString()}`;
        statCards[1].innerText = (summary.totalOrders || 0).toLocaleString();
        statCards[2].innerText = `Rs. ${(summary.avgOrderValue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
        statCards[3].innerText = `Rs. ${(summary.netProfit || 0).toLocaleString()}`;
    }
}

function renderBarChart(labels, data) {
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    if (salesBarChart) salesBarChart.destroy();

    salesBarChart = new Chart(ctxSales, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (Rs.)',
                data: data,
                backgroundColor: 'rgba(218, 85, 134, 0.7)',
                hoverBackgroundColor: '#da5586',
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderDoughnutChart(labels, data) {
    const ctxCategory = document.getElementById('categoryChart').getContext('2d');
    if (categoryDoughnutChart) categoryDoughnutChart.destroy();

    // Default colors for categories
    const colors = ['#da5586', '#f29abf', '#ffcadf', '#6c757d', '#343a40', '#adb5bd'];

    categoryDoughnutChart = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderTopProductsTable(products) {
    const tbody = document.querySelector(".glass-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No products sold in this period.</td></tr>`;
        return;
    }

    products.forEach((prod, index) => {
        const idStr = `100${index + 1}`; // Generating a simple display ID
        const row = `
            <tr style="border-radius: 10px;">
                <td class="fw-bold text-muted ps-3">${idStr}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="product-img-box glass-input-pink rounded-3 p-1 me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <img src="${prod.image}" class="img-fluid" style="max-height: 30px; object-fit: contain;">
                        </div>
                        <h6 class="mb-0 fw-bold text-dark text-truncate" style="font-size: 14px; max-width: 200px;" title="${prod.name}">${prod.name}</h6>
                    </div>
                </td>
                <td class="text-muted" style="font-size: 13px;">${prod.category}</td>
                <td class="text-center fw-bold text-dark">${prod.qty}</td>
                <td class="text-end fw-bold text-pinkie pe-3">Rs. ${(prod.revenue || 0).toLocaleString()}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// PDF Download Function (Uses real Data!)
window.downloadReport = function() {
    if (!currentReportData) {
        Swal.fire("Warning", "Please generate the report first.", "warning");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const dateInputs = document.querySelectorAll("input[type='date']");
    const startDate = dateInputs[0].value;
    const endDate = dateInputs[1].value;

    // Report Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Pinkie Store - Sales & Performance Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report Period: ${startDate} to ${endDate}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Summary Section
    doc.setFontSize(13);
    doc.setTextColor(218, 85, 134); // Pinkie Color
    doc.text("Executive Summary", 14, 50);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total Revenue: Rs. ${currentReportData.summary.totalRevenue.toLocaleString()}`, 14, 60);
    doc.text(`Total Orders: ${currentReportData.summary.totalOrders}`, 14, 68);
    doc.text(`Average Order Value: Rs. ${currentReportData.summary.avgOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 14, 76);
    doc.text(`Estimated Net Profit: Rs. ${currentReportData.summary.netProfit.toLocaleString()}`, 14, 84);

    // Table Data
    const tableColumns = ["#", "Product Name", "Category", "Units Sold", "Total Revenue (Rs.)"];
    const tableRows = currentReportData.topProducts.map((prod, index) => [
        index + 1,
        prod.name,
        prod.category,
        prod.qty,
        prod.revenue.toLocaleString()
    ]);

    // Generate Table
    doc.autoTable({
        startY: 95,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [218, 85, 134], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 }
    });

    // Save File
    doc.save(`Pinkie_Report_${startDate}_to_${endDate}.pdf`);

    Swal.fire({
        icon: 'success',
        title: 'Report Downloaded!',
        confirmButtonColor: '#da5586',
        timer: 2000,
        showConfirmButton: false
    });
}

// CSV Download Function (Excel වලින් Open කරන්න පුළුවන් විදිහට)
window.exportToCSV = function() {
    if (!currentReportData) {
        Swal.fire("Warning", "Please generate the report first.", "warning");
        return;
    }

    const dateInputs = document.querySelectorAll("input[type='date']");
    const startDate = dateInputs[0].value;
    const endDate = dateInputs[1].value;

    // CSV එකේ අඩංගු විය යුතු දත්ත String එකක් විදිහට හදාගන්නවා
    let csvContent = "";

    // 1. Report Header
    csvContent += "Pinkie Store - Sales & Performance Report\n";
    csvContent += `Report Period:,${startDate} to ${endDate}\n`;
    csvContent += `Generated on:,${new Date().toLocaleDateString()}\n\n`;

    // 2. Summary Section
    csvContent += "Executive Summary\n";
    csvContent += `Total Revenue (Rs.),${currentReportData.summary.totalRevenue}\n`;
    csvContent += `Total Orders,${currentReportData.summary.totalOrders}\n`;
    csvContent += `Average Order Value (Rs.),${currentReportData.summary.avgOrderValue.toFixed(2)}\n`;
    csvContent += `Estimated Net Profit (Rs.),${currentReportData.summary.netProfit.toFixed(2)}\n\n`;

    // 3. Table Headers
    csvContent += "ID,Product Name,Category,Units Sold,Total Revenue (Rs.)\n";

    // 4. Table Rows (භාණ්ඩ වල නම් වල කොමා (,) තිබ්බොත් CSV එක කැඩෙන නිසා නම Quotes ("") ඇතුලට දානවා)
    if (currentReportData.topProducts && currentReportData.topProducts.length > 0) {
        currentReportData.topProducts.forEach((prod, index) => {
            let safeName = prod.name ? prod.name.replace(/"/g, '""') : "Unknown"; // Quotes replace කරනවා
            let row = `${index + 1},"${safeName}",${prod.category},${prod.qty},${prod.revenue}`;
            csvContent += row + "\n";
        });
    } else {
        csvContent += "No products sold in this period.\n";
    }

    // 5. Blob එකක් හරහා File එක Download කිරීම (Support for all modern browsers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Pinkie_Report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Success Alert
    Swal.fire({
        icon: 'success',
        title: 'CSV Exported!',
        text: 'Report downloaded successfully.',
        confirmButtonColor: '#da5586',
        timer: 2000,
        showConfirmButton: false
    });
}