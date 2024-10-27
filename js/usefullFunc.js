function getAllData() {
  let url = "https://api.artomweb.com/cache/all";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);

      parseChess(data.chess);
      parseCod(data.cod, data.codAllGames);
      parseDriving(data.driving);
      parseTyping(data.typing);
      parseDobble(data.dobble);
      parseSpotify(data.spotify);
    })
    .catch((e) => {
      parseChess();
      parseCod();
      parseDriving();
      parseTyping();
      parseDobble();
      parseSpotify();
    });
}

getAllData();

function timeago(inputDate) {
  const currentDate = new Date();

  // Clear the time part of both dates for comparison
  inputDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  // Get the difference in milliseconds
  const diffTime = currentDate - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Calculate time differences for weeks, months, and years
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths =
    (currentDate.getFullYear() - inputDate.getFullYear()) * 12 +
    (currentDate.getMonth() - inputDate.getMonth());
  const diffYears = currentDate.getFullYear() - inputDate.getFullYear();

  if (diffDays === 0) {
    return "today";
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays > 1 && diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffWeeks >= 1 && diffWeeks < 5) {
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  } else if (diffMonths >= 1 && diffMonths < 12) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  } else if (diffYears >= 1) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  }
}

function uptime(uptimeStartDate) {
  const now = new Date();
  const diffMs = now - uptimeStartDate;

  const msInMinute = 1000 * 60;
  const msInHour = msInMinute * 60;
  const msInDay = msInHour * 24;
  const msInMonth = msInDay * 30.44; // Average days in a month
  const msInYear = msInDay * 365.25; // Average days in a year

  if (diffMs < msInMinute) {
    const seconds = Math.floor(diffMs / 1000);
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  } else if (diffMs < msInHour) {
    const minutes = Math.floor(diffMs / msInMinute);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (diffMs < msInDay) {
    const hours = Math.floor(diffMs / msInHour);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else if (diffMs < msInMonth) {
    const days = Math.floor(diffMs / msInDay);
    return `${days} day${days !== 1 ? "s" : ""}`;
  } else if (diffMs < msInYear) {
    const months = Math.floor(diffMs / msInMonth);
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffMs / msInYear);
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
}

// https://github.com/monkeytypegame/monkeytype
function findLineByLeastSquares(values_y) {
  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_xx = 0;
  let count = 0;

  let x = 0;
  let y = 0;
  let values_length = values_y.length;

  if (values_length === 0) {
    return [[], []];
  }

  for (let v = 0; v < values_length; v++) {
    x = v + 1;
    y = values_y[v];
    sum_x += x;
    sum_y += y;
    sum_xx += x * x;
    sum_xy += x * y;
    count++;
  }

  let m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
  let b = sum_y / count - (m * sum_x) / count;

  let returnpoint1 = [1, 1 * m + b];
  let returnpoint2 = [values_length, values_length * m + b];
  return [returnpoint1, returnpoint2];
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// Fix button animation on mobile
let touchButtons = document.querySelectorAll(".button");

touchButtons.forEach((but) => {
  but.addEventListener(
    "touchstart",
    function (e) {
      but.classList.add("active");
      setTimeout(function () {
        but.classList.remove("active");
      }, 200);
    },
    { passive: true }
  ); // Marking the event listener as passive
});
