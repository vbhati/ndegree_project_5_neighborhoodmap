## Neighborhood Map

"In The Neighborhood" website displays nearby (using user's current coordinates if allowed or default location) cafe locations on Google map. User can filter the list of cafe's, get the details about particular cafe and view results for nearby cities as well.

#### Instructions:

 * Launch the application using following link: http://in-the-neighborhood.appspot.com/

 * Application will try to access user's current location to display results. If denied, it will display cafe results for 		Mountain View location.

 * You can filter the cafe's by clicking on hamburger icon, which displays the list of cafe's and a text box to filter list.

 * Filter functionality filters both list and markers on map. It is case insensitive and can be performed on any part of string.

 * Details about cafe can be viewed by either click on name in the list or the marker, that displays infobox on map.

 * Infobox provides details about cafe's name, address, phone (if any), reviews (if any), website url(if any)

 * For small screen devices list automatically closes after the click on cafe name from the list.

#### Tested on following Browsers:
 * Chrome
 * Firefox
 * IE

#### Implementation:
Website is implemented using HTML, HTML5(Geolocation api), CSS, JavaScript, JQuery, External Api's (Google map, Foursquare and Geonames), Grunt (for minification) and Knockout.js(as MVVM)
Code details: Please refer related files for detailed comments.

#### Tools Used:

Chrome canary developer tools.

ngrok

Grunt

#### Resources used as reference:

http://knockoutjs.com/index.html

http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html

http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html

https://developer.foursquare.com/start/search

http://www.geonames.org/

http://stackoverflow.com/questions/19942641/knockout-js-array-filter-syntax

http://findicons.com/

http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/docs/reference.html

http://jsfiddle.net/jEhJ3/597/

https://developers.google.com/maps/documentation/javascript/

http://www.codeproject.com/Articles/351298/KnockoutJS-and-Google-Maps-binding

http://stackoverflow.com/questions/2304863/how-to-write-a-good-readme

http://docs.writethedocs.org/writing/beginners-guide-to-docs/

http://jshint.com/
