var map;
var lat = 37.3708905;
var lon = -121.9675525;
var request;
var m_ViewModel;
//var markerList;
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
  				markerList = results;
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
		markerList.forEach(function(data){
			self.dataList.push(new place(data));
		});

		self.filteredList = ko.computed(function(){
			var filter = self.filter().toLowerCase();
    		if (!filter) {
        		return self.dataList();
    		} else {
        		return ko.utils.arrayFilter(self.dataList(), function(item) {
            		return ko.utils.stringStartsWith(item.name().toLowerCase(), filter);
        		});
    		}
		});


		// animate marker corresponding to list item when selected
		self.showClickedItem = function(item) {
			console.log(item.marker());
			for(var i = 0 ; i < markerArray.length ; i++) {
				if(markerArray[i] == item.marker()) {
					 markerArray[i].setAnimation(google.maps.Animation.DROP);
				}
			}
        };



	//}, 1500);
};

var place = function(data) {
	this.name = ko.observable(data.name);
    this.address = ko.observable(data.formatted_address);

    //TODO
    //uncomment below two lines once start using google maps.
   // this.lat = ko.observable(data.geometry.location.lat());
   // this.lng = ko.observable(data.geometry.location.lng());
    //static data
    this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);

    this.marker = ko.computed(function(){
    	    // marker is an object with additional data about the pin for a single location
    	var marker = new google.maps.Marker({
      		map: map,
      		//TODO
      		//position: data.geometry.location,
      		position : new google.maps.LatLng(data.lat, data.lng),
      		title: data.name,
      		icon: image
    	});
    	markerArray.push(marker);
    	return marker;
    },this);
};

ko.bindingHandlers.map = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		console.log("I am in");
	}
};

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