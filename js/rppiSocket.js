let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

/**
 * Creates a time message from a number of seconds, eg 1 day, 2 hours
 *
 * @param {number} delta The amount of time to be converted (in seconds).
 * @returns {string} The time message
 */
function createTimeMessage(delta) {
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    let hours = Math.floor(delta / 3600) % 24;

    let message = "";

    if (days != 0) {
        message = days;

        if (days == 1) {
            message += " day, ";
        } else {
            message += " days, ";
        }
    }

    message += hours;

    if (hours == 1) {
        message += " hour";
    } else {
        message += " hours";
    }

    return message;
}
socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("temperatureReading").innerHTML = msg.temperature.toFixed(2) + String.fromCharCode(176);
    document.getElementById("pressureReading").innerHTML = msg.pressure.toFixed(2) + "mb";
    if (!msg.humidity) {
        document.getElementById("humid").style.display = "none";
    } else {
        document.getElementById("humidityReading").innerHTML = msg.humidity.toFixed(2) + " %";
    }
});

socket.on("server init", function(msg) {
    // console.log(msg);
    let serverInit = new Date(msg.serverInitTime);
    let currentTime = new Date();

    let delta = Math.abs(currentTime - serverInit) / 1000;

    let message = createTimeMessage(delta);

    document.getElementById("serverUpTime").innerHTML = message;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});