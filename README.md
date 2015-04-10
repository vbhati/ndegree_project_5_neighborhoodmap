## Neighborhood Map
#### http://in-the-neighborhood.appspot.com/

"In The Neighborhood" website displays nearby (using user's current coordinates if allowed or default location) cafe locations on Google map. It implements following functionalities:

1. Lists cafe's in the form of markers on map as well as text in a list.

2. List can be viewed using hamburger icon on the page.

3. List can be searched/filtered using search textbox. Filtered list also filters markers on map.

4. Clicking item in the list will display info about that place on Google map marker.

5. It takes care of closing infoboxes when multiple items are clicked from the list.

6. Infobox provides details about cafe's name, address, phone (if any), reviews (if any), website url(if any)

7. Apart from default location user can search for cafe's in nearby cities by selecting  one under heading section.

8. Application takes care of updating map with new markers and list data.

9. Website render on-screen in a responsive manner accross devices.


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
