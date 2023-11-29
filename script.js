document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  // Declare variable and create elements
  const body = $("body");
  const ctx = $("#myChart");
  const pageTitle = $(`<div></div>`);
  const inputContainer = $("<div></div>");
  const zipInput = $("<input>").attr("id", "userZip");
  const latInput = $("<input>").attr("id", "userLat");
  const longInput = $("<input>").attr("id", "userLong");
  const setLocationBtn = $("<button>Set Location</button>");
  // Default Data for my location
  let latitude = 47.1;
  let longitude = -122.32;
  let defaultData,
    timeZone,
    maxDailyTemps,
    minDailyTemps,
    myChart,
    timeLabels,
    defaultZip,
    localDisplayName;
  defaultZip = 98375;
  timeZone = "America%2FLos_Angeles";

  function getLatLong() {
    $.get(`https://geocode.maps.co/search?q=${defaultZip}`, (latLong) => {
      console.log(latLong);
      console.log(latLong[0].display_name);
      console.log(latLong[0].lat);
      localDisplayName = latLong[0].display_name;
      latitude = latLong[0].lat; // set latitude based on zip
      longitude = latLong[0].lon; // set longitude based on zip
    });
  }
  getLatLong();

  // Test call for API
  function getDefaultData() {
    return new Promise((resolve, reject) => {
      $.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=apparent_temperature_max,apparent_temperature_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${timeZone}`,
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

  getDefaultData().then((data) => {
    defaultData = data;
    maxDailyTemps = defaultData.daily.apparent_temperature_max;
    minDailyTemps = defaultData.daily.apparent_temperature_min;
    timeLabels = defaultData.daily.time;
    createChart();
    console.log(data.daily.time);
  });

  function getLocalData() {
    $.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=apparent_temperature_max,apparent_temperature_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${timeZone}`,
      (data) => {
        return data;
      }
    );
  }

  // createChart();

  // API Test --- gets 7 day forecast w/ max and min temperatures for my current area

  // Add elements to page
  body.prepend(pageTitle);
  inputContainer.append(zipInput);
  inputContainer.append(latInput);
  inputContainer.append(longInput);
  inputContainer.append(setLocationBtn);
  body.append(inputContainer);

  // Event listener for setLocationBtn
  setLocationBtn.on("click", function () {
    latitude = parseFloat(latInput.val());
    longitude = parseFloat(longInput.val());
    // console.log(`Latitude = ${latitude}, longitude = ${longitude}`);
    getLocalData();
  });
});
