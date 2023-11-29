document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  // Declare variable and create elements
  const body = $("body");
  const ctx = $("#myChart");
  const pageTitle = $(`<div></div>`);
  const inputContainer = $("<div></div>");
  const zipInput = $("<input>").attr("id", "userZip");
  const setLocationBtn = $("<button>Change Zip Code</button>");
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
    localDisplayName = "Puyallup, WA (default)";
  defaultZip = 98375;
  timeZone = "America%2FLos_Angeles";

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
          reject(new Error('Invalid response format from geocoding API'));
        }
      })
      .fail((error) => {
        // Reject the promise if the AJAX request fails
        reject(new Error('Failed to retrieve geolocation data'));
      });
    });
  }
  
  // getLatLong();

  // Asynchonous Call for Weather API
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


  // Function to update variables base on user input
  function updateVariables () {
    defaultZip = parseFloat(zipInput.val());
    getLatLong(); // makes AJAX call and changes LAT/LONG
  }

  // ============================ Start back here
  // Function to update chart with new data 
  // function updateChart(latitude, longitude, timeZone) {
  //   $.get(
  //     `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=apparent_temperature_max,apparent_temperature_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${timeZone}`, (data) => {
  //       // Things to update with 
  //     }
  // }

  // Add elements to page
  body.prepend(pageTitle);
  inputContainer.append(zipInput);
  // inputContainer.append(latInput);
  // inputContainer.append(longInput);
  inputContainer.append(setLocationBtn);
  body.append(inputContainer);

  // Event listener for setLocationBtn
  setLocationBtn.on("click", async function () {
    defaultZip = parseFloat(zipInput.val());
    await getLatLong(); // #1 Asyncronous
    await getDefaultData().then((data) => {
      defaultData = data;
      maxDailyTemps = defaultData.daily.apparent_temperature_max;
      minDailyTemps = defaultData.daily.apparent_temperature_min;
      timeLabels = defaultData.daily.time;
      createChart();
    });
  });
});
