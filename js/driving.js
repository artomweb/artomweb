function fetchDriving() {
    fetch("https://rppi.artomweb.com/cache/driving")
        .then((res) => res.json())
        .then((out) => driving(out))
        .catch((err) => {
            console.log("failed to fetch from cache, driving", err);
            let drivingCard = document.getElementById("drivingCard");
            drivingCard.style.display = "none";
        });
}

fetchDriving();

function showdrivingSymbols() {
    let symbols = document.getElementsByClassName("drivingSymbol");

    for (let s of symbols) {
        s.style.display = "inline";
    }
}

function driving(data) {
    // console.log(data);
    showdrivingSymbols();
    let totalSeconds = data.totalSeconds;
    let totalMiles = data.totalMiles;

    let timeDriving = document.getElementById("timeDriving");
    let milesDriven = document.getElementById("milesDriven");

    let timeMessage = createTimeMessage(totalSeconds);

    timeDriving.innerHTML = timeMessage;
    milesDriven.innerHTML = totalMiles.toFixed(1);
}