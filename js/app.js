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
	} else {
		// Set default location to Mountain View
		latitude = 37.3847625;
		longitude = -122.088205;
	}

    var pyrmont = new google.maps.LatLng(latitude,longitude);
	map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 13
    });

	if(defaultData)
   		fetchData();
   	else
   		processData();
};

function fetchData() {
	var request = {
    		location: new google.maps.LatLng(latitude,longitude),
    		radius: '500',
    		query: 'cafe'
  	};
  	service = new google.maps.places.PlacesService(map);
	service.textSearch(request,callback);
};

function callback(results,status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		console.log(results);
  		dataFromServer = results;
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
			console.log(self.dataList());
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
		self.name = ko.observable(data.name);
	    self.address = ko.observable(data.formatted_address);

	    if(!defaultData) {
	    	self.lat = ko.observable(data.lat);
			self.lng = ko.observable(data.lng);
	    } else {
	    	self.lat = ko.observable(data.geometry.location.lat());
	    	self.lng = ko.observable(data.geometry.location.lng());
	    }
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