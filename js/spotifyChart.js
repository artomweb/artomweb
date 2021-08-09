let data;
let myChart;
let config;
let toggleState = 0;
let ctx2;
let backgroundColor = "#81b29a";

function switchDots() {
    let circles = [
        document.getElementById("circle0"),
        document.getElementById("circle1"),
        document.getElementById("circle2"),
        // , document.getElementById("circle3")
    ];
    let desc = document.getElementById("spotify-desc");

    switch (toggleState) {
        case 0:
            desc.innerHTML = "On average, which days do I listen to the most music";
            break;
            // case 1:
            //     desc.innerHTML = "On average, at which time of the day do I listen to the most music";
            //     break;
        case 1:
            desc.innerHTML = "How many songs have I listened to in the last two weeks";
            break;
        case 2:
            desc.innerHTML = "All data";
            break;
    }
    circles.forEach((c) => (c.id.slice(-1) == toggleState ? (c.style.fill = "black") : (c.style.fill = "none")));
}

function spotifyToggle() {
    switchDots();
    switch (toggleState) {
        case 0:
            updateByDay();
            break;

            // case 1:
            //     updateByTime();
            //     break;

        case 1:
            updateTwoWeeks(data);
            break;

        case 2:
            updateAllData();
            break;
    }
    toggleState == 2 ? (toggleState = 0) : toggleState++;
}

async function fetchSpotify() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/1/public/full?alt=json");

    const json = await response.json();

    data = json.feed.entry.map((elt) => {
        return {
            Date: new Date(elt.gsx$date.$t),
            Value: elt.gsx$value.$t,
        };
    });

    data = data.sort(function(a, b) {
        return b.Date.getTime() - a.Date.getTime();
    });

    spotifyChart();
    spotifyToggle();
}

fetchSpotify();

// function aggregateByHour(dat) {
//     let datN = dat.map((d) => {
//         let hour = moment(d.Date).format("HH");
//         return { hofd: hour, Date: d.Date, Value: +d.Value };
//     });

//     console.log(datN);

//     let totalAvgs = _.chain(datN)
//         .groupBy("dofw")
//         .map((entries, hour) => ({
//             hofd: hour,
//             avg: Math.round(_.meanBy(entries, (entry) => entry.Value)),
//         }))
//         .value();

//     totalAvgs = _.sortBy(totalAvgs, "hofd");

//     let labels = totalAvgs.map((val) => val.hofd);
//     let avgs = totalAvgs.map((val) => val.avg);

//     return { avgs, labels };
// }

// function updateByTime() {
//     const { avgs, labels } = aggregateByHour(data);

//     // console.log(avgs);

//     if (myChart.config.type == "bar") {
//         myChart.destroy();
//         let temp = jQuery.extend(true, {}, config);

//         let minVal = _.min(avgs);

//         temp.type = "line";

//         temp.data.labels = labels;

//         let newDataset = {
//             // tension: 0.3,
//             // borderColor: "black",
//             data: avgs,
//             backgroundColor,
//             // fill: false,
//         };
//         temp.data.datasets = [newDataset];

//         // temp.options.scales.yAxes[0] = { ticks: { min: minVal / 2 } };

//         temp.options.scales.xAxes[0] = { offset: true };

//         myChart = new Chart(ctx2, temp);
//     } else {
//         myChart.data.labels = labels;
//         let newDataset = {
//             // tension: 0.3,
//             // borderColor: "black",
//             data: avgs,
//             backgroundColor,
//             // fill: false,
//         };
//         myChart.data.datasets = [newDataset];
//         myChart.options.scales = {};
//         //   console.log(myChart.data.datasets);
//         myChart.update();
//     }
// }

function updateByDay() {
    const { avgs, labels } = aggregateByDay(data);

    if (myChart.config.type == "line") {
        myChart.destroy();
        let temp = jQuery.extend(true, {}, config);

        let minVal = _.min(avgs);

        temp.type = "bar";

        temp.data.labels = labels;

        let newDataset = {
            // tension: 0.3,
            // borderColor: "black",
            data: avgs,
            backgroundColor,
            // fill: false,
        };
        temp.data.datasets = [newDataset];

        // temp.options.scales.yAxes[0] = { ticks: { min: minVal / 2 } };

        temp.options.scales.xAxes[0] = { offset: true };

        myChart = new Chart(ctx2, temp);
    } else {
        myChart.data.labels = labels;
        let newDataset = {
            // tension: 0.3,
            // borderColor: "black",
            data: avgs,
            backgroundColor,
            // fill: false,
        };
        myChart.data.datasets = [newDataset];
        myChart.options.scales = {};
        //   console.log(myChart.data.datasets);
        myChart.update();
    }
}

function aggregateByDay(dat) {
    let datN = dat.map((d) => {
        let day = moment(d.Date).format("dd");
        return { dofw: day, Date: d.Date, Value: +d.Value };
    });

    let totalAvgs = _.chain(datN)
        .groupBy("dofw")
        .map((entries, day) => ({
            dofw: day,
            avg: Math.round(_.meanBy(entries, (entry) => entry.Value)),
        }))
        .value();

    totalAvgs = _.sortBy(totalAvgs, (o) => {
        return moment(o.dofw, "dd").isoWeekday();
    });

    let labels = totalAvgs.map((val) => val.dofw);
    let avgs = totalAvgs.map((val) => val.avg);

    return { avgs, labels };
}

function aggregateByWeek(dat) {
    // console.log(moment(dat[0].Date).format("YY-M"));
    let weekAvg = _.chain(dat)
        .groupBy((d) => {
            return moment(d.Date).format("W-YYYY");
        })
        .map((entries, week) => ({
            wofy: week,
            avg: _.sumBy(entries, (entry) => +entry.Value),
        }))
        .value();

    weekAvg.sort((a, b) => moment(a.wofy, "W-YYYY") - moment(b.wofy, "W-YYYY"));

    let labels = weekAvg.map((w) => w.wofy);
    let dataWeek = weekAvg.map((w) => w.avg);

    return { dataWeek, labels };
}

function updateAllData() {
    let { dataWeek, labels } = aggregateByWeek(data);
    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: dataWeek,
        backgroundColor,
        // fill: false,
    };
    // console.log(values);

    if (myChart.config.type == "bar") {
        myChart.destroy();
        let temp = jQuery.extend(true, {}, config);

        temp.type = "line";

        temp.data.labels = labels;

        // console.log(labels, dataWeek);

        temp.data.datasets = [newDataset];

        temp.options.scales = {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }, ],
        };
    } else {
        myChart.data.labels = labels;

        // console.log(labels, dataWeek);

        myChart.data.datasets = [newDataset];

        myChart.options.scales = {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }, ],
        };

        //   console.log(myChart.data.datasets);

        myChart.update();
    }
}

function updateTwoWeeks() {
    let { rawData, labels } = processData(data);
    rawData = rawData.slice(0, 14);
    labels = labels.slice(0, 14);

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: rawData,
        backgroundColor,
        // fill: false,
    };

    if (myChart.config.type == "bar") {
        myChart.destroy();
        let temp = jQuery.extend(true, {}, config);

        temp.type = "line";

        temp.data.labels = labels;

        temp.data.datasets = [newDataset];

        temp.options.scales = {
            xAxes: [{
                type: "time",
                time: {
                    unit: "day",
                    round: "day",
                    displayFormats: {
                        day: "dd",
                    },
                },
            }, ],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
            }, ],
        };

        myChart = new Chart(ctx2, temp);
    } else {
        myChart.data.labels = labels;

        myChart.data.datasets = [newDataset];

        myChart.options.scales = {
            xAxes: [{
                type: "time",
                time: {
                    unit: "day",
                    round: "day",
                    displayFormats: {
                        day: "dd",
                    },
                },
            }, ],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
            }, ],
        };

        //   console.log(myChart.data.datasets);

        myChart.update();
    }
}

function processData(dat) {
    let labels = dat.map((e) => {
        return new Date(e.Date);
    });

    let rawData = dat.map((e) => {
        return e.Value;
    });

    return { rawData, labels };
}

function spotifyChart() {
    // let rawData = [589, 445, 483, 503, 689, 692, 634];
    // let labels = ["S", "M", "T", "W", "T", "F", "S"];

    //   console.log(currData);

    ctx2 = document.getElementById("spotifyChart").getContext("2d");
    config = {
        type: "line",
        data: {
            // labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                // data: rawData,
                backgroundColor,
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
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        // min: 5,
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

                        if (toggleState == 1) {
                            label += tooltipItem.yLabel + " average";
                        } else {
                            label += tooltipItem.yLabel + " songs";
                        }

                        // label += tooltipItem.yLabel + (toggleState == 2 ? " average" : " songs");

                        return label;
                    },

                    title: function(tooltipItem, data) {
                        let title = tooltipItem[0].xLabel;
                        if (toggleState == 1) {
                            title = moment(title, "dd").format("dddd");
                        }
                        return title;
                    },
                },
            },
        },
    };
    myChart = new Chart(ctx2, config);
    Chart.defaults.global.defaultFontColor = "#000";
}