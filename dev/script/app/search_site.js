// This Page is JS Library only for search site result page
// Author by FakhriShahab
// First Commit : March, 28 2016

'use strict';
var sites, site_data, site_detail;

function loadScript(src, callback){
	var script = document.createElement('script');
	script.type="text/javascript";
	if(callback) script.onload=callback;
	document.getElementsByTagName("head")[0].appendChild(script);
    script.src = src;
}

loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDfSvkBOL2nOfLZKDWaf66EbbO9poShFaA&libraries=places&callback=initMap',
		function(){
			console.log('google-loader has been loaded, but not the maps-API');
		});

// Variable Element
var slider_control = $('.slider-nav');
var element = {
	inputLocation : $('#search-location'),
	inputLat : $('#location-lat'),
	inputLong : $('#location-long'),
	inputArrival : $('#search-arrival'),
	inputDeparture : $('#search-departure'),
	inputStayType : $('#stay-type'),
	btnFindSite : $('#btn-find-site'),
	formSearch : 'form-search',
	configFilter : $('.config-filter'),
	refineWrapper : $('.refine-wrapper'),
	preloadWrapper : $('.reload-search'),
	paginationWrapper : $('.search-list-pagination'),
	resultList : $('.search-result-list')
}

var latlngbounds, infoWindow, autocomplete, markers=[], map, siteSearch, resultSite;

element.btnFindSite.on('click', function(){
	var dataSearch = {
		'location' : element.inputLocation.val(),
		'stay_type' : element.inputStayType.val(),
		'arrival_date' : element.inputArrival.val(),
		'departure_date' : element.inputDeparture.val(),
		'latitude' : element.inputLat.val(),
		'longitude' : element.inputLong.val()
	}
	_cookies.putObject('siteSearch', dataSearch)
	
	if($(this).validation(element.formSearch) == undefined){
		initMap()	
	}
});
// Callback function from Google Map API
// Google Map API call in search page html file
var offset, limit;
function initMap(offset, limit, type) {
	if(!offset)	offset = 0;

	if(!limit) limit = 10;

	siteSearch = _cookies.getObject('siteSearch');
	// Call the site data first before rendering the google map API

	element.resultList.empty();
	element.preloadWrapper.addClass('show')
	$.ajax({
	    url: SITE.API_PATH+'/properties/search',
	    type: 'POST',
	    data: {
	        "VehicleID" : 10,
	        "Longitude": siteSearch.longitude,
	        "Latitude": siteSearch.latitude,
	        "FromDate": siteSearch.arrival_date,
	        "ToDate": siteSearch.departure_date,
	        "Offset": offset,
            "Limit": limit
	    },
	    success: function (result) {
	    	// console.log(result)
			element.preloadWrapper.removeClass('show')
			if(result){
				sites = result.Properties;	
			}else{
				sites = '';
			}

	        var mapOptions

	        mapOptions = {
				zoom: map ? map.getZoom() : 14,
			  	center: {lat: parseFloat(siteSearch.latitude), lng: parseFloat(siteSearch.longitude)}
			}

		    // Init the API google map and bind with to the map element
			map = new google.maps.Map(document.getElementById('map-list'), mapOptions);

			if(result.Length == 0){
				element.resultList.append('<div class="col-12"><div class="search-null">I\'m Sorry,<br> No Data Found</div></div>')
				$('#detail-menu li[data-window-target=site-detail]').addClass('inactive')
	        }else{
	        	setMarkers(map, sites);
	        }

			moveMap(map)

			generatePage(result, limit)

			var indexPage = Math.ceil(offset/limit)
			$('a[data-index=1]', element.paginationWrapper).addClass('active')
			$('a[data-index='+indexPage+']', element.paginationWrapper).addClass('active')
			$('a[data-index='+indexPage+']', element.paginationWrapper).parent('li').siblings('li').find('a').removeClass('active')
			
	    },
	    error: function (status) {
	        console.log('error')
	    }
	});

	// Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
    	(document.getElementById('search-location')),
        {types: ['geocode']});

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
}	

function generatePage(result, limit){
	if(result){
		element.paginationWrapper.find('ul').empty()
		if(result.Length < limit){
			element.paginationWrapper.find('ul').empty()
		}else{
			var pageCount = Math.ceil(result.Length / limit)

			for(var i=1; i<pageCount; i++){
				var listPage = '<li><a data-index='+i+'>'+i+'</a></li>';
				element.paginationWrapper.find('ul').append(listPage)
			}

			$('a', element.paginationWrapper).on('click', function(){
				$(this).parents('ul').find('a').removeClass('active')
				$(this).addClass('active')
				initMap($(this).data('index') * 10)
			})
		}
	}
	
}

function moveMap(map){
	map.addListener('dragend', function(){	

		siteSearch.latitude = map.getCenter().lat()
		siteSearch.longitude = map.getCenter().lng()
		_cookies.putObject('siteSearch', siteSearch)
		initMap()
		// element.preloadWrapper.addClass('show')
		// sites = '';
		// $.getJSON('./search_site2.json', function(data){
		//     sites = data;
		// 	setMarkers(map, sites);
		// })	
    })
}

function fillInAddress() {
	var place = autocomplete.getPlace();
	element.inputLat.val(place.geometry.location.lat())
	element.inputLong.val(place.geometry.location.lng())
}
var marker;
function setMarkers(map, sites) {
	var image = {
		url: './assets/images/marker.png',
		// This marker is 20 pixels wide by 32 pixels high.
		size: new google.maps.Size(35, 35),
		// The origin for this image is (0, 0).
		origin: new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at (0, 32).
		anchor: new google.maps.Point(35, 35)
	};
	latlngbounds = new google.maps.LatLngBounds();

	clearMarker()

	for (var i = 0; i < sites.length; i++) {
		var site = sites[i];
		latlngbounds.extend(new google.maps.LatLng(site['Latitude'], site['Longitude']))
		marker = new google.maps.Marker({            
			position: new google.maps.LatLng(site['Latitude'], site['Longitude']),
			map: map,
			icon: image,
			title: site['AddressLine1'],
			zIndex: parseInt(site['ID'])
		}); 
		createMarker(marker, map, site) 
		var template = "\
		<div class='col-md-12 col-6'>\
			<div class='site-top-wrapper' data-id='"+sites[i]['ID']+"'>\
				<div class='site-img-thumb' style='background:url("+sites[i]['image']+")'>\
					<!--<div class='site-price'>$ "+sites[i]['price']+".00 /day</div>-->\
					<div class='site-img-user'><img src="+sites[i]['profile']+" alt=''></div>\
				</div>\
				<div class='site-location-rate'>\
					<div class='content'>\
						<div class='site-location'>\
							<div class='ds-pin'></div>\
							<div class='location-name'>"+sites[i]['City']+"</div>\
						</div>\
						<div class='site-rate'>\
							<img src='./assets/images/star.png'>\
							<img src='./assets/images/star.png'>\
							<img src='./assets/images/star.png'>\
							<img src='./assets/images/star.png'>\
							<img src='./assets/images/star.png'>\
			                (5)\
						</div>\
					</div>\
				</div>\
				<div class='site-top-title'>\
					<h2>"+sites[i]['AddressLine1']+"</h2>\
				</div>\
			</div>\
		</div>\
		";

		element.resultList.append(template)
	}

	$('.site-top-wrapper').on('click', function(){
		var id =$(this).data('id');
		var index;
		$.each(sites, function(key, val) {
			if(val['ID'] == id){
				index = key;
				_localStorage.put('site_data', sites[index]);
				site_data = _localStorage.get('site_data')
				showSiteDetail(index)
			}
		});
		google.maps.event.trigger(markers[index], 'click');
	})

	function clearMarker(){
		if(marker){
	        for (var i = 0; i < markers.length; i++) {
	            markers[i].setMap(null);
	        }
        	markers = [];
		}
	}

	function createMarker(marker, map, site){ 
		google.maps.event.addListener(marker, 'click', function(){
			showInfo(map, marker, site)
		})
		markers.push(marker)
	}

	function showInfo(map, marker, site, type){
		var content = "<div class='infoWindowWrapper'>\
			<h3>"+site['AddressLine1']+"</h3>\
			<div class='site-detail'>\
				<img src="+site['image']+">\
				<div class='site-location-window'>\
					<div class='ds-pin'></div>"+site['City']+"\
					<div class='site-desc-window'>"+site['description']+"</div>\
				</div>\
			</div>\
			<div class='btn-group-window'>\
				<button class='btn-blue see-detail' id='showDetail' data-id="+site['ID']+">See Detail</button>\
				<button class='btn-blue-light'>Request to Stay</button>\
			</div>\
		</div>"; 
		
		if(infoWindow)infoWindow.close();

		infoWindow = new google.maps.InfoWindow({
			maxWidth:300,
		  	content:content
		})		
			
		infoWindow.open(map, marker)	

		google.maps.event.addListener(infoWindow, 'domready', function(){
			$('.see-detail').on('click', function(){
				showDetail($(this).data('id'))
			})
		})

	}
}

// DATE PICKER LIBRARY
	var startDate,endDate,startDate2,endDate2,
		updateStartDate = function(){
			startPicker.setStartRange(startDate);
			endPicker.setStartRange(startDate);
			endPicker.setMinDate(startDate);
		},
		updateEndDate = function(){
			startPicker.setEndRange(endDate);
			startPicker.setMaxDate(endDate);
			endPicker.setEndRange(endDate);
		},
		updateStartDate2 = function(){
			startPicker2.setStartRange(startDate2);
			endPicker2.setStartRange(startDate2);
			endPicker2.setMinDate(startDate2);
		},
		updateEndDate2 = function(){
			startPicker2.setEndRange(endDate2);
			startPicker2.setMaxDate(endDate2);
			endPicker2.setEndRange(endDate2);
		},
		startPicker = new Pikaday({
			field: document.getElementById('search-arrival'),
			numberOfMonths: 2,
			minDate: new Date(),
			maxDate: new Date(2020, 12, 31),
			format: 'MM/DD/YYYY',
			onSelect: function(){
				startDate = this.getDate();
				updateStartDate();

				if(endPicker.getDate() == null){
					endPicker.show();	
				}
				
			}
		}),
		endPicker = new Pikaday({
			field: document.getElementById('search-departure'),
			numberOfMonths: 2,
			minDate: new Date(),
			maxDate: new Date(2020, 12, 31),
			format: 'MM/DD/YYYY',
			onSelect: function(){
				endDate = this.getDate();
				updateEndDate()

				if(startPicker.getDate() == null){
					startPicker.show();	
				}
			}
		}),
		startPicker2 = new Pikaday({
			field: document.getElementById('search-arrival2'),
			numberOfMonths: 2,
			minDate: new Date(),
			maxDate: new Date(2020, 12, 31),
			format: 'MM/DD/YYYY',
			onSelect: function(){
				startDate2 = this.getDate();
				updateStartDate2();
				if(endPicker2.getDate() == null){
					endPicker2.show();	
				}
			}
		}),
		endPicker2 = new Pikaday({
			field: document.getElementById('search-departure2'),
			numberOfMonths: 2,
			minDate: new Date(),
			maxDate: new Date(2020, 12, 31),
			format: 'MM/DD/YYYY',
			onSelect: function(){
				endDate2 = this.getDate();
				updateEndDate2()
				if(startPicker2.getDate() == null){
					startPicker2.show();	
				}
			}
		}),
		_startDate = startPicker.getDate(),
		_startDate2 = startPicker2.getDate(),
		_endDate = endPicker.getDate(),
		_endDate2 = endPicker2.getDate();

		if(_startDate){
			startDate = _startDate;
			updateStartDate()
		}

		if(_endDate){
			endDate = _endDate;
			updateEndDate()
		}

		if(_startDate2){
			startDate2 = _startDate2;
			updateStartDate()
		}

		if(_endDate2){
			endDate2 = _endDate2;
			updateEndDate()
		}


		// document.getElementById('search-arrival2').value = '2016-03-28'
		// document.getElementById('search-departure2').value = '2016-04-02'
		// startPicker2.setStartRange(new Date(2016, 2,28))
		// startPicker2.setEndRange(new Date(2016, 3,2))
		// endPicker2.setStartRange(new Date(2016, 2,28))
		// endPicker2.setEndRange(new Date(2016, 3,2))
			// startPicker2.setDate('2016-03-31')


function showDetail(id){
	$.each(sites, function(key, val) {
		if(val['ID'] == id){
			var index = key;
			site_data = _localStorage.get('site_data')

			$('#detail-menu li:last-child').removeClass('inactive')
			$('#detail-menu li:last-child').addClass('active')
			$('#detail-menu li:last-child').siblings('li').removeClass('active')
			$('.map-list').hide()
			$('.map-list').siblings('div').show()

			showSiteDetail(index)

			// generateBilling()
		}
	});
}

$('#detail-menu li').on('click', function(){
	var target = $(this).data('window-target');

	$('.'+target).show();
	$('.'+target).siblings('div').hide()
})

var groupingRate,
	billingContent = $('.billing-content'),
	siteRate = 0;

function generateBilling(){
	var arrivalDate = site_detail.availability[0].date,
		departureDate = site_detail.availability[site_detail.availability.length - 1].date;

	document.getElementById('search-arrival2').value = arrivalDate.split('-')[0] + '-' + arrivalDate.split('-')[1] + '-' + arrivalDate.split('-')[2]
	document.getElementById('search-departure2').value = departureDate.split('-')[0] + '-' + departureDate.split('-')[1] + '-' + departureDate.split('-')[2]
	startPicker2.gotoMonth(parseInt(arrivalDate.split('-')[1]-1))
	endPicker2.gotoMonth(parseInt(departureDate.split('-')[1]-1))
	startPicker2.setStartRange(new Date(arrivalDate.split('-')[0], parseInt(arrivalDate.split('-')[1]-1),arrivalDate.split('-')[2]))
	startPicker2.setEndRange(new Date(departureDate.split('-')[0], parseInt(departureDate.split('-')[1]-1),departureDate.split('-')[2]))
	endPicker2.setStartRange(new Date(arrivalDate.split('-')[0], parseInt(arrivalDate.split('-')[1]-1),arrivalDate.split('-')[2]))
	endPicker2.setEndRange(new Date(departureDate.split('-')[0], parseInt(departureDate.split('-')[1]-1),departureDate.split('-')[2]))

	groupingRate = _.chain(site_detail.availability)
	.groupBy('rate')
	.map(function(value, key){
		return {
			rate : parseInt(key),
			date : _.pluck(value, 'date')
		}
	}).reverse()._wrapped

	$('.daily-rate', billingContent).remove()
	countBilling('site')
}

function showSiteDetail(id){
	var data = sites[id]
	// $.getJSON('./detail_site'+id+'.json', function(data){
		site_detail = data
		$('#title-site').html(data.AddressLine1);
		$('.title-site').html(data.AddressLine1);
		$('.title-price').html('Rp '+data.DefaultRate+'.00 / day');
		$('#location-site').html(data.City + ', '+data.State)
	// 	$('#desc-site').html(data.description)
	// 	$('.detail-site-pic').css('background', 'url('+data.image+')')
	// 	$('#fullname').html(data.firstName + ' '+data.lastName);
		$('#height').html(data.Height);
		$('#width').html(data.Width);
		$('#length').html(data.Length);
		$('#security').html((data.Security == 0) ? 'No' : 'Yes');

	// 	$('.photo-wrapper').css('background', 'url("'+data.imageThumb[0].img_big+'")')
	// 	$('#index-image').html('1');
	// 	$('#total-image').html(data.imageThumb.length);

	// 	$('.wrapper-photo').empty()
	// 	for(var i=0; i < data.imageThumb.length; i++){
	// 		$('.wrapper-photo').append("<div class=photo-thumbnail style='background:url("+data.imageThumb[i].img_small+")'></div>")
	// 	}

		$('.facilities-item').remove()
		$('#list-facilities').empty()
		var list;
		if(data.PropertyAmenities.length == 0){
			$('.detail-facilities').append("<div class='facilities-item'><div>No Facilities</div></div>")
		}else{
			for(var i=0; i < data.PropertyAmenities.length; i++){
				$('.detail-facilities').append("<div class='facilities-item'><div class='ds-"+data.PropertyAmenities[i].icon+"'></div><div>"+data.PropertyAmenities[i].Memo+"</div><div class='price'>$ "+data.PropertyAmenities[i].Rate+".00 /day</div></div>")

				if(i == 0) { 
					var klas = 'class=selected '; 
				}else{
					klas = ''
				}
				list = '<li value='+data.PropertyAmenities[i].ID+'>'+data.PropertyAmenities[i].Memo+' - $ '+data.PropertyAmenities[i].Rate+'.00</li>'
				$('#list-facilities').append(list)
			}
		}
		

		listTrigger()
	// 	siteRate=0;
		// generateBilling()
		// countBilling('deleteAllFacilities')
	// })
}

$('#btn-add-facilities').on('click', function(){
	var id = $('#add-facilities')

	countBilling('facilities', id.val())
	id.val('');
	id.siblings('.select-area').html('Add Facilities')
})

function countBilling(type, id){
	var bookDate, dailyRate;
	if(type == 'site' || !type){
		for(var i=0; i < groupingRate.length; i++){
			if(groupingRate[i].date.length > 1){
				bookDate = groupingRate[i].date[0] + ' to ' + groupingRate[i].date[groupingRate[i].date.length- 1] + '<span> - '+groupingRate[i].date.length+' day(s) x $'+groupingRate[i].rate+'.00</span>';
			}else{
				bookDate = groupingRate[i].date[0] + ' <span> - '+groupingRate[i].date.length+' day(s) x $'+groupingRate[i].rate+'.00</span>';
			}
			dailyRate = groupingRate[i].rate * groupingRate[i].date.length;

			siteRate += dailyRate;
			var template = '\
				<div class="billing-row daily-rate">\
					<div class="title">'+bookDate+'</span></div>\
					<div class="price">$ '+dailyRate+'.00</div>\
				</div>\
			';
			billingContent.prepend(template)
		}
	}else if(type=='facilities'){
		var index = _.findIndex(site_detail.PropertyAmenities, {'ID':parseInt(id)});
		
		var facilities = site_detail.PropertyAmenities[index];
		var template = '\
			<div class="billing-row facilities-row">\
				<div class="ds-delete delete-facilities" data-id='+facilities.ID+'></div>\
				<div class="title">'+facilities.Memo+'</div>\
				<div class="price">$ '+facilities.Rate+'.00</div>\
			</div>\
		';
		siteRate += facilities.Rate;
		$('.billing-total').before(template)

		$('.delete-facilities').on('click', function(){
			// doDelete($(this).data('id'))
			countBilling('delete', $(this).data('id'))
			$(this).parent().remove()
		})
	}else if(type=='delete'){
		var index = _.findIndex(site_detail.PropertyAmenities, {'ID':id});
		var facilities = site_detail.PropertyAmenities[index];

		siteRate -= facilities.Rate;
	}else if(type=='deleteAllFacilities'){
		$('.facilities-row').remove()
	}
	
	$('.price', $('.billing-total')).html('$ '+siteRate+'.00')
}

$('#slider-range').slider({
	range: true,
	min: 0,
	max: 500,
	values: [ 75, 300 ],
	slide : function(event, ui){
		$( "#amount" ).html( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
	}
})

$( "#amount" ).html( "$" + $( "#slider-range" ).slider( "values", 0 ) +" - $" + $( "#slider-range" ).slider( "values", 1 ) );

element.configFilter.on('click', function(){
	element.refineWrapper.toggleClass('active')
})

var indexImg = 0;

$('.photo-nav').on('click', function(){
	var type = $(this).data('type'),
		total_img = site_detail.imageThumb.length;

	switch(type){
		case 'next':
			if(indexImg < total_img-1){
				indexImg += 1	
			}else{
				indexImg = 0
			}
			break;
		case 'prev':
			if(indexImg == 0){
				indexImg = total_img - 1
			}else{
				indexImg -= 1
			}
			break;
	}
	$('.photo-wrapper').css('background', 'url('+site_detail.imageThumb[indexImg].img_big+')')

	$('#index-image').html(indexImg+1);
	// $('#total-image').html(data.imageThumb.length);
})

$('#test-modal').on('click', function(){
	DS_MODAL.open({
		status : 'confirm-success',
		image : './assets/images/success.svg',
		message : 'Your request has successfully submitted, check on your transaction list menu',
		redirect: {
            timeout : 4000,
            dest : './transaction_list.html'
        }
	})
})



// $('.map-list').hide()
// $('.map-list').siblings('div').show()
