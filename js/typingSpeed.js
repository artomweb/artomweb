async function fetchMonkey() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1KAEkM0SmmBlPAdkg7vcQyYMsSsMsjKcMnDf2xJijOFo/1/public/full?alt=json");

    const json = await response.json();

    // console.log(json);

    let data = json.feed.entry.map((elt) => {
        return {
            Date: new Date(elt.gsx$date.$t),
            wpmAvg: elt.gsx$wpmavg.$t,
            rawAvg: elt.gsx$rawavg.$t,
            accAvg: elt.gsx$accavg.$t,
            corrAvg: elt.gsx$corravg.$t,
            incorrAvg: elt.gsx$incorravg.$t,
            consAvg: elt.gsx$consavg.$t,
        };
    });

    let weekAvg = _.chain(data)
        .groupBy((d) => {
            return moment(d.Date).format("MMM YYYY");
        })
        .map((entries, week) => {
            // console.log(entries);
            return {
                wofy: week,
                sum: Math.round(_.meanBy(entries, (entry) => +entry.wpmAvg) * 10) / 10,
            };
        })
        .value();

    weekAvg.sort((a, b) => moment(a.wofy, "MMM YYYY") - moment(b.wofy, "MMM YYYY"));
    console.log(weekAvg);

    // console.log(weekAvg);

    let labels = weekAvg.map((el) => el.wofy);
    let dat = weekAvg.map((el) => el.sum);

    plotMonkey(labels, dat);
}

async function fetchAnotherMonkey() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1bpABRveXtGeY5Sqlzi2ul33i8Qp-ehhSDIFaMigKGfk/1/public/full?alt=json");

    const json = await response.json();

    let data = json.feed.entry.map((elt) => {
        return {
            dateTime: new Date(elt.gsx$datetime.$t),
            wpm: elt.gsx$wpm.$t,
            raw: elt.gsx$raw.$t,
            acc: elt.gsx$acc.$t,
            corr: elt.gsx$corr.$t,
            incorr: elt.gsx$incorr.$t,
            cons: elt.gsx$cons.$t,
        };
    });

    let weekAvg = _.chain(data)
        .groupBy((d) => {
            return moment(d.dateTime).format("MMM YYYY");
        })
        .map((entries, week) => {
            // console.log(entries);
            return {
                wofy: week,
                sum: Math.round(_.meanBy(entries, (entry) => +entry.wpm) * 10) / 10,
            };
        })
        .value();

    weekAvg.sort((a, b) => moment(a.wofy, "MMM YYYY") - moment(b.wofy, "MMM YYYY"));
    // console.log(weekAvg);

    // console.log(weekAvg);

    let labels = weekAvg.map((el) => el.wofy);
    let dat = weekAvg.map((el) => el.sum);

    plotMonkey(labels, dat);

    let maxWPM = +_.maxBy(data, "wpm").wpm;
    let avgWPM = _.meanBy(data, (o) => +o.wpm).toFixed(2);
    let avgAcc = Math.round(
        _.meanBy(data, (o) => +o.acc),
        0
    );

    let delta = data.length * 30;

    let message = createTimeMessage(delta);

    document.getElementById("highestTypingSpeed").innerHTML = maxWPM.toFixed(2);
    document.getElementById("averageTypingSpeed").innerHTML = avgWPM;
    document.getElementById("averageAccuracy").innerHTML = avgAcc;
    document.getElementById("totalTime").innerHTML = message;
}

function plotMonkey(labels, dat) {
    let ctx = document.getElementById("monkeyChart").getContext("2d");

    let sleepChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: dat,
                backgroundColor: "#F4A4A4",

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
                    ticks: {
                        // autoSkip: true,
                        maxTicksLimit: 6.3,
                        stepSize: 5,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                    // type: "time",
                    // time: {
                    //     unit: "week",
                    //     round: "week",
                    //     displayFormats: {
                    //         day: "W-YYYY",
                    //     },
                    // },
                }, ],
                yAxes: [{
                    ticks: {
                        // beginAtZero: true,
                        //             callback: function(value, index, values) {
                        //                 return secondsToMins(value);
                        //             },
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
                        label += tooltipItem.yLabel + " WPM";
                        return label;
                    },
                    //         title: function(tooltipItem, data) {
                    //             let title = tooltipItem[0].xLabel;
                    //             title = moment(title, "dd").format("dddd");
                    //             return title;
                    //         },
                },
            },
        },
    });
}

// fetchMonkey();
fetchAnotherMonkey();