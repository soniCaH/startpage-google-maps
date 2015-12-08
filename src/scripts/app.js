// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

function initMap() {
  var color = 'blue';
  var map;
  
      
if (typeof(Storage) !== "undefined") {
  var last_pos = localStorage.getItem("start_last_position");
  if (last_pos) {
    last_pos = JSON.parse(last_pos);
    map = new google.maps.Map(document.getElementById('map'), {
      center: last_pos,
      zoom: 11,
    });
    
      var image_user = 'images/user-' + color + '.png';
  
  var marker_actual = new google.maps.Marker({
    position: last_pos,
    map: map,
    title: 'CURRENTLY',
    icon: image_user
  });
  }
  else {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 51.0167, lng: 4.4667},
      zoom: 11,
    });
  }
}
  
  
  
  // https://snazzymaps.com/style/15/subtle-grayscale
   var styles = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];
  
  map.setOptions({styles: styles});
  
  var image_home = 'images/home-' + color + '.png';
  
  var myLatLng_home = {lat: 50.996039, lng: 4.477497};
  var marker_home = new google.maps.Marker({
    position: myLatLng_home,
    map: map,
    title: 'HOME',
    icon: image_home
  });
  
  var image_work = 'images/work-' + color + '.png';
  
  var myLatLng_work = {lat: 50.865119, lng: 4.669243};
  var marker_work = new google.maps.Marker({
    position: myLatLng_work,
    map: map,
    title: 'WORK',
    icon: image_work
  });
  
  
  
       var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
  // var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      map.setCenter(pos);
      
  var image_user = 'images/user-' + color + '.png';
  
  var marker_actual = new google.maps.Marker({
    position: pos,
    map: map,
    title: 'CURRENTLY',
    icon: image_user
  });  
      localStorage.setItem("start_last_position", JSON.stringify(pos));
      
    }, function() {
      // handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}


;(function() {
  'use strict';
    
  var app = angular.module( 'startPageApplication', [] );
  
  app.service( 'TrafficTimeAPIService', [ '$http', function( $http ) {
    
    var routes = { };
    
    if (typeof(Storage) !== "undefined") {
      
      var last_pos  = localStorage.getItem("start_last_position");
      
      if (last_pos) {
        last_pos = JSON.parse(last_pos);
        
        var MapsAPI = 'https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyCd_kYWamyrPPio2Gm3mhwSknpiXVx4DRw&origin=' + last_pos.lat + ',' + last_pos.lng + '&destination=Geerdegemstraat+111B+2800+Mechelen+Belgium&mode=driving&alternatives=true&callback=JSON_CALLBACK';
        
        $http.get(MapsAPI).success(
          function(response){
            console.log(response["routes"]);
          }
        );
        
        
      }
    }
    
    return routes;
    
  }]);
  
  app.controller('startPageTrafficTimeController', [ '$scope', 'TrafficTimeAPIService', function( $scope, TrafficTimeAPIService ) {
   
  }]);
})();