let ctx3;
// let myTypingChart;
let typingToggleState = 0;
let typingData;
let typingBackgroundColor = "#F4A4A4";

function fetchTyping() {
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vTiOrp7SrLbvsgrusWvwFcllmSUov-GlAME8wvi7p3BTVCurKFh_KLlCVQ0A7luijiLa6F9fOKqxKAP/pub?output=csv", {
    download: true,
    header: true,
    complete: function (results) {
      typingMain(results.data);
    },
    error: function (error) {
      console.log("failed to fetch from cache, games");
    },
  });
}

fetchTyping();

function showSymbols() {
  let symbols = document.getElementsByClassName("symbol");

  for (let s of symbols) {
    s.style.display = "inline";
  }
}

function processTyping(dataIn) {
  dataIn = _.chain(dataIn)
    .forEach((elt) => {
      elt.timestamp = new Date(+elt.timestamp);
    })
    .sortBy(dataIn, (point) => point.timestamp.getTime())
    .value();

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("MMM YYYY");
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

  const labels = weekAvg.map((el) => el.wofy);
  const data = weekAvg.map((el) => el.sum);

  let sortedWPM = _.sortBy(dataIn, (point) => point.timestamp.getTime());

  const maxWPM = +_.maxBy(dataIn, "wpm").wpm;

  // Only last 500 tests

  let dataRecent = sortedWPM.slice(-500);

  // speed change per hour

  let wpmPoints = dataRecent.map((point) => +point.wpm);

  let trend = findLineByLeastSquares(wpmPoints);

  let wpmChange = trend[1][1] - trend[0][1];

  let delta = dataRecent.length * 30;

  const changeInWPMPerMin = (wpmChange * (3600 / delta)).toFixed(2);

  const PorNchange = changeInWPMPerMin > 0 ? "+" : "-";

  // avg wpm and acc

  const avgWPM = _.meanBy(dataRecent, (o) => +o.wpm).toFixed(2);
  const avgACC = Math.round(
    _.meanBy(dataRecent, (o) => +o.acc),
    0
  );

  //time since last test

  let dateOfLastTest = moment(dataRecent[dataRecent.length - 1].timestamp).format("Do [of] MMMM");

  let timeSinceLastTest = (new Date().getTime() - dataRecent[dataRecent.length - 1].timestamp.getTime()) / 1000;

  let dateOfLastTestMessage = dateOfLastTest + " (" + createTimeMessage(timeSinceLastTest, 1) + " ago)";

  // number of tests per day

  let firstTest = dataRecent[0];
  let lastTest = dataRecent[dataRecent.length - 1];

  let dayDiff = (lastTest.timestamp - firstTest.timestamp) / (1000 * 60 * 60 * 24);

  const testsPerDay = (dataRecent.length / dayDiff).toFixed(1);

  const totalTimeMessage = createTimeMessage(dataIn.length * 30, 1);

  let groupedByHour = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("H");
    })
    .map((entries, hour) => ({
      hour,
      count: entries.length,
    }))
    .value();

  let hoursLabels = [...Array(24).keys()];
  let hoursData = new Array(24).fill(0);

  groupedByHour.forEach((d) => {
    hoursData[+d.hour] = d.count;
  });

  console.log(hoursLabels);
  console.log(hoursData);

  const dataToSave = { totalTimeMessage, dateOfLastTestMessage, maxWPM, avgWPM, avgACC, testsPerDay, PorNchange, changeInWPMPerMin, labels, data, hoursLabels, hoursData };
  return dataToSave;
}

function typingMain(data) {
  typingData = processTyping(data);
  plotSkeletonChart();

  showSymbols();
  typingToggle();

  document.getElementById("timeSinceLastTest").innerHTML = typingData.dateOfLastTestMessage;
  document.getElementById("highestTypingSpeed").innerHTML = typingData.maxWPM;
  document.getElementById("averageTypingSpeed").innerHTML = typingData.avgWPM;
  document.getElementById("averageAccuracy").innerHTML = typingData.avgACC;
  document.getElementById("totalTime").innerHTML = typingData.totalTimeMessage;
  document.getElementById("testsPerDay").innerHTML = typingData.testsPerDay;
  document.getElementById("wpmChangePerHour").innerHTML = typingData.PorNchange + typingData.changeInWPMPerMin;
}

function typingToggle() {
  switch (typingToggleState) {
    case 0:
      plotMonths();
      console.log("By Month");
      break;

    case 1:
      plotHours();
      console.log("by hour");
      break;
  }
  typingToggleState == 1 ? (typingToggleState = 0) : typingToggleState++;
}

function plotHours() {
  let newDataset = {
    data: typingData.hoursData,
    backgroundColor: "#F4A4A4",
  };

  myTypingChart.data.labels = typingData.hoursLabels;

  myTypingChart.data.datasets = [newDataset];

  myTypingChart.options.tooltips = {
    // callbacks: {
    //   label: function (tooltipItem, data) {
    //     let label = data.datasets[tooltipItem.datasetIndex].label || "";
    //     if (label) {
    //       label += ": ";
    //     }
    //     label += tooltipItem.yLabel + " WPM";
    //     return label;
    //   },
    // },
  };

  myTypingChart.update();
}

function plotMonths() {
  let newDataset = {
    data: typingData.data,
    backgroundColor: "#F4A4A4",
  };

  myTypingChart.data.labels = typingData.labels;

  myTypingChart.data.datasets = [newDataset];

  myTypingChart.options.scales = {
    xAxes: [
      {
        ticks: {
          maxTicksLimit: 6.3,
          stepSize: 5,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    ],
    yAxes: [
      {
        ticks: {},
      },
    ],
  };

  myTypingChart.options.tooltips = {
    callbacks: {
      label: function (tooltipItem, data) {
        let label = data.datasets[tooltipItem.datasetIndex].label || "";
        if (label) {
          label += ": ";
        }
        label += tooltipItem.yLabel + " WPM";
        return label;
      },
    },
  };

  myTypingChart.update();

  // let ctx = document.getElementById("monkeyChart").getContext("2d");

  // let sleepChart = new Chart(ctx, {
  //   type: "line",
  //   data: {
  //     labels: typingData.labels,
  //     datasets: [
  //       {
  //         data: typingData.data,
  //         backgroundColor: "#F4A4A4",
  //       },
  //     ],
  //   },

  //   options: {
  //     maintainAspectRatio: true,
  //     responsive: true,

  //     legend: {
  //       display: false,
  //     },
  //     scales: {
  //       xAxes: [
  //         {
  //           ticks: {
  //             maxTicksLimit: 6.3,
  //             stepSize: 5,
  //             maxRotation: 0,
  //             minRotation: 0,
  //           },
  //         },
  //       ],
  //       yAxes: [
  //         {
  //           ticks: {},
  //         },
  //       ],
  //     },
  //     tooltips: {
  //       callbacks: {
  //         label: function (tooltipItem, data) {
  //           let label = data.datasets[tooltipItem.datasetIndex].label || "";
  //           if (label) {
  //             label += ": ";
  //           }
  //           label += tooltipItem.yLabel + " WPM";
  //           return label;
  //         },
  //       },
  //     },
  //   },
  // });
}

function plotSkeletonChart() {
  ctx3 = document.getElementById("monkeyChart").getContext("2d");
  let config = {
    type: "line",
    data: {
      datasets: [
        {
          backgroundColor: "#F4A4A4",
        },
      ],
    },

    options: {
      maintainAspectRatio: true,
      responsive: true,

      legend: {
        display: false,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              // min: 5,
            },
          },
        ],
      },
    },
  };
  myTypingChart = new Chart(ctx3, config);
}
