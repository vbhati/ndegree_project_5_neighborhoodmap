//global for map
var map;

$(document).ready(function () {

   createMap();
   ko.applyBindings(viewModel);
});

function MyViewModel() {
    var self = this;
    self.Lat = ko.observable(12.24);
    self.Lng = ko.observable(24.54);
}

function createMap(){
    var elevator;
    var myOptions = {
        zoom: 3,
        center: new google.maps.LatLng(12.24, 24.54),
        mapTypeId: 'terrain'
    };
    map = new google.maps.Map($('#map')[0], myOptions);
}

ko.bindingHandlers.map = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {


                var position = new google.maps.LatLng(allBindingsAccessor().latitude(), allBindingsAccessor().longitude());

                var marker = new google.maps.Marker({
                    map: allBindingsAccessor().map,
                    position: position,
                    title: name
                });

                viewModel._mapMarker = marker;
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var latlng = new google.maps.LatLng(allBindingsAccessor().latitude(), allBindingsAccessor().longitude());
                viewModel._mapMarker.setPosition(latlng);

            }
        };


var viewModel = new MyViewModel();
