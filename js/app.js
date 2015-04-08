var map;
var latitude;
var longitude;
var dataFromServer;
var city;
var geonames;
// icon downloaded from : https://mapicons.mapsmarker.com/
var image = 'images/coffee.png';

/*
	This method is called on page load. It used HTML5 geolocation api to get user's current location
	and then calls the createMap method.
	geoOptions: see details in document.ready function
*/
function initialize(geoOptions) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			createMap,geoError,geoOptions);
	} else {
		alert('Geolocation is not supported for this Browser version.');
	}
};

/*
	geoError is a callback method from getCurrentPosition().
	If there is any error getting user's location, this method is called by passing error code.
*/
function geoError(error) {
	console.log('Error occurred. Error code: ' + error.code);
	switch(error.code){
		case 0:
        	alert("Unknown Error. Please try again later.");
        	break;
        case 1:
        	console.log("Permission Denied.");
        	// If use has chosen not to share their location use default location. i.e. Mountain View
        	// Set default values for latitude and longitude.
			latitude = 37.3847625;
			longitude = -122.088205;
			createMap(null);
        	break;
        case 2:
        	alert("Position Unavailable.");
        case 3:
        	alert("Service Timed out.");
        default:
        	alert("Oops!! There is some issue. Please try again later.")
	}
}

/*
	createMap creates a google map and also gets the name of city for given coordinates
	using Reverse Geocoding api from Google maps. City will be used by geonames api to get
	list of nearby cities.
*/
function createMap(position){
	// use coordinates from html5 geolocation api. i.e. user's location
	if(position !== null) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
	}

	var mapOptions = {
    	disableDefaultUI: false
  	};

  	// This next line makes `map` a new Google Map JavaScript Object and attaches it to <div id="map">
  	map = new google.maps.Map(document.querySelector('#map'), mapOptions);


	// get the city from given latitude and longitude. This city will be used by geonames api
	// to get nearby cities.
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(latitude, longitude);
	var flag = false;
  	geocoder.geocode({'latLng': latlng}, function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
          	var address_component = results[0].address_components;
           	for (j = 0 ; j < address_component.length ; ++j) {
           		var types = address_component[j].types;
           		for (k = 0 ; k < types.length ; ++k) {
           			//find city
					if (types[k] == "locality") {
               		//set city name
               			city = address_component[j].long_name;
               			flag = true;
               			break;
               		}
           		}
           		if(flag)
           			break;
           	}
           	// call this method to get the data from foursquare
           	fetchData();
    	} else {
      		alert('Geocoder failed due to: ' + status);
    	}
  	});
};


/*
	This method fetches data from foursquare api using the city.
*/
function fetchData() {
	var url = 'https://api.foursquare.com/v2/venues/explore?client_id=NGDMJK52C2E24XBBXUBJAVGY0JZ5NXEQLYSXP4WEXXN5SKRJ&client_secret=ULZX0RYWBOZIMK4DF30TX0S42CSJSP1FUTOG2HF0ERCBSKDI&v=20130815%20&limit=15&near='+ city + '&section=coffee&radius=500';
	$.ajax({
        url: url,
        dataType: "json",
        success: function(response) {
        	// set the data in dataFrom Server variable to be used later by ViewModel.
            dataFromServer = response.response.groups[0].items;
            // get the nearby cities for given location.
            getNearbyCities();
        }
    }).error(function() {
        alert("Issue getting data from foursquare.");
    });
};

/*

*/
function getNearbyCities() {
	var nearbyCitiesurl = 'http://api.geonames.org/findNearbyPlaceNameJSON?lat=' + latitude + '&lng=' + longitude + '&username=wolverine&cities=cities15000&radius=10';
	$.ajax({
        url: nearbyCitiesurl,
        dataType: "json",
        success: function(response) {
            geonames = response.geonames;
            processData();
        }
    }).error(function() {
        alert("Issue getting nearby cities from geonames.");
    });
}


function processData() {

	// Controller
	var ViewModel = function() {
		var self = this;
		var info;
	    self.filter = ko.observable("");
	    var clearMap = false;
	    self.dataList = ko.observableArray([]);
	    self.nearbyCities = ko.observableArray([]);

	    // set the venue data (recieved from foursquare api) in self.dataList observable
		dataFromServer.forEach(function(data){
			self.dataList.push(new Venue(data));
		});

		// set the nearby cities data (recieved from geonames api) in self.nearbyCities observable
		geonames.forEach(function(data){
			if(data.name != city){
				self.nearbyCities.push(new NearbyCities(data));
			}
		});

		// if user has provided filter value then return only matching entries for the list
		// or else return the entire list
		self.filteredList = ko.computed(function(){
			var filter = self.filter().toLowerCase();
			// if no filter value provided
    		if (!filter) {
    			// if map has no markers, create them
    			if(clearMap == true) {
    				for(var i = 0 ; i < self.dataList().length ; i ++) {
    					self.dataList()[i].mapMarker().marker().setMap(map);
    				}
    				return self.dataList();
    			// return the original list with markers
    			} else {
    				return self.dataList();
    			}
    		// if search filter value is provided
    		} else {
    			/*
    				use ko.arrayFilter to filter list. ko.utils.arrayFilter allows to pass in an array and
    				control which items are included based on the result of the function executed on each item.
					http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
    			*/
    			return ko.utils.arrayFilter(self.dataList(), function(data) {
    				// remove the existing markers from map.
            		data.mapMarker().marker().setMap(null);
            		// remove opened infoboxes if there are any on the map.
            		if(info !== null && info !== undefined) {
						info.close();
					}
            		clearMap = true;
            		var text = data.name().toLowerCase();
            		//apply filter
            		if(text.indexOf(filter) >= 0){
            			// add the related marker to map
						data.mapMarker().marker().setMap(map);
						// add event listener for infobox
						google.maps.event.addListener(data.mapMarker().marker(), 'click', function() {
        					data.mapMarker().infobox().open(map, data.mapMarker().marker());
        				});
						return data;
            		}
        		});
    		}
		});


		// show infobox corresponding to list item when selected
		self.showClickedItem = function(item) {
			// close any infobox already opened.
			if(info !== null && info !== undefined) {
				info.close();
			}
			item.mapMarker().infobox().open(map, item.mapMarker().marker());
			// add opened infobox to info variable to keep track of it.
        	info = item.mapMarker().infobox();
        };

        // update results with user selected city
        self.updateData = function(item) {
        	latitude = item.lat;
        	longitude = item.lng;
        	// clean the existing bindings and startover for new location.
        	ko.cleanNode(document.body);
        	createMap(null);
        };
	};

	// Venue object
	var Venue = function(data) {
		var self = this;
		var obj = data.venue;
		self.name = ko.observable(obj.name);
	    self.address = ko.observable(obj.location.formattedAddress[0] + obj.location.formattedAddress[1] + obj.location.formattedAddress[2]);
	    self.lat = ko.observable(obj.location.lat);
	    self.lng = ko.observable(obj.location.lng);
	    self.id = ko.observable(obj.id);
		self.mapMarker = ko.observable(new MapMarker(self));
	};

	// MapMarker object
	var MapMarker = function(parent) {
		var self = this;
		self.parent = parent;
		// create map markers for the venues
		self.marker = ko.computed(function(){
	    	var marker = new google.maps.Marker({
	      		map: map,
	      		position : new google.maps.LatLng(parent.lat(), parent.lng()),
	      		title: parent.name(),
	      		icon: image
	    	});
	    	return marker;
	    });

		// create infobox for marker
		self.infobox = ko.computed(function(){
			// http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/docs/examples.html
			var boxText = document.createElement("div");
        	boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: yellow; padding: 5px; border-radius:5px;";
        	boxText.innerHTML = self.parent.name() + self.parent.address();

			var box = new InfoBox({
	        content: boxText,
	        disableAutoPan: false,
	        maxWidth: 150,
	        pixelOffset: new google.maps.Size(-140, 0),
	        zIndex: null,
	        boxStyle: {
	           	background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
	        	   	opacity: 0.75,
	            	width: "280px"
	        	},
	        	closeBoxMargin: "12px 4px 2px 2px",
	        	closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
	        	infoBoxClearance: new google.maps.Size(1, 1)
	    	});
			return box;
		});

		// add click event listener to marker.
		google.maps.event.addListener(self.marker(), 'click', function() {
        	self.infobox().open(map, self.marker());
		});

		var bounds = window.mapBounds;            // current boundaries of the map window
		// this is where the pin actually gets added to the map.
    	// bounds.extend() takes in a map location object
    	bounds.extend(new google.maps.LatLng(parent.lat(), parent.lng()));
    	// fit the map to the new marker
    	map.fitBounds(bounds);
    	// center the map
    	map.setCenter(bounds.getCenter());
	}

	// NearbyCities object
	var NearbyCities = function(data){
		var self = this;
		self.name = data.name;
		self.lat = data.lat;
		self.lng = data.lng;
	}

	ko.applyBindings(new ViewModel);
}

$(document).ready(function () {
	// Sets the boundaries of the map based on pin locations
  	window.mapBounds = new google.maps.LatLngBounds();
	// Vanilla JS way to listen for resizing of the window
	// and adjust map bounds
	window.addEventListener('resize', function(e) {
  		// Make sure the map bounds get updated on page resize
 		map.fitBounds(mapBounds);
 	});
	/*
	 * Use the maximumAge optional property to tell the browser to use a recently obtained geolocation result.
	 * This not only returns quicker if the user has requested the data before it also stops the browser from
	 * having to start up its geolocation hardware interfaces such as Wifi triangulation or the GPS.
	*/
	var geoOptions = {
		maximumAge: 5 * 60 * 1000,
	}
	initialize(geoOptions);

});