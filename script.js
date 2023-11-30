document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  // Declare variable and create elements
  const body = $("body");
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
  let userName = "there";
  // Weather Variables
  let defaultData,
    timeZone,
    maxDailyTemps,
    minDailyTemps,
    maxProbRain,
    myChart,
    timeLabels,
    defaultZip,
    localDisplayName,
    latitude,
    longitude,
    currDate,
    isDay,
    isRaining,
    isSnowing,
    cloudCover,
    isCloudy,
    isPartlyCloudy,
    isOvercast,
    timeNum,
    chanceOfRain,
    isClear;
  // Default Location Data
  latitude = 47.1;
  longitude = -122.32;
  localDisplayName = "Puyallup, WA (default)";
  defaultZip = 98375;
  timeZone = "America%2FLos_Angeles";
  let locationData = {
    latitude: 47.1,
    longitude: -122.32,
    localDisplayName: "Puyallup, WA (default)",
    defaultZip: 98375,
    timeZone: "America%2FLos_Angeles",
  };
  let timeZones = [
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
  ];
  currTitleCard.text(`Current Weather in ${localDisplayName}`);

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
      $.get(`https://geocode.maps.co/search?q=${defaultZip}`, (latLong) => {
        if (latLong && latLong.length > 0) {
          // Change variables for lat/long & display name
          localDisplayName = latLong[0].display_name;
          console.log(localDisplayName);
          latitude = latLong[0].lat;
          longitude = latLong[0].lon;
          resolve();
        } else {
          reject(new Error("Invalid response format from geocoding API"));
        }
      }).fail((error) => {
        // Reject the promise if the AJAX request fails
        reject(new Error("Failed to retrieve geolocation data"));
      });
    });
  }

  // Used to find location name with LAT/LONG
  function getLocWithLatLong() {
    $.get(
      `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`,
      (locData) => {
        localDisplayName = locData.display_name;
      }
    );
  }

  // Asynchonous Call for Weather API
  function getDefaultData() {
    return new Promise((resolve, reject) => {
      $.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${locationData.timeZone}`,
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
    pageTitle.text(`7 Day forecast for ${localDisplayName}`);

    // Intitial Chart Function
    myChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            type: "line",
            label: "Low Temperatures",
            data: minDailyTemps,
          },
          {
            type: "line",
            label: "High Temperatures",
            data: maxDailyTemps,
          },
          {
            type: "bar",
            label: "% Chance of Precipitation",
            data: maxProbRain,
          },
        ],
        labels: timeLabels,
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
      defaultData = data;
      maxDailyTemps = defaultData.daily.temperature_2m_max;
      minDailyTemps = defaultData.daily.temperature_2m_min;
      timeLabels = defaultData.daily.time;
      maxProbRain = defaultData.daily.precipitation_probability_max;
      chanceOfRain = maxProbRain[0];
      console.log(`chance of Rain is ${chanceOfRain}%`);
      isDay = defaultData.current.is_day === 1;
      isRaining = defaultData.current.rain > 0;
      isSnowing = defaultData.current.snowfall > 0;
      isPartlyCloudy =
        defaultData.current.cloud_cover > 19 &&
        defaultData.current.cloud_cover < 51;
      isCloudy =
        defaultData.current.cloud_cover > 50 &&
        defaultData.current.cloud_cover < 91;
      isOvercast = defaultData.current.cloud_cover > 90;
      isClear = defaultData.current.cloud_cover < 20;
      console.log(defaultData.current.rain);
      console.log(isRaining);
      console.log(defaultData);
      // separate time from date
      let dateOnly, timeOnly;
      let dtgArray = defaultData.current.time.split("T");
      dateOnly = dtgArray[0];
      timeOnly = dtgArray[1];
      let timeNumArray = timeOnly.split(":");
      console.log(timeNumArray);
      timeNum = parseInt(timeNumArray.join(""));
      currTitleCard.text(`On ${dateOnly} in ${localDisplayName}`);
      currTimeCard.text(`Last Updated: ${timeOnly}`);
      currTempCard.text(`🌡️ ${defaultData.current.temperature_2m}℉`);
      currHumidCard.text(
        `${defaultData.current.relative_humidity_2m}% Humidity`
      );
      setDynamicBackground();
      setDynamicMessage();
      createChart();
    });
  }

  fetchDataAndCreateChart();

  // Logic for dynamic background
  function setDynamicBackground() {
    if (isDay) {
      // Logic for daytime currContainer
      if (isRaining) {
        currContainer.css("background-image", "url(Graphics/day-clear.jpeg)");
      } else {
        currContainer.css("background-image", "url(Graphics/day-clear.jpeg)");
      }
    } else {
      // Logic for nightime currContainer
      // nightime Graphics/ezgif.com-video-to-gif.png
      currContainer.css("background-image", "url(Graphics/night-rain.gif)");
      // currContainer.css('background-size', 'cover');
    }
  }

  // Logic for dynamic message
  function setDynamicMessage() {
    let dynamicGreeting;
    if (timeNum <= 359) {
      dynamicGreeting = earlyGreeting;
    } else if (timeNum > 359 && timeNum <= 1159) {
      dynamicGreeting = morningGreeting;
    } else if (timeNum > 1159 && timeNum <= 1700) {
      dynamicGreeting = afternoonGreeting;
    } else {
      dynamicGreeting = nightGreeting;
    }
    currMessageCard.text(
      `Hey ${userName}! ${dynamicGreeting} Today's chance of Rain is ${chanceOfRain}%`
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
      latitude = parseFloat(latLongArray[0]);
      longitude = parseFloat(latLongArray[1]);
    } else if (
      zipInput.val() !== "" &&
      zipInput.val() !== zipInput.prop("placeholder")
    ) {
      defaultZip = parseFloat(zipInput.val());
      await getLatLong(); // AJAX call to get lat/long
    }
    if (
      usrNameInput.val() !== "" &&
      usrNameInput.val() !== usrNameInput.prop("placeholder")
    ) {
      userName = usrNameInput.val();
    }
    console.log(userName);
    console.log(latitude, longitude);
    console.log(defaultZip);
  });
  

  /*
  $("#userZip").on("keydown", async function (e) {
    if (e.keyCode === 13) {
      defaultZip = parseFloat(zipInput.val());
      await getLatLong(); // #1 Asyncronous
      fetchDataAndCreateChart();
    }
  });
*/
  /*
  $("#latLongInput").on("keydown", async function (e) {
    if (e.keyCode === 13) {
      alert(
        "Enter Latittude and Longitude separated by comma. \n Example: 47.1, -122.3"
      );
      let latLongArray = latLongInput.val().split(",");
      latitude = parseFloat(latLongArray[0]);
      longitude = parseFloat(latLongArray[1]);
      console.log(latitude, longitude);
      await getLocWithLatLong();
      await fetchDataAndCreateChart();
    }
  });
  */

  // Dropdown button event listener
  setTimeZoneBtn.on("click", function () {
    dropDownContent.toggleClass("show");
    console.log("Time Zone Button has been clicked");
  });

  // Event listener for each timezone option
  dropDownContent.find("a").on("click", function () {
    dropDownContent.removeClass("show"); // Close the dropdown
    locationData.timeZone = encodeURI($(this).text());
    setTimeZoneBtn.text(`${locationData.timeZone} ⬇️`);
    console.log(locationData.timeZone);
    console.log("Time Zone Option clicked:", $(this).text());
  });
});
