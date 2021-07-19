let data;
let myChart;
let config;
let toggleState = 0;
let ctx2;
let backgroundColor = "#81b29a";

function switchDots() {
    let circles = [document.getElementById("circle0"), document.getElementById("circle1"), document.getElementById("circle2"), document.getElementById("circle3")];
    let desc = document.getElementById("spotify-desc");

    switch (toggleState) {
        case 0:
            desc.innerHTML = "Which days do I listen to the most music";
            break;
        case 1:
            desc.innerHTML = "At which time of the day do I listen to the most music";
            break;
        case 2:
            desc.innerHTML = "How many songs have I listened to in the last two weeks";
            break;
        case 3:
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

        case 1:
            updateByTime();
            break;

        case 2:
            updateTwoWeeks();
            break;

        case 3:
            updateAllData();
            break;
    }
    toggleState == 3 ? (toggleState = 0) : toggleState++;
}

async function fetchSpotify() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1HLUhT0UAgdinZsUAY4TtcKNPxLDw4NhPEBMEVEOOgmE/1/public/full?alt=json");

    const json = await response.json();

    let jsonData = json.feed.entry.map((elt) => {
        return {
            dateTime: new Date(elt.gsx$datetime.$t),
            artist: elt.gsx$artist.$t,
            song: elt.gsx$song.$t,
        };
    });

    data = jsonData.sort(function(a, b) {
        return b.dateTime.getTime() - a.dateTime.getTime();
    });

    console.log(JSON.stringify(data));

    spotifyChart();
    spotifyToggle();
}

fetchSpotify();

function aggregateByHour() {
    let hours = new Array(24).fill(0);

    let dataProc = _.chain(data)
        .countBy((d) => moment(d.dateTime).format("HH"))
        .map((count, hour) => ({ hour, count }))
        .sortBy((d) => +d.hour)
        .value();

    dataProc.forEach((d) => {
        hours[+d.hour] = d.count;
    });

    let finalData = _.map(hours, (count, hour) => {
        return { hour, count };
    });

    console.log(finalData);

    // console.log(finalData);

    let labels = finalData.map((val) => val.hour);
    let avgs = finalData.map((val) => val.count);

    return { avgs, labels };
}

function updateByTime() {
    const { avgs, labels } = aggregateByHour(data);

    // console.log(avgs);

    if (myChart.config.type == "bar") {
        myChart.destroy();
        let temp = jQuery.extend(true, {}, config);

        temp.type = "line";

        myChart = new Chart(ctx2, temp);
    }
    myChart.data.labels = labels;
    let newDataset = {
        data: avgs,
        backgroundColor,
    };
    myChart.data.datasets = [newDataset];
    // myChart.options.scales = {};
    // myChart.options.scales.xAxes[0].ticks = {
    //     beginAtZero: true,
    //     autoSkip: true,
    //     maxTicksLimit: 4,
    //     maxRotation: 0,
    //     minRotation: 0,
    //     callback: function(value, index, values) {
    //         if (+value < 12) {
    //             return value + "AM";
    //         } else {
    //             return value + "PM";
    //         }
    //     },
    // };
    //   console.log(myChart.data.datasets);
    myChart.update();
}

function aggregateByDay() {
    let dataProc = _.chain(data)
        .countBy((d) => moment(d.dateTime).format("dd"))
        .map((count, day) => ({ day, count }))
        .sortBy((d) => moment(d.day, "dd").isoWeekday())
        .value();

    // console.log(dataProc);

    let labels = dataProc.map((val) => val.day);
    let avgs = dataProc.map((val) => val.count);

    return { avgs, labels };
}

function updateByDay() {
    const { avgs, labels } = aggregateByDay();

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

function aggregateByWeek() {
    // console.log(moment(dat[0].Date).format("YY-M"));
    let weekAvg = _.chain(data)
        .countBy((d) => {
            return moment(d.dateTime).format("W-YYYY");
        })
        .map((count, day) => ({ day, count }))
        .value();

    console.log(weekAvg);

    weekAvg.sort((a, b) => moment(a.day, "W-YYYY") - moment(b.day, "W-YYYY"));

    let labels = weekAvg.map((w) => w.day);
    let dataWeek = weekAvg.map((w) => w.count);

    return { dataWeek, labels };
}

function updateAllData() {
    let { dataWeek, labels } = aggregateByWeek();
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

        myChart = new Chart(ctx2, temp);
    }
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

function updateTwoWeeks() {
    let { rawData, labels } = processData();
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

        myChart = new Chart(ctx2, temp);
    }

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
    myChart.update();
}

function processData() {
    let dataProc = _.chain(data)
        .countBy((d) => d.dateTime.toDateString())
        .map((count, day) => ({ day, count }))
        .sortBy((d) => new Date(d.day).getTime())
        .reverse()
        .value();

    // console.log(dataProc);

    let labels = dataProc.map((e) => {
        return new Date(e.day);
    });

    let rawData = dataProc.map((e) => {
        return e.count;
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