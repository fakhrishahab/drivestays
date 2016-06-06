'use strict';
var geocoder;

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

var element = {
	formSearchId : 'form-search',
	inputLocation : $('#search-location'),
	inputStayType : $('#stay-type'),
	inputSiteType : $('#site-type'),
	inputArrival : $('#search-arrival'),
	inputDeparture : $('#search-departure'),
	btnSearch : $('#btn-find-site'),
	inputLat : $('#location-lat'),
	inputLong : $('#location-long')
}

var placeSearch, autocomplete;
var componentForm = {
	street_number: 'short_name',
	route: 'long_name',
	locality: 'long_name',
	administrative_area_level_1: 'short_name',
	country: 'long_name',
	postal_code: 'short_name'
};

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

		map.setCenter(pos);

		}, function() {
		});
	} else {
		// Browser doesn't support geolocation
	}

	// Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
    	(document.getElementById('search-location')),
        {types: ['geocode']});

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
	detectSite(map)
}

function detectSite(map){
	var latlang = [
		{
			'lat' : -6.259669,
			'long' : 106.806074
		},
		{
			'lat' : -6.256757,
			'long' : 106.802179
		},
		{
			'lat' : -6.265108,
			'long' : 106.800548
		},
		{
			'lat' : 40.737998,
        	'long' : -73.928678
		},
		{
			'lat' : 40.753893,
        	'long' : -73.925052
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

function fillInAddress() {
	var place = autocomplete.getPlace();
	element.inputLat.val(place.geometry.location.lat())
	element.inputLong.val(place.geometry.location.lng())
}

// Function wrapper for datepicker arrival and departure date
var datepicker = new Function();

$.extend(datepicker.prototype, {
	startPicker : '',
	endPicker : '',
	startDate : '',
	endDate: '',
    selectedMonth: '',
	set : function(id, type){
		switch(type){
			case 'start' : 
				return this.startPicker = new Pikaday({
					field : document.getElementById(id),
					numberOfMonths: 2,
					minDate: new Date(),
					onSelect: function(){
						datepicker.prototype.startDate = this.getDate();
						datepicker.prototype.updateStartDate(this.getDate());

						if(datepicker.prototype.endDate == ''){
						    datepicker.prototype.endPicker.show();
						}
					}
				})
			break;

			case 'end' : 
				return this.endPicker = new Pikaday({
					field : document.getElementById(id),
					numberOfMonths: 2,
					minDate: new Date(),
					onSelect: function(){
						datepicker.prototype.endDate = this.getDate();
						datepicker.prototype.updateEndDate(this.getDate());

						if(datepicker.prototype.startDate == ''){
							datepicker.prototype.startPicker.show()
						}
					}
				})
			break;
		}
	},
	updateStartDate : function(date){
		this.startPicker.setStartRange(date)
		this.endPicker.setStartRange(date)
		this.endPicker.setMinDate(date)
        this.endPicker.gotoMonth(date.getMonth());
	},
	updateEndDate: function(date){
	    this.endPicker.setEndRange(date);
	    this.startPicker.setEndRange(date);
		this.endPicker.gotoMonth(date.getMonth());
	}

})

datepicker.prototype.set('search-arrival', 'start')
datepicker.prototype.set('search-departure', 'end')

element.btnSearch.on('click', function(){
	var dataSearch = {
		'location' : element.inputLocation.val(),
		'stay_type' : element.inputStayType.val(),
		'site_type' : element.inputSiteType.val(),
		'arrival_date' : element.inputArrival.val(),
		'departure_date' : element.inputDeparture.val(),
		'latitude' : element.inputLat.val(),
		'longitude' : element.inputLong.val()
	}
	if($(this).validation(element.formSearchId) == undefined){
		_cookies.putObject('siteSearch', dataSearch)
		window.location.href="./search.html"
	}
});

// element.inputLocation.on('keyup', function(){
// 	var elm = $(this);
// 	var value = $(this).val();
// 	// $.ajax({
// 	// 	url : 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=new&key=AIzaSyDXqltJrI76CiMGGWTl3rHX_erijqIaxkk',
// 	// 	type : 'GET',
// 	// 	dataType: 'jsonp',
// 	// 	headers: {
//  //            'Access-Control-Allow-Origin': '*'
//  //        },
// 	// 	success:function(data){
// 	// 		// console.log(data)
// 	// 	},
// 	// 	error: function(data, status, header){
// 	// 		// console.log(data)
// 	// 	}

// 	// })
// // console.log($(this))
// 	geocoder.geocode({'address' : value}, function(result, status){
// 		console.log(result)
// 		if(status == google.maps.GeocoderStatus.OK){
// 			if(result.length > 0){

			
// 				var listContainer = '<ul class="input-autocomplete"></ul>';
// 				// listContainer.insertAfter($(this))
// 				elm.after(listContainer)
// 			}
// 		}
// 	})
// });
