var map;
var latitude;
var longitude;
var m_ViewModel;
//var dataFromServer;
var markerArray=[];
var image = 'images/food1.png';
var defaultData = true;

function initialize(geoOptions) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			createMap,geoError,geoOptions);
	} else {
		alert('Geolocation is not supported for this Browser version.');
	}
};

function geoError(error) {
	console.log('Error occurred. Error code: ' + error.code);
	switch(error.code){
		case 0:
        	alert("Unknown Error. Please try again later.");
        	break;
        case 1:
        	console.log("Permission Denied.");
        	// Set default location to Mountain View
			latitude = 37.3847625;
			longitude = -122.088205;
			createMap(null);
        	break;
        case 2:
        	alert("Position Unavailable.");
        case 3:
        	alert("Service Timed out.");
        default:
        	alert("Oops!! There is some issue. Please check back again later.")
	}
}

function createMap(position){
	if(position !== null) {
		defaultData = false;
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
	}

    var pyrmont = new google.maps.LatLng(latitude,longitude);
	map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 13
    });

	fetchData();
};

function fetchData() {
	/*var request = {
    		location: new google.maps.LatLng(latitude,longitude),
    		radius: '500',
    		query: 'cafe'
  	};
  	service = new google.maps.places.PlacesService(map);
	service.textSearch(request,callback); */

	var photourl='https://api.foursquare.com/v2/venues/4afafbc0f964a520171a22e3/photos?client_id=NGDMJK52C2E24XBBXUBJAVGY0JZ5NXEQLYSXP4WEXXN5SKRJ&client_secret=ULZX0RYWBOZIMK4DF30TX0S42CSJSP1FUTOG2HF0ERCBSKDI&v=20150405&query=Kifer%20Deli%20Cafe';
	var url = 'https://api.foursquare.com/v2/venues/explore?client_id=NGDMJK52C2E24XBBXUBJAVGY0JZ5NXEQLYSXP4WEXXN5SKRJ&client_secret=ULZX0RYWBOZIMK4DF30TX0S42CSJSP1FUTOG2HF0ERCBSKDI&v=20130815%20&limit=15&near=Mountain%20View&section=coffee&radius=500';
	$.ajax({
        url: url,
        dataType: "json",
        success: function(response) {
            var venues = response.response.groups[0].items;
            dataFromServer = venues;
  			console.log(dataFromServer);

  			processData();
         /*   for(var i = 0 ; i < venues.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="' + url +'">' +
                    articleStr + '</a></li>');
            };
            clearTimeout(wikiRequestTimeout);*/
        }
    });
};

function callback(results,status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		console.log(results);
  		dataFromServer = results;
  		console.log(dataFromServer);
  		processData();
  	}
}


function processData() {

	// Controller
	var ViewModel = function() {
		var self = this;
	    self.dataList = ko.observableArray([]);
	    self.filter = ko.observable("");
	    var clearMap = false;

		dataFromServer.forEach(function(data){
			self.dataList.push(new Location(data));
			//console.log(self.dataList());
		});

		self.filteredList = ko.computed(function(){
			var filter = self.filter().toLowerCase();
    		if (!filter) {
    			if(clearMap == true) {
    				for(var i = 0 ; i < self.dataList().length ; i ++) {
    					self.dataList()[i].mapMarker().marker().setMap(map);
    				}
    				return self.dataList();
    			} else {
    				return self.dataList();
    			}
    		} else {
    			return ko.utils.arrayFilter(self.dataList(), function(data) {
            	//	console.log(" item marker : " + data.mapMarker().marker() + data[Location]);
            		data.mapMarker().marker().setMap(null);
            		clearMap = true;
            		var text = data.name().toLowerCase();
            		if(text.indexOf(filter) >= 0){
						data.mapMarker().marker().setMap(map);
						google.maps.event.addListener(data.mapMarker().marker(), 'click', function() {
        					data.mapMarker().infobox().open(map, data.mapMarker().marker());
        				});
						return data;
            		}
        		});
    		}
		});


		// animate marker corresponding to list item when selected
		self.showClickedItem = function(item) {
			console.log(item.mapMarker().marker());
			for(var i = 0 ; i < markerArray.length ; i++) {
				console.log(markerArray[i].marker());
				if(item.mapMarker().marker() === markerArray[i].marker()) {
					item.mapMarker().marker().setAnimation(google.maps.Animation.DROP);
				}
			}
        };
	};

	var Location = function(data) {
		var self = this;
		var obj = data.venue;
		self.name = ko.observable(obj.name);
	    self.address = ko.observable(obj.location.formattedAddress[0] + obj.location.formattedAddress[1] + obj.location.formattedAddress[2]);
	    self.lat = ko.observable(obj.location.lat);
	    self.lng = ko.observable(obj.location.lng);
	    self.id = ko.observable(obj.id);

	    //TODO
	    //uncomment below two lines once start using google maps.
	    //self.lat = ko.observable(data.geometry.location.lat());
	    //self.lng = ko.observable(data.geometry.location.lng());
	    // for static data i.e. when data coming from data.js
	   // self.lat = ko.observable(data.lat);
		//self.lng = ko.observable(data.lng);
		self.mapMarker = ko.observable(new LocMarker(self));
	};

	var LocMarker = function(parent) {
		var self = this;
		self.parent = parent;
		self.marker = ko.computed(function(){
	    // marker is an object with additional data about the pin for a single location
	    	var marker = new google.maps.Marker({
	      		map: map,
	      		//TODO
	      		//position: data.geometry.location,
	      		position : new google.maps.LatLng(parent.lat(), parent.lng()),
	      		title: parent.name(),
	      		icon: image
	    	});
	    	return marker;
	    });

		self.infobox = ko.computed(function(){

			var boxText = document.createElement("div");
        	boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: yellow; padding: 5px;";
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

		google.maps.event.addListener(self.marker(), 'click', function() {
        	self.infobox().open(map, self.marker());
		});
		markerArray.push(self);

	}

	ko.applyBindings(new ViewModel);
}

$(document).ready(function () {
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