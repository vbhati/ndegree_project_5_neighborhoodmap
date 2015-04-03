var map;
var latitude = 37.3708905;
var longitude = -121.9675525;
var m_ViewModel;
var dataFromServer;
var markerArray=[];
var image = 'images/food1.png';

function createMap(){
    var pyrmont = new google.maps.LatLng(latitude,longitude);
	map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });
};

var model = {
	init: function() {
		var request = {
    		location: new google.maps.LatLng(latitude,longitude),
    		radius: '500',
    		query: 'cafe'
  		};

		service = new google.maps.places.PlacesService(map);
		service.textSearch(request,model.callback);
	},
	callback : function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			console.log(results);
  			dataFromServer = results;
  		}
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

	    //TODO
	    //uncomment below two lines once start using google maps.
	    self.lat = ko.observable(data.geometry.location.lat());
	    self.lng = ko.observable(data.geometry.location.lng());
	    // for static data i.e. when data coming from data.js
	    //self.lat = ko.observable(data.lat);
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
   createMap();
   model.init();
   setTimeout(function() {
   	processData();
   }, 1500);
});