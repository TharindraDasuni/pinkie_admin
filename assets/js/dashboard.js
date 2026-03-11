  document.addEventListener('DOMContentLoaded', function () {
            setTimeout(() => {
                var ctx = document.getElementById('salesChart').getContext('2d');

                var gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(218, 85, 134, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

                var salesChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['22 July', '23 July', '24 July', '25 July', '26 July', '27 July', '28 July', '29 July'],
                        datasets: [{
                            label: 'Income',
                            data: [10000, 35000, 15000, 20000, 50000, 25000, 45000, 30000],
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
                            legend: { display: false }
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
                                        return value / 1000 + 'k';
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
            }, 100);
        });