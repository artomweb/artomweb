async function newFetchSpotify() {
    const response = await fetch(
        "https://spreadsheets.google.com/feeds/list/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/1/public/full?alt=json"
    );

    const json = await response.json();

    let data = json.feed.entry.map((elt) => {
        return {
            Date: elt.gsx$date.$t,
            Value: elt.gsx$value.$t,
        };
    });

    spotifyChart(data);
}

newFetchSpotify();

function spotifyChart(allData) {
    // console.log(allData);

    allData.sort(function(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    if (allData.length > 14) {
        allData = allData.slice(0, 14);
    }

    let labels = allData.map(function(e) {
        return new Date(e.Date);
    });

    let data = allData.map(function(e) {
        // return e.Duration;
        return e.Value;
    });

    let ctx2 = document.getElementById("spotifyChart").getContext("2d");
    let myChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: data,
                backgroundColor: "#98c1d9",
                // fill: false,
            }, ],
        },

        options: {
            maintainAspectRatio: true,
            responsive: true,

            // layout: {
            //     padding: {
            //         left: 0,
            //         right: 25,
            //         top: 20,
            //         bottom: 20,
            //     },
            // },

            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        unit: "day",
                        round: "day",
                        displayFormats: {
                            day: "MMM D",
                        },
                    },
                }, ],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                }, ],
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let label = data.datasets[tooltipItem.datasetIndex].label || "";

                        if (label) {
                            label += ": ";
                        }

                        label += tooltipItem.yLabel + " songs";
                        return label;
                    },
                },
            },
        },
    });
    Chart.defaults.global.defaultFontColor = "#000";
}