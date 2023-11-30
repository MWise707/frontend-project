document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  // Declare variable and create elements
  const bodyStart = $("#bodyStart");
  const bodyMid = $("#bodyMid");
  const bodyClose = $("#bodyClose");
  const ctx = $("#myChart");
  const pageTitle = $(`<div></div>`).attr("id", "pageTitle");
  // current conditions card ====================
  const currContainer = $(`<div></div>`).attr("id", "today-container");
  const currTempCard = $(`<div></div>`).addClass("today-card");
  const currHumidCard = $(`<div></div>`).addClass("today-card");
  const currTitleCard = $(`<div></div>`).addClass("today-card");
  const currTimeCard = $(`<div></div>`).addClass("today-card");
  const currMessageCard = $(`<div></div>`).addClass("today-card");
  // User Input Elements
  const inputContainer = $("<div></div>").attr("id", "inputCont");
  const inputMessage = $("<div></div>")
    .attr("id", "inputMessage")
    .text("Change your location with one of the options below.")
    .css("textAlign", "center");
  const zipInput = $("<input>")
    .attr("id", "userZip")
    .attr("placeholder", "ZipCode format: 98375");
  const latLongInput = $("<input>")
    .attr("id", "latLongInput")
    .attr("placeholder", "Lat/Long format: 47.3, -122.3");
  const usrNameInput = $("<input>")
    .attr("id", "usrNameInput")
    .attr("placeholder", "Your Name Here");
  const dropBtnContainer = $("<div></div>").attr("id", "dropBtnCont");
  const dropDownContent = $("<div></div>")
    .attr("id", "myDropdown")
    .addClass("dropdown-content a");
  const setTimeZoneBtn = $(`<button >Change Time Zone ⬇️</button>`).addClass(
    "dropbtn"
  );
  const inputNameMessage = $("<div></div>")
    .attr("id", "inputNameMessage")
    .text("Add your name below")
    .css("textAlign", "center");
  const earlyGreeting = "The Early 🐥 Gets the Worm";
  const morningGreeting = "Good morning 🌅";
  const afternoonGreeting = "Good afternoon 🕛";
  const nightGreeting = "Good evening 🌃";
  // Weather Variables
  let myChart;
  const today = {
    userName: "there",
  };
  const future = {};
  const locationData = {
    latitude: 47.1,
    longitude: -122.32,
    localDisplayName: "Puyallup, WA (default)",
    defaultZip: 98375,
    timeZone: "America%2FLos_Angeles",
  };
  const timeZones = [
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
  ];
  currTitleCard.text(`Current Weather in ${locationData.localDisplayName}`);

  // Iterate over time zones and create drop down menu
  for (let i = 0; i < timeZones.length; i++) {
    // let timeZoneAnchor = $(`<a href="#">${timeZones[i]}</a>`).addClass("dropdown-content");
    let timeZoneAnchor = $(`<a href="#">${timeZones[i]}</a>`).addClass(
      `timezone-option-${i}`
    );
    dropDownContent.append(timeZoneAnchor);
  }

  function getLatLong() {
    return new Promise((resolve, reject) => {
      $.get(
        `https://geocode.maps.co/search?q=${locationData.defaultZip}`,
        (latLong) => {
          if (latLong && latLong.length > 0) {
            // Change variables for lat/long & display name
            locationData.localDisplayName = latLong[0].display_name;
            locationData.latitude = latLong[0].lat;
            locationData.longitude = latLong[0].lon;
            resolve();
          } else {
            reject(new Error("Invalid response format from geocoding API"));
          }
        }
      ).fail((error) => {
        // Reject the promise if the AJAX request fails
        reject(new Error("Failed to retrieve geolocation data"));
      });
    });
  }

  // Used to find location name with LAT/LONG
  function getLocWithLatLong() {
    $.get(
      `https://geocode.maps.co/reverse?lat=${locationData.latitude}&lon=${locationData.longitude}`,
      (locData) => {
        localDisplayName = locData.display_name;
        locationData.localDisplayName = locData.display_name;
      }
    );
  }

  //https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,wind_speed_10m&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FLos_Angeles

  // Asynchonous Call for Weather API
  function getDefaultData() {
    return new Promise((resolve, reject) => {
      $.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${locationData.latitude}&longitude=${locationData.longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${locationData.timeZone}`,
        (data) => {
          // provide data ref
          resolve(data);
        }
      );
    });
  }

  function createChart() {
    // Clear existing chart if it exists
    if (myChart) {
      myChart.destroy();
    }
    // Add dynamic text to title
    pageTitle.text(`7 Day forecast for ${locationData.localDisplayName}`);

    // Intitial Chart Function
    myChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            type: "line",
            label: "Low Temperatures",
            data: future.minDailyTemps,
          },
          {
            type: "line",
            label: "High Temperatures",
            data: future.maxDailyTemps,
          },
          {
            type: "bar",
            label: "% Chance of Precipitation",
            data: future.maxProbRain,
          },
        ],
        labels: future.timeLabels,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function fetchDataAndCreateChart() {
    getDefaultData().then((data) => {
      let defaultData = data;
      // Get Forecast Data
      future.maxDailyTemps = defaultData.daily.temperature_2m_max;
      future.minDailyTemps = defaultData.daily.temperature_2m_min;
      future.timeLabels = defaultData.daily.time;
      future.maxProbRain = defaultData.daily.precipitation_probability_max;
      // Get Current Conditions
      today.chanceOfRain = future.maxProbRain[0];
      today.temp = defaultData.current.temperature_2m;
      today.isDay = defaultData.current.is_day === 1;
      today.isRaining = defaultData.current.rain > 0;
      today.isSnowing = defaultData.current.snowfall > 0;
      today.isPartlyCloudy =
        defaultData.current.cloud_cover > 19 &&
        defaultData.current.cloud_cover < 51;
      today.isCloudy =
        defaultData.current.cloud_cover > 50 &&
        defaultData.current.cloud_cover < 91;
      today.isOvercast = defaultData.current.cloud_cover > 90;
      today.isClear = defaultData.current.cloud_cover < 20;
      today.humidity = defaultData.current.relative_humidity_2m;

      console.log(defaultData); // Full Weather Object

      separateDTG(defaultData.current.time); // separate time from date

      // Add dynamic text to Current Card
      currTitleCard.text(
        `On ${today.dateOnly} in ${locationData.localDisplayName}`
      );
      currTimeCard.text(`Last Updated: ${today.timeOnly}`);
      currTempCard.text(`🌡️ ${today.temp}℉`);
      currHumidCard.text(`${today.humidity}% Humidity`);
      setSkyConditons();
      setDynamicBackground();
      setDynamicMessage();
      createChart();
    });
  }

  fetchDataAndCreateChart();

  // Time helper function
  function separateDTG(defaultDTGstring) {
    let dtgArray = defaultDTGstring.split("T");
    today.dateOnly = dtgArray[0];
    today.timeOnly = dtgArray[1];
    let timeNumArray = today.timeOnly.split(":");
    today.timeNum = parseInt(timeNumArray.join(""));
  }

  // Sky condtions logic ** and skies are ${skyConditions}
  function setSkyConditons() {
    if (today.isClear) {
      today.skyConditions = "clear 😎";
    } else if (today.isPartlyCloudy) {
      today.skyConditions = "partly cloudy 🌤️";
    } else if (today.isCloudy) {
      today.skyConditions = "cloudy 🌥️";
    } else {
      today.skyConditions = "overcast ☁☁️ ";
    }
  }

  // Logic for dynamic background
  function setDynamicBackground() {
    if (today.isDay) {
      // Logic for daytime currContainer
      if (today.isRaining) {
        // currContainer.css("background-image", "url(Graphics/day-clear.jpeg)");
      } else if (today.isSnowing) {
        // currContainer.css("background-image", "url(Add Day snowing)");
      } else {
        currContainer.css("background-image", "url(Graphics/day-clear.jpeg)");
      }
    } else {
      if (today.isRaining) {
        currContainer.css("background-image", "url(Graphics/night-rain.gif)");
      } else if (today.isSnowing) {
        // currContainer.css  Change to night snow
      } else {
        // currContainer.css  Change to night clear
      }
    }
  }

  // Logic for dynamic message
  function setDynamicMessage() {
    let dynamicGreeting;
    if (today.timeNum <= 359) {
      dynamicGreeting = earlyGreeting;
    } else if (today.timeNum > 359 && today.timeNum <= 1159) {
      dynamicGreeting = morningGreeting;
    } else if (today.timeNum > 1159 && today.timeNum <= 1700) {
      dynamicGreeting = afternoonGreeting;
    } else {
      dynamicGreeting = nightGreeting;
    }
    currMessageCard.text(
      `Hey ${today.userName}! ${dynamicGreeting} Today's chance of Rain is ${today.chanceOfRain}% and skies are ${today.skyConditions}`
    );
  }

  // Add elements to page =======================
  // Body Start Includes Page Title
  bodyStart.append(pageTitle);
  // Body Middle Includes Chart & currContainer
  currContainer.append(currMessageCard);
  currContainer.append(currTitleCard);
  currContainer.append(currTimeCard);
  currContainer.append(currTempCard);
  currContainer.append(currHumidCard);
  bodyClose.append(currContainer);
  // Body Close: Input Container, DropDown

  dropBtnContainer.append(setTimeZoneBtn);
  dropBtnContainer.append(dropDownContent);
  bodyClose.append(dropBtnContainer);

  inputContainer.append(inputMessage);
  inputContainer.append(zipInput);
  // inputContainer.append(setLocationBtn);
  inputContainer.append(latLongInput);
  inputContainer.append(inputNameMessage);
  inputContainer.append(usrNameInput);
  bodyClose.append(inputContainer);

  // EVENT Listeners ===================

  // Event listener for setLocationBtn
  // setLocationBtn.on("click", async function () {
  //   defaultZip = parseFloat(zipInput.val());
  //   await getLatLong(); // #1 Asyncronous
  //   currTitleCard.text(`Currently in ${localDisplayName}`);
  //   fetchDataAndCreateChart();
  // });

  // Input event listener

  $("input").on("input", async function () {
    if (
      latLongInput.val() !== "" &&
      latLongInput.val() !== latLongInput.prop("placeholder")
    ) {
      let latLongArray = latLongInput.val().split(",");
      locationData.latitude = parseFloat(latLongArray[0]);
      locationData.longitude = parseFloat(latLongArray[1]);
      getLocWithLatLong();
    } else if (
      zipInput.val() !== "" &&
      zipInput.val() !== zipInput.prop("placeholder")
    ) {
      locationData.defaultZip = parseFloat(zipInput.val());
      getLatLong(); // AJAX call to get lat/long
    }
    if (
      usrNameInput.val() !== "" &&
      usrNameInput.val() !== usrNameInput.prop("placeholder")
    ) {
      userName = usrNameInput.val();
    }
    fetchDataAndCreateChart();
  });

  // Dropdown button event listener
  setTimeZoneBtn.on("click", function () {
    dropDownContent.toggleClass("show");
  });

  // Event listener for each timezone option
  dropDownContent.find("a").on("click", function () {
    dropDownContent.removeClass("show"); // Close the dropdown
    locationData.timeZone = encodeURI($(this).text());
    setTimeZoneBtn.text(`${locationData.timeZone} ⬇️`);
    fetchDataAndCreateChart();
  });
});
