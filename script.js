document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  // Declare variable and create elements
  const body = $("body");
  const ctx = $("#myChart");
  const pageTitle = $(`<div></div>`);
  const inputContainer = $("<div></div>");
  const zipInput = $("<input>").attr("id", "userZip").attr("placeholder", "Enter New ZipCode Here");
  const setLocationBtn = $("<button>💹 Get Your Forecast</button>");
  const dropBtnContainer = $("<div></div>").attr("id", "dropBtnCont");
  const dropDownContent = $("<div></div>")
    .attr("id", "myDropdown")
    .addClass("dropdown-content a");
  const setTimeZoneBtn = $(`<button >Change Time Zone ⬇️</button>`).addClass(
    "dropbtn"
  );
  // Default Data for my location
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
    longitude;
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
  // Iterate over time zones and create drop down menu
  for (let i = 0; i < timeZones.length; i++) {
    // let timeZoneAnchor = $(`<a href="#">${timeZones[i]}</a>`).addClass("dropdown-content");
    let timeZoneAnchor = $(`<a href="#">${timeZones[i]}</a>`).addClass(
      `timezone-option-${i}`
    );
    dropDownContent.append(timeZoneAnchor);
  }
  console.log(dropDownContent);
  // encodeURI

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

  getDefaultData().then((data) => {
    defaultData = data;
    maxDailyTemps = defaultData.daily.temperature_2m_max;
    minDailyTemps = defaultData.daily.temperature_2m_min;
    timeLabels = defaultData.daily.time;
    maxProbRain = defaultData.daily.precipitation_probability_max;
    createChart();
    console.log(data.daily.time);
  });

  // Function to update variables base on user input
  function updateVariables() {
    defaultZip = parseFloat(zipInput.val());
    getLatLong(); // makes AJAX call and changes LAT/LONG
  }

  // Add elements to page
  body.prepend(pageTitle);
  inputContainer.append(zipInput);
  // inputContainer.append(latInput);
  // inputContainer.append(longInput);
  inputContainer.append(setLocationBtn);
  dropBtnContainer.append(setTimeZoneBtn);
  dropBtnContainer.append(dropDownContent);
  body.append(inputContainer);
  body.append(dropBtnContainer);

  // Event listener for setLocationBtn
  setLocationBtn.on("click", async function () {
    defaultZip = parseFloat(zipInput.val());
    await getLatLong(); // #1 Asyncronous
    await getDefaultData().then((data) => {
      defaultData = data;
      console.log(data);
      maxDailyTemps = defaultData.daily.temperature_2m_max;
      minDailyTemps = defaultData.daily.temperature_2m_min;
      timeLabels = defaultData.daily.time;
      maxProbRain = defaultData.daily.precipitation_probability_max;
      createChart();
    });
  });

  $("#userZip").on("keydown", async function (e) {
    if (e.keyCode === 13) {
      defaultZip = parseFloat(zipInput.val());
      await getLatLong(); // #1 Asyncronous
      await getDefaultData().then((data) => {
        defaultData = data;
        console.log(data);
        maxDailyTemps = defaultData.daily.temperature_2m_max;
        minDailyTemps = defaultData.daily.temperature_2m_min;
        timeLabels = defaultData.daily.time;
        maxProbRain = defaultData.daily.precipitation_probability_max;
        createChart();
      });
    }
  });

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

  /*
  // ChartType selection
  chartTypes.find("a").on("click", function () {
    const selectedType = $(this).text();
    console.log("chartType has been selected");
    chartTypes.toggleClass("show");
    chartBtn.text(selectedType);
    chartType = selectedType;
    createChart(chartType);
  });

*/
});
