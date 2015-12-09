/**
 * @file
 * Startpage JavaScript functionality. Including Maps, Travel Time etc...
 */

/**
  * @var color
  *   Color scheme for icons.
  * 
  * Possible options are: blue, red, yellow and green.
  */
var color = 'blue';

/**
  * @var map
  *   Re-usable variable holding the google maps.
  */
var map = null;

/**
 * @var last_position
 *   Store the last geolocated position.
 */
var last_position;

/**
 * @var image_user
 *   Image indicating user position on the map (geocoded).
 */
var image_user = 'images/user-' + color + '.png';

/**
 * @var image_home
 *   Image indicating "Home".
 */  
var image_home = 'images/home-' + color + '.png';

/**
 * @var image_work
 *   Image indicating "Work" (AMPLEXOR Heverlee).
 */
var image_work = 'images/work-' + color + '.png';

/**
 * @var map_element
 *   HTML DOM Element containing the map container.
 */
var map_element = document.getElementById('map');

/**
 * @var routes_element
 *   HTML DOM Element containing the routes.
 */
var routes_element = document.getElementById('routes');

/**
 * @var map_style
 *   Syles array with colors for the map rendering.
 * 
 * @seealso https://snazzymaps.com/style/15/subtle-grayscale
 */
var map_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

/**
 * @var marker_actual
 *   Holding the marker for the current position.
 */
var marker_actual;

/**
 * @var myLatLng_home
 *   Latitude and Longitute for "Home".
 */
var myLatLng_home = {lat: 50.996039, lng: 4.477497};

/**
 * @var home_address_string
 *   String version of my home address (travel info destination point).
 */
var home_address_string = "Geerdegemstraat+111B,+2800+Mechelen,+Belgium";

/**
 * @var marker_home
 *   Holding the marker for "Home".
 */
var marker_home;

/**
 * @var myLatLng_home
 *   Latitude and Longitute for "Work" (AMPLEXOR Heverlee).
 */
var myLatLng_work = {lat: 50.865119, lng: 4.669243};

/**
 * @var marker_work
 *   Holding the marker for "Work" (AMPLEXOR Heverlee).
 */
var marker_work;

/**
 * @var traffic_layer
 *   Google Maps layer holding traffic situation (Real-time).
 */
var traffic_layer;

/**
 * @var directions_service
 *   Google Maps Direction API Service.
 */
var directions_service;

function initMap() {
  // Check if this is the first time we call initMap.
  // If so, create a new map and render it.
  // Otherwise, we just update our locations.
  if (!map) {
    // Check if localStorage is accessible in the browser.
    if (typeof(Storage) !== "undefined") {
      // Retrieve last stored geolocation.
      last_position = localStorage.getItem("start_last_position");
      
      // Check if there is a last stored location.
      if (last_position) {
        last_position = JSON.parse(last_position);
        // Create a map, centered on the last known position.
        map = new google.maps.Map(map_element, {
          center: last_position,
          zoom: 11,
        });
    
        // Pin a marker on the current location.
        marker_actual = new google.maps.Marker({
          position: last_position,
          map: map,
          title: 'CURRENTLY',
          icon: image_user
        });
      }
      else {
        // Center the map on our "home" coordinates.
        map = new google.maps.Map(map_element, {
          center: {lat: 51.0167, lng: 4.4667},
          zoom: 11,
        });
      }
    }
    
    // Apply color settings to the map object.
    map.setOptions({styles: map_style});
    
    // Initialize a maker on the "HOME" geolocation.
    marker_home = new google.maps.Marker({
      position: myLatLng_home,
      map: map,
      title: 'HOME',
      icon: image_home
    });
    
    // Initialize a maker on the "WORK" geolocation.
    marker_work = new google.maps.Marker({
      position: myLatLng_work,
      map: map,
      title: 'AMPLEXOR HEVERLEE',
      icon: image_work
    });
  }
  
  // Initialize a "Current traffic" layer and assign it to our map.
  traffic_layer = new google.maps.TrafficLayer();
  traffic_layer.setMap(map);
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      // Success.
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      var distance_to_home = 0;
      
      // Reset our marker.
      marker_actual.setMap(null);
      // Create a new marker on our geolocation.
      marker_actual = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'CURRENTLY',
        icon: image_user
      });

      // Re-center our map to our geolocation.
      map.panTo(pos);
      
      // Check if the "HOME" and "CURRENT" markers are not too close to each other.
      distance_to_home = getDistance(pos, myLatLng_home);
      
      if (distance_to_home < 500) {
        marker_home.setMap(null);
      }
  
      // Store geolocation in localStorage.
      localStorage.setItem("start_last_position", JSON.stringify(pos));
      
      directions_service = new google.maps.DirectionsService();
      
      calculateAndDisplayRoute(routes_element, directions_service, pos.lat+','+pos.lng, home_address_string);
      
      // var transitHTML = document.getElementById('transit');
      // calculateAndDisplayTransit(transitHTML, directions_service, pos.lat+','+pos.lng, "Geerdegemstraat+111B,+2800+Mechelen,+Belgium");
      
    }, function() {
      // Handle situation where no geolocation is found.
    });
  }
  
  // Automatically refresh the map/traffic/geolocation every "X" minutes.
  setTimeout(
    function() {
      initMap();
    },
    // 5 Minutes = 30.000ms (5 * 60 * 1000).
    30000
  );
}

/**
 * Calculate driving directions between location and destination 
 * and inject the routes (summary) to the HTML.
 * 
 * @param Object destination_element
 *   HTML Dom Elememt to inject the routes summary to.
 * @param Object directions_service
 *   Google Maps Directions Service API object.
 * @param String directions_origin
 *   Latitude and longitude (as a comma separated string) of the starting 
 *   location (geolocation if accessible).
 * @param String directions_destination
 *   String version of destination (Home address).
 * 
 * @return void
 */
function calculateAndDisplayRoute(destination_element, directions_service, directions_origin, directions_destination) {
  // Calculate route via Google Maps Directions API.
  directions_service.route({
    origin: directions_origin,
    destination: directions_destination,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true,
    unitSystem: google.maps.UnitSystem.METRIC,
    // DrivingOptions will only work with a Google for Work API key.
    drivingOptions: {
      departureTime: new Date(Date.now()),
      trafficModel: google.maps.TrafficModel.BEST_GUESS
    }
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      // Read the response.
      var routes = response.routes;
      var summary = [];
      
      for (var i = 0; i < routes.length; i++) {
          var route = routes[i];
          var sum = formatRoute(route);
          
          if (sum) {
            summary[i] = sum;
          }
          
          // Check if there is at least one route longer than 100m, indicate we are already home otherwise!
          destination_element.textContent = (summary.length > 0) ? "Travel home: "+formatArray(summary) : "Looks like you are home";
      }
    } else {
      // Error handling (no valid responsre returned).
    }
  });
}

/**
 * Calculate directions (by train) between location and destination 
 * and inject the routes (summary) to the HTML.
 * 
 * @param Object destination_element
 *   HTML Dom Elememt to inject the routes summary to.
 * @param Object directions_service
 *   Google Maps Directions Service API object.
 * @param String directions_origin
 *   Latitude and longitude (as a comma separated string) of the starting 
 *   location (geolocation if accessible).
 * @param String directions_destination
 *   String version of destination (Home address).
 * 
 * @return void
 */
function calculateAndDisplayTransit(destination_element, directions_service, directions_origin, directions_destination) {
  // Calculate route via Google Maps Directions API.
  directions_service.route({
    origin: directions_origin,
    destination: directions_destination,
    travelMode: google.maps.TravelMode.TRANSIT,
    provideRouteAlternatives: true,
    unitSystem: google.maps.UnitSystem.METRIC,
    transitOptions: {
      departureTime: new Date(Date.now()),
      // I don't like taking the subway/bus/tram.
      modes: [ google.maps.TransitMode.TRAIN ],
      routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS,
    }
  }, function(response, status) {
    // Read the response.
    if (status === google.maps.DirectionsStatus.OK) {
      var routes = response.routes;
      var summary = [];
      
      if (routes.length > 0) {
        for (var i = 0; i < routes.length; i++) {
          var route = routes[i];
          var sum = formatRouteTransit(route);
          
          if (sum) {
            summary[i] = sum;
          }
        }
        // Check if there is at least one route longer than 100m, indicate we are already home otherwise!
        destination_element.textContent = (summary.length > 0) ? "By public transport: "+formatArray(summary) : "";
      }
    } else {
      // Error handling.
    }
  });
}

/**
 * Take the route object returned by the API
 * and extract the info we want to display.
 * 
 * @param Object route
 *   The route object as read from the Google Maps API respons.
 * 
 * @return String
 *   Travel time + distance and summary indication.
 */
function formatRoute(route) {
  var summary = route.summary;
  var leg = route.legs[0];
  var distance = leg.distance.text;
  var travelTime = leg.duration.text;
  
  // Don't return something irrelevant (distance < 100m).
  if (leg.distance.value < '100') {
    return;
  }
  
  return travelTime + " (" + distance + ") via " + summary;
}

/**
 * Take the route object returned by the API
 * and extract the info we want to display for public transport.
 * 
 * @param Object route
 *   The route object as read from the Google Maps API respons.
 * 
 * @return String
 *   Travel time + distance indication.
 */
function formatRouteTransit(route) {
  var leg = route.legs[0];
  var distance = leg.distance.text;
  var travelTime = leg.duration.text;
  
  // Don't return something irrelevant (distance < 100m).
  if (leg.distance.value < '100') {
    return;
  }
  
  return travelTime + " (" + distance + ")";
}

/**
 * Take an array and join it with commas for the first items,
 * and add "and" between the two last items to form a nice sentence.
 * 
 * @param Array routes
 *   Array holding the route summaries.
 * 
 * @return String
 *   Formatted string
 */
function formatArray(routes_array){
  var routes_join = "";
  if (routes_array.length === 1) {
    // Only one item, no need to join anything.
    routes_join = routes_array[0];
  } else if (routes_array.length === 2) {
    // Only two items, no commas are needed.
    routes_join = routes_array.join(' and ');
  } else if (routes_array.length > 2) {
    // Join with commas, except between the last two items (Oxford comma added there).
    routes_join = routes_array.slice(0, -1).join(', ') + ', and ' + routes_array.slice(-1);
  }
  
  return routes_join;
}

/**
 * Helper function to retrieve rad.
 */ 
var rad = function(x) {
  return x * Math.PI / 180;
};

/**
 * Helper function to calculate distance between two location points.
 */
var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  
  // Return the distance in meters.
  return d;
};
