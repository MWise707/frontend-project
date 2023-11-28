document.addEventListener("DOMContentLoaded", function() {
  "use strict";
  // Declare variable and create elements
  const body = $("body");
  const pageTitle = $(`<div>7 Day Forecast for xxArea</div>`);
  const inputContainer = $("<div></div>")
  const latInput = $('<input>');
  const longInput = $('<input>');
  const setLocationBtn = $('<button>Set Location</button>');
  let latitude, longitude, timeZone;
  timeZone = "America%2FLos_Angeles";

  // Event listener for setLocationBtn
  setLocationBtn.on("click", function () {
    latitude = parseFloat(latInput.val());
    longitude = parseFloat(longInput.val());
    // console.log(`Latitude = ${latitude}, longitude = ${longitude}`);
  })

// My lat = 47.1 & my long = 122.32
// My timeZone = America%2FLos_Angeles

// API Test --- gets 7 day forecast w/ max and min temperatures for my current area
$.get(`https://api.open-meteo.com/v1/forecast?latitude=47.1&longitude=-122.32&daily=apparent_temperature_max,apparent_temperature_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${timeZone}`, (data) => {
  console.log(data);
})

// Add elements to page
body.prepend(pageTitle);
inputContainer.append(latInput);
inputContainer.append(longInput);
inputContainer.append(setLocationBtn);
body.append(inputContainer);


})