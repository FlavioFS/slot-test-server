function main() {    
    new Vue({
        el: '#app',
        vuetify: new Vuetify(),
        data: {
            equalLinesTotal: 0,
            equalLinesChart: null,
            animalsTotal: 0,
            animalsChart: null,
            loading: false,
            axios: axios.create({
                baseURL: "https://slot-test-server2.firebaseapp.com",
                timeout: 10000,
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            })
        },
        mounted() {
            this.fetchDataFromServer();
        },
        methods: {
            fetchDataFromServer () {
                this.loading = true;
                this.axios.get('/results').then( response => {
                    if (response && response.data) {
                        this.updateGraphs(this.preprocessResults(response.data));
                    }
                }).catch(reason => {
                    console.log(reason);
                }).finally(() => {
                    this.loading = false;
                })
            },

            preprocessResults (results) {
                let equalLinesData = [0, 0, 0, 0];
                let animalsData = [];
                const ANIMAL_COUNT = 30;
                for (let i = 0; i < ANIMAL_COUNT; ++i) {
                    animalsData[i] = 0;
                }


                for (const res of results) {
                    if (res.equalLines.length >= 0 && res.equalLines.length <= 3) {
                        equalLinesData[res.equalLines.length] = (equalLinesData[res.equalLines.length] + 1) || 0;
                    }
                    for (const reel of res.reels) {
                        for (const animal of reel) {
                            animalsData[animal] = (animalsData[animal] + 1) || 0;
                        }
                    }
                }

                return {
                    rollCount: results.length,
                    equalLinesData: equalLinesData,
                    animalsData: animalsData
                };
            },

            updateGraphs (processedResults) {
                try {
                    var equalLinesCanvas = document.getElementById('equalLines').getContext('2d');
                    const tempEqualLinesData = 
                    this.equalLinesChart = new Chart(equalLinesCanvas, {
                        type: 'doughnut',
                        data: {
                            labels: EQUAL_LINES.map(x => `${x.value} line${x.value == 1 ? '' : 's'}`),
                            datasets: [{
                                label: 'Occurrences',
                                data: processedResults.equalLinesData,
                                backgroundColor: EQUAL_LINES.map(x => x.color),
                                borderColor: EQUAL_LINES.map(x => x.border),
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            title: {
                                display: false,
                                text: 'No title'
                            },
                            tooltips: {
                                callbacks: {
                                    label: function(tooltipItem, data) {
                                        var dataset = data.datasets[tooltipItem.datasetIndex];
                                        var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                                        return previousValue + currentValue;
                                    });
                                    var currentValue = dataset.data[tooltipItem.index];
                                    var percentage = (((currentValue/total) * 100)+0.5).toFixed(2);
                                    return ` ${tooltipItem.index} ${(tooltipItem.index == 1) ? 'line' : 'lines'}: ${currentValue} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    });
                    console.log(processedResults.equalLinesData.reduce((acc, next) => { acc += next }, 0));
                    this.equalLinesTotal = processedResults.equalLinesData.reduce((acc, next) => acc + next, 0) || 0;

                    var animalsCanvas = document.getElementById('animals').getContext('2d');
                    this.animalsChart = new Chart(animalsCanvas, {
                        type: 'bar',
                        data: {
                            labels: ANIMALS.map(x => x.name),
                            datasets: [{
                                label: 'Occurrences',
                                data: processedResults.animalsData,
                                backgroundColor: ANIMALS.map(x => x.color),
                                borderColor: ANIMALS.map(x => x.border),
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            legend: {
                                display: false
                            },
                            title: {
                                display: false,
                                text: 'No title'
                            },
                            tooltips: {
                                callbacks: {
                                    label: function(tooltipItem, data) {
                                        var dataset = data.datasets[tooltipItem.datasetIndex];
                                        var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                                        return previousValue + currentValue;
                                    });
                                    var currentValue = dataset.data[tooltipItem.index];
                                    var percentage = (((currentValue/total) * 100)+0.5).toFixed(2);
                                    return ` ${currentValue} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    });
                    this.animalsTotal = processedResults.animalsData.reduce((acc, next) => acc + next, 0) || 0;
                } catch (err) {
                    console.log(err);
                }
            }
        }
    })
}

document.addEventListener('DOMContentLoaded', main, false);
// window.addEventListener('load', main, false );
// document.attachEvent("onreadystatechange", main);
// window.attachEvent("onload", main);