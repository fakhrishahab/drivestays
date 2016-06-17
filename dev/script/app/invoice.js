'use strict';

function loadScript(src, callback) {
    if (!src) src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDfSvkBOL2nOfLZKDWaf66EbbO9poShFaA&libraries=places&callback=initMap';
    var script = document.createElement('script');
    script.type = "text/javascript";
    if (callback) script.onload = callback;
    document.getElementsByTagName("head")[0].appendChild(script);
    script.src = src;
}

loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDfSvkBOL2nOfLZKDWaf66EbbO9poShFaA&libraries=places&callback=initMap',
		function () {
		    console.log('google-loader has been loaded, but not the maps-API');
		});

var geocoder;
function initMap() {
	geocoder = new google.maps.Geocoder();

	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -34.397, lng: 150.644},
		zoom: 15,
		disableDefaultUI: true,
		scaleControl:false,
		zIndex:1,
		draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true
	});

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
			  	lng: position.coords.longitude
			};

		// map.setCenter(pos);

		}, function() {
		});
	} else {
		// Browser doesn't support geolocation
	}
	detectSite(map)
}

function detectSite(map){
	var latlang = [
		{
			'lat' : -6.259669,
			'long' : 106.806074
		}
	]
	var image = {
		url: './assets/images/marker.png',
		// This marker is 20 pixels wide by 32 pixels high.
		size: new google.maps.Size(35, 35),
		// The origin for this image is (0, 0).
		origin: new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at (0, 32).
		anchor: new google.maps.Point(35, 35)
	};

	map.setCenter({lat: -6.259669, lng:106.806074});

	var marker;
	for(var i=0; i < latlang.length; i++){
		marker = new google.maps.Marker({            
			position: new google.maps.LatLng(latlang[i].lat, latlang[i].long),
			map: map,
			icon: image,
			title: 'title'
		}); 
	}
	
}