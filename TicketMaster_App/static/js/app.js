
function loadMarkersTest(dataTest) {
  console.log('in loadMarkers map: ', myMap);
  console.log('in loadMarkers data: ', dataTest);

}

function buildScatter(city) {

  d3.json(`/chart/${city}`).then(function (data) {

    console.log('bldScatter: ', data);


    var size = [];
    for (var m = 0; m < data.EventCnt.length; m++) {
      size.push(data.EventCnt[m] + 5);
    }


    console.log('size', size[0]);
    var color = []
    for (var l = 0; l < data.Classification.length; l++) {
      switch (data.Classification[l]) {
        case ("Sports"):
          color.push("red");
          break;
        case ("Arts & Theatre"):
          color.push("yellow");
          break;
        case ("Music"):
          color.push('blue');
          break;
        case ("Film"):
          color.push("Yellow");
          break;
        default:
          color.push("orange");
      }
    }

    var week = data.Week
    var event_count = data.EventCnt
    var class_name = data.Classification


    var trace1 = {
      type: "scatter",
      mode: "markers",
      name: class_name,
      x: week,
      y: event_count,
      text: class_name,
      marker: {
        color: color,
        size: size
      }
    };

    var data1 = [trace1];

    var layout = {
      title: "Event Count Per Week",
      xaxis: { title: "Week" }
    };

    Plotly.newPlot("bubble", data1, layout);


  });



}

function buildVenueList(city) {
  d3.json(`/venue/${city}`).then(function (data) {
    venueData = data;
    console.log('venue data: ', venueData);

    var selector = d3.select("#selVenue");

    selector.selectAll("*").remove();

    selector
      .append("option")
      .text("Select a Venue")
      .property("value", "Select a Venue");


    for (var j = 0; j < data.venue.length; j++) {
      console.log('in v loop: ', data.venue[j]);
      //     cityNames.forEach((city) => {
      selector
        .append("option")
        .text(data.venue[j])
        .property("value", data.venue[j]);
    }
    //firstCity =  cityNames.city[0];
    //console.log('t99:', firstCity);

  });

}




function loadMarkers(mapData) {
  console.log('mapData', mapData);
  console.log('what: ', myMap);

  var lng = -94.48
  var lat = 39.10

  switch (mapData.City_name[0]) {
    case ("Chicago"):
      lat = 41.88;
      lng = -87.63;
      break;
    case ("Kansas City"):
      console.log('in switch kc');
      lat = 39.10;
      lng = -94.48;
      break;
    case ("Las Vegas"):
      lat = 36.11;
      lng = -115.17;
      break;
    case ("Miami"):
      lat = 25.77;
      lng = -80.19;
      break;
    case ("Milwaukee"):
      lat = 43.03;
      lng = -87.90;
      break;
    case ("Nashville"):
      lat = 36.17;
      lng = -86.07;
      break;
    case ("New Orleans"):
      lat = 29.95;
      lng = -90.07;
      break;
    case ("Seattle"):
      lat = 47.60;
      lng = -122.33;
      break;
    case ("Boston"):
      lat = 42.35;
      lng = -87.63;
      break;
    case ("Denver"):
      lat = 41.88;
      lng = -71.05;
      break;
  }
  // console.log('lat', lat);


  console.log('lat', myMap);
  latlng = L.latLng(lat, lng);
  //myMap.setView(new L.LatLng(lat, lng), 11);
  // myMap.setView(latlng, 11);
  myMap.panTo(new L.LatLng(lat, lng));



  // if (myMap.hasLayer(markers) ) {
  //   myMap.removeLayer(markers);
  // }

  markers = L.markerClusterGroup();

  // Loop through data
  for (var i = 0; i < mapData.Latitude.length; i++) {
    //console.log('in loop', mapData.Latitude[i])
    // Add a new marker to the cluster group and bind a pop-up
    markers.addLayer(L.marker([mapData.Longitude[i], mapData.Latitude[i]])
      .bindPopup(mapData.eventname[i]));
  }

  // Add our marker cluster layer to the map
  console.log('b4 markers')
  myMap.addLayer(markers);

}

function buildCharts(city) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();



  var startMonth = String(mm);
  var dateAry = [];

  if (dd >= 1 && dd <= 7) { startMonth = startMonth + '-wk1' }
  else if (dd >= 8 && dd <= 14) { startMonth = startMonth + '-wk2' }
  else if (dd >= 15 && dd <= 21) { startMonth = startMonth + '-wk3' }
  else { startMonth = startMonth + '-wk4' }



  console.log('dates: ', startMonth);

  //var teststring = `/cities/${city}`
  //console.log('butt1: ', teststring);
  d3.json(`/cities/${city}`).then(function (data) {

    console.log('test999: ', data);
    cityDataTest = data;
    loadMarkers(cityDataTest);

    var graphDate = [];
    var graphWk = ''




    const classLabels = ["Sports", "Music", "Arts & Theatre", "Miscellaneous", "Film"];
    var classValues = [0, 0, 0, 0, 0];

    for (var i = 0; i < data.Classification.length; i++) {

      switch (data.Classification[i]) {
        case "Sports":
          classValues[0] += 1;
          break;
        case "Music":
          classValues[1] += 1;
          break;
        case "Arts & Theatre":
          classValues[2] += 1;
          break;
        case "Miscellaneous":
          classValues[3] += 1;
          break;
        case "Film":
          classValues[4] += 1;
          break;
      }
    }

    console.log(city, classValues)




    var trace1 = {
      labels: classLabels,
      values: classValues,
      type: 'pie',
      text: classLabels
    };

    var data2 = [trace1];

    // var layout = {
    //   title: "'Bar' Chart",
    // };

    Plotly.newPlot("pie", data2);




    // showMap(data, myMap);

  });

  buildScatter(city)

}

var cityDataTest = {};

function init() {
  var firstCity = 'Kansas City'
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");


  //selector.on("change", optionChanged );
  // Use the list of sample names to populate the select options

  d3.json("/names").then(function (cityNames) {

    for (var j = 0; j < cityNames.city.length; j++) {
      //console.log('test99: ', cityNames.baloney[j]);
      //     cityNames.forEach((city) => {
      selector
        .append("option")
        .text(cityNames.city[j])
        .property("value", cityNames.city[j]);
    }
    firstCity = cityNames.city[0];
    //console.log('t99:', firstCity);

  });
  //console.log('t100:', firstCity);

  buildVenueList(firstCity);

  buildCharts(firstCity);

  console.log('b4 init load Markers ', cityDataTest);
  //loadMarkers(cityDataTest);

}


function optionChanged(newCity) {
  // Fetch new data each time a new sample is selected
  //clear venue table
  var tbody = d3.select("tbody");
  tbody.selectAll("*").remove();

  console.log(newCity);
  buildCharts(newCity);
  buildVenueList(newCity);

  //loadMarkers(cityDataTest);
  //  buildMetadata(newCity);
}

// Initialize the dashboard

var venueData = {};

var FirstTime = true;
var myMap = L.map("map", {
  //default to Kansas City,
  center: [39.10, -94.48],
  zoom: 11
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: "pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ"

}).addTo(myMap);

FirstTime = false;

function venueChanged(newVenue) {
  console.log('Venue changed: ', newVenue);

  var tbody = d3.select("tbody");
  tbody.selectAll("*").remove();

  d3.json(`/venueinfo/${newVenue}`).then(function (data) {
    console.log('url', data.url[0])

    // Append one table row `tr` to the table body
    var row = tbody.append("tr");

    // Append one cell for the student name
    row.append("td").text(data.venue[0]);

    // Append one cell for the student grade
    row.append("td").text(data.address[0]);
    row.append("td").append("a").attr("href", data.url[0]).text(data.url[0]);

  });

}


init();

