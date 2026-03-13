function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    window.salesChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['22 July', '23 July', '24 July', '25 July', '26 July', '27 July', '28 July', '29 July'],
            datasets: [{
                label: 'Income',
                data: [10000, 35000, 15000, 20000, 50000, 25000, 45000, 30000],
                borderColor: '#da5586',
                backgroundColor: isDark ? 'rgba(218, 85, 134, 0.15)' : 'rgba(218, 85, 134, 0.05)',
                borderWidth: 3,
                pointBackgroundColor: isDark ? '#251f23' : '#fff',
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
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDark ? 'rgba(239, 128, 172, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: isDark ? '#bcb0b9' : '#6c757d',
                        callback: function(value) {
                            return value / 1000 + 'k';
                        }
                    },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#bcb0b9' : '#6c757d' },
                    border: { display: false }
                }
            }
        }
    });
}

// Initialize chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initSalesChart();
    }, 100);
});

// Re-initialize chart when theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            if (window.salesChart && typeof window.salesChart.destroy === 'function') {
                window.salesChart.destroy();
                initSalesChart();
            }
        }
    });
});

observer.observe(document.documentElement, { attributes: true });