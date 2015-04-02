var map;
var lat = 37.3708905;
var lon = -121.9675525;
var request;
var m_ViewModel;
//var dataFromServer;
var markerArray=[];
var image = 'images/food1.png';

function createMap(){
    var pyrmont = new google.maps.LatLng(lat,lon);
	map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });
};

// Model
var model = {
		init: function() {
			var request = {
    			location: new google.maps.LatLng(lat,lon),
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
		// returns array of cats
}

// Controller
var ViewModel = function() {
	var self = this;
    self.dataList = ko.observableArray([]);
    self.filter = ko.observable("");

   // model.init();
   // setTimeout(function() {
      // Do something after 1 second
		dataFromServer.forEach(function(data){
			self.dataList.push(new Location(data));
			console.log(self.dataList());
		});

		self.filteredList = ko.computed(function(){
			var filter = self.filter().toLowerCase();
    		if (!filter) {
        		return self.dataList();
    		} else {
    			for(var i = 0 ; i < self.dataList().length ; i ++) {
    				self.dataList()[i].mapMarker().marker().setMap(null);
    				//console.log(self.dataList()[i].mapMarker().marker())
    			}
        		return ko.utils.arrayFilter(self.dataList(), function(data) {
            	console.log(" item marker : " + data.mapMarker().marker() + data[Location]);
            		var text = data.name().toLowerCase();
            		if(text.indexOf(filter) >= 0){
            			for(var i = 0 ; i < markerArray.length ; i++) {
							//console.log(markerArray[i].marker());
							if(markerArray[i].marker() == data.mapMarker().marker())
							{
								console.log("I am in");
								data.mapMarker().marker(markerArray[i].marker());
							}
						}
						return data;
            		}

        		});
    		}
		});


		// animate marker corresponding to list item when selected
		self.showClickedItem = function(item) {
			for(var i = 0 ; i < markerArray.length ; i++) {
				console.log(markerArray[i].marker());
			}
        };



	//}, 1500);
};

var Location = function(data) {
	var self = this;
	self.name = ko.observable(data.name);
    self.address = ko.observable(data.formatted_address);

    //TODO
    //uncomment below two lines once start using google maps.
   // self.lat = ko.observable(data.geometry.location.lat());
   // self.lng = ko.observable(data.geometry.location.lng());
    //static data
    self.lat = ko.observable(data.lat);
	self.lng = ko.observable(data.lng);
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

$('#searchList').keyup(function(){
    var valThis = $(this).val().toLowerCase();
    if(valThis == ""){
        $('.dlist > li').show();
    } else {
        $('.dlist > li').each(function(){
            var text = $(this).text().toLowerCase();
            (text.indexOf(valThis) >= 0) ? $(this).show() : $(this).hide();
        });
   };
});

$(document).ready(function () {
   createMap();
   ko.applyBindings(new ViewModel);
});