let socket = io("https://rppi.artomweb.com");

socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("SensorReading").innerHTML = msg.LDR;
});