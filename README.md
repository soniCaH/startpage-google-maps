# Personal startpage

Markers added for HOME, WORK (AMPLEXOR Heverlee) and your actual geolocation (if allowed).

If you are not at home, you will get travel times (and distance) indicators to home.

![Startpage screenshot](/screenshot.png)

# Development

Install dependencies

`npm install`

Build dist folder

`gulp build`

# Configuration

Edit `index.html` to change your name, obviously ;-)

Currently set to my own house (geolocation and address).
Change `src/scripts/app.js` to your needs:

`var myLatLng_home = {lat: 12.34567890, lng: 1.23456789};`
  Object with lat and lng properties.
  Update this to your default center of the map (first use + fallback if no geolocation allowed on the browser) + this will indicate your "home" with a marker.

`var home_address_string = "Trammezandlei+122,+Schoten,+Belgium";`
  String with spaces stripped out and replaced by '+' symbol.
  Update this to your address. This will be used to calculate travel times and distances.

`var myLatLng_work = {lat: 45.123456, lng: 4.512345};`
  Object with lat and lng properties.
  Update this to the coordinates of your work.
