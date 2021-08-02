async function fetchHealth() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1CIYOalNR0s8359XEJRbpMfnixpXUIfuHOL1o_IQfn4E/1/public/full?alt=json");

    const json = await response.json();

    // console.log(json);

    let data = json.feed.entry.map((elt) => {
        return {
            Date: new Date(elt.gsx$date.$t),
            SleepDuration: elt.gsx$sleepduration.$t,
            AwakeDuration: elt.gsx$awakeduration.$t,
            BedIn: elt.gsx$bedin.$t,
            BedOut: elt.gsx$bedout.$t,
            DeepDuration: elt.gsx$deepduration.$t,
            LightDuration: elt.gsx$lightduration.$t,
            HrAverage: elt.gsx$hraverage.$t,
            nbawake: elt.gsx$nbawake.$t,
            SleepScore: elt.gsx$sleepscore.$t,
        };
    });

    data = data.sort(function(a, b) {
        return b.Date.getTime() - a.Date.getTime();
    });

    // console.log(data);

    plotSleep(data);

    // plotDailySleep(data)
}

fetchHealth();

function aggregateSleepByDay(data) {
    let dailyAvg = _.chain(data)
        .groupBy((d) => {
            return moment(d.Date).format("dd");
        })
        .map((entries, week) => ({
            dofw: week,
            avg: _.meanBy(entries, (entry) => +entry.SleepDuration),
        }))
        .sortBy((o) => moment(o.dofw, "dd").isoWeekday())
        .value();

    let labels = dailyAvg.map((w) => w.dofw);
    let dataDay = dailyAvg.map((w) => w.avg);

    // console.log(dailyAvg);

    return { dataDay, labels };
}

function secondsToMins(e) {
    let hours = (e / 3600).toString();
    let minutes = +(parseFloat("." + hours.split(".")[1]) * 60).toFixed() || "00";
    minutes = ("0" + minutes).slice(-2);
    return hours.split(".")[0] + ":" + minutes;
}

function plotSleep(data) {
    let { dataDay, labels } = aggregateSleepByDay(data);

    // let rawData = data.map((e) => e.SleepDuration);
    // let labels = data.map((e) => e.Date);
    let ctx = document.getElementById("sleepChart").getContext("2d");

    let sleepChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: dataDay,
                backgroundColor: "#8ecae6",
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
                // xAxes: [{
                //     type: "time",
                //     time: {
                //         unit: "day",
                //         round: "day",
                //         displayFormats: {
                //             day: "dd",
                //         },
                //     },
                // }, ],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return secondsToMins(value);
                        },
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

                        label += secondsToMins(tooltipItem.yLabel);
                        return label;
                    },
                    title: function(tooltipItem, data) {
                        let title = tooltipItem[0].xLabel;
                        title = moment(title, "dd").format("dddd");
                        return title;
                    },
                },
            },
        },
    });
}