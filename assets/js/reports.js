  function downloadReport() {
            Swal.fire({
                icon: 'success',
                title: 'Report Generated!',
                text: 'Your PDF report is downloading...',
                confirmButtonColor: '#da5586',
                timer: 2000,
                showConfirmButton: false
            });
        }

        document.addEventListener("DOMContentLoaded", function () {
            
            // 1. Bar Chart (Revenue Overview)
            const ctxSales = document.getElementById('salesChart').getContext('2d');
            new Chart(ctxSales, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Revenue (Rs.)',
                        data: [45000, 60000, 35000, 80000, 110000, 95000, 120000],
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
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });

            // 2. Doughnut Chart (Sales by Category)
            const ctxCategory = document.getElementById('categoryChart').getContext('2d');
            new Chart(ctxCategory, {
                type: 'doughnut',
                data: {
                    labels: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
                    datasets: [{
                        data: [45, 25, 20, 10],
                        backgroundColor: ['#da5586', '#f29abf', '#ffcadf', '#6c757d'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, 
                    cutout: '75%',
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

        });