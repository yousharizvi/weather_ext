'use strict';

let data;
$(function () {
  $('.loading').hide();
  getLocation();
  let unit = localStorage.getItem('unit');
  $(`[name="unit"][value=${unit}]`).prop('checked', true);
  $('.refresh-location').click(() => {
    localStorage.removeItem('coords');
    getLocation();
  })
  $('[name="unit"]').change(function () {
    localStorage.setItem('unit', $(this).val());
    updateValues(data);
  })
})

function getLocation() {
  $('.loading, .refresh-location, .unit-input').toggle();
  $('.loading').text('Getting location...');
  let cachedCoords = JSON.parse(localStorage.getItem('coords'));
  if (cachedCoords) {
    fetchLocation(cachedCoords);
  }
  else {
    navigator.geolocation.getCurrentPosition(location => {
      let coords = [location.coords.latitude, location.coords.longitude];
      localStorage.setItem('coords', JSON.stringify(coords));
      fetchLocation(coords);
    });
  }
}

function fetchLocation(coords) {
  $.get(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.join(',')}&sensor=false`, res => {
    let location = res.results.filter(loc => loc.types.join(',') === 'locality,political')[0];
    localStorage.setItem('location', JSON.stringify(location));
    $('.headline .title').text(location.formatted_address);
    $('.headline .coords').text(coords.join(', '));
    fetchWeather(location.formatted_address);
  })

}

function fetchWeather(location) {
  $('.loading').text('Getting weather...');
  $.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=c4bb236956121bb7f16ed3a6e879a987`, res => {
    data = res;
    localStorage.setItem(location, JSON.stringify(res));
    updateValues(res);
    $('.loading, .refresh-location, .unit-input').toggle();
  })
};

function updateValues(data) {
  let unit = $('[name="unit"]:checked').val();
  if (!data) return;
  let unitLabels = { K: 'K', C: '°C', F: '°F' };
  $('.weather .condition').html(`<b>${data.weather[0].main}:</b> ${data.weather[0].description}`);
  $('.weather .temperature').text(convert(data.main.temp, unit));
  $('.weather .unit').text(`${unitLabels[unit]}`);
  $('.weather .min').html(`<b>Min:</b> ${convert(data.main.temp_min, unit)}${unitLabels[unit]}`);
  $('.weather .max').html(`<b>Max:</b> ${convert(data.main.temp_max, unit)}${unitLabels[unit]}`);
  $('.weather .pressure').html(`<b>Pressure:</b> ${data.main.pressure}`);
  $('.weather .humidity').html(`<b>Humidity:</b> ${data.main.humidity}`);
}

function convert(value, unit) {
  switch (unit) {
    case 'C':
      return (value - 273.15).toFixed(1)
    case 'F':
      return (((value - 273.15) * 9 / 5) + 32).toFixed(1)
    case 'K':
      return (value).toFixed(1)
  }
}