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
  const featuresMenu = $("<div></div>").attr("id", "featuresMenu");
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
  const todayCard = {};
  const featureIsChecked = {};
  const future = {};
  const locationData = {
    latitude: 47.1,
    longitude: -122.32,
    localDisplayName: "Puyallup, WA (default)",
    defaultZip: 98375,
    timeZone: "America/Los_Angeles",
  };
  const timeZones = [
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
  ];

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

  // Asynchonous Call for Weather API
  function getDefaultData() {
    return new Promise((resolve, reject) => {
      $.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${locationData.latitude}&longitude=${locationData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${locationData.timeZone}`,
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
      todayCard.temp = `🌡️ Temperature:  ${defaultData.current.temperature_2m}℉`;
      todayCard.feelsLike = `🌡️ Feels Like: ${defaultData.current.apparent_temperature}℉`;
      today.isDay = defaultData.current.is_day === 1;
      today.isRaining = defaultData.current.rain > 0;
      today.isSnowing = defaultData.current.snowfall > 0;
      todayCard.humidity = `💦 Humidity: ${defaultData.current.relative_humidity_2m}%`;
      todayCard.location = `📍 Location: ${locationData.localDisplayName}`;
      todayCard.windSpeed = `💨 Wind is ${defaultData.current.wind_speed_10m}mph`;
      // Use time helper functions
      today.timeOnly = getTimeOnly(defaultData.current.time);
      todayCard.timeUpdated = `⌚️ Last Updated: ${getTimeOnly(
        defaultData.current.time
      )}`;
      todayCard.todaysDate = `📅 ${getDateOnly(defaultData.current.time)}`;
      today.dateOnly = getDateOnly(defaultData.current.time);
      today.timeNum = transformTimeToNum(today.timeOnly);
      todayCard.sunrise = `🌅 Sunrise: ${getTimeOnly(
        defaultData.daily.sunrise[0]
      )}`;
      todayCard.sunset = `🌆 Sunset: ${getTimeOnly(
        defaultData.daily.sunset[0]
      )}`;

      // Clear the features menu before creating checkboxes
      featuresMenu.empty();

      for (const key in todayCard) {
        featureIsChecked.key = false;
        // Create div for each key
        // add keyName as text for div
        let checkboxContainer = $(`<div></div>`);
        let checkboxInput = $("<input type='checkbox'/>").attr("id", `${key}`);
        let checkboxLabel = $("<label></label>")
          .attr("for", `${key}`)
          .text(`${key}`);
        // append div to featuresMenu
        checkboxContainer.append(checkboxInput);
        checkboxContainer.append(checkboxLabel);
        featuresMenu.append(checkboxContainer);
        // add event listener for each checkbox
        checkboxInput.on("click", function (e) {
          const chckboxId = checkboxInput.attr("id");
          featureIsChecked[chckboxId] = !featureIsChecked[chckboxId];
          console.log(featureIsChecked[chckboxId]);
          console.log(`I am checkbox ${chckboxId}`);
          const featureDivId = `${chckboxId}_featureDiv`;
          if (featureIsChecked[chckboxId]) {
            const newFeatureDiv = $(`<div></div>`)
              .text(`${todayCard[key]}`)
              .attr("id", featureDivId);
            currContainer.append(newFeatureDiv);
          } else {
            $(`#${featureDivId}`).remove();
          }
        });
      }

      getCloudCoverage(defaultData.current.cloud_cover);
      setSkyConditons();
      setDynamicBackground();
      setDynamicMessage();
      createChart();
    });
  }

  fetchDataAndCreateChart();

  // Time helper function

  function getTimeOnly(defaultDTGstring) {
    let dtgArray = defaultDTGstring.split("T");
    return dtgArray[1];
  }
  function getDateOnly(defaultDTGstring) {
    let dtgArray = defaultDTGstring.split("T");
    return dtgArray[0];
  }
  function transformTimeToNum(timeWithColon) {
    let timeNumArray = timeWithColon.split(":");
    return parseInt(timeNumArray.join(""));
  }

  // Cloud coverage & sky condtions helper functions
  function getCloudCoverage(cloudCoverage) {
    today.isPartlyCloudy = cloudCoverage > 19 && cloudCoverage < 51;
    today.isCloudy = cloudCoverage > 50 && cloudCoverage < 91;
    today.isOvercast = cloudCoverage > 90;
    today.isClear = cloudCoverage < 20;
  }
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
    if (today.isDay && today.isRaining) {
      currContainer.css("background-image", "url(Graphics/day-rain.gif)");
    } else if (today.isDay && today.isSnowing) {
      currContainer.css("background-image", "url(Graphics/day-snow.gif)");
    } else if (today.isDay && today.isClear) {
      currContainer.css("background-image", "url(Graphics/day-clear.jpeg)");
    } else if (!today.isDay && today.isRaining) {
      currContainer.css("background-image", "url(Graphics/night-rain.gif)");
    } else if (!today.isDay && today.isSnowing) {
      currContainer.css("background-image", "url(Graphics/night-snow.gif)");
    } else {
      currContainer.css("background-image", "url(Graphics/night-clear.png)");
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
  bodyClose.append(currContainer);
  // Body Close: Input Container, DropDown

  dropBtnContainer.append(setTimeZoneBtn);
  dropBtnContainer.append(dropDownContent);
  dropBtnContainer.append(featuresMenu);
  bodyClose.append(dropBtnContainer);

  inputContainer.append(inputMessage);
  inputContainer.append(zipInput);
  // inputContainer.append(setLocationBtn);
  inputContainer.append(latLongInput);
  inputContainer.append(inputNameMessage);
  inputContainer.append(usrNameInput);
  bodyClose.append(inputContainer);

  // ======== EVENT Listeners ===========
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
      today.userName = usrNameInput.val();
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
