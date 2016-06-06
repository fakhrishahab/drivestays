// This Page is JS Library only for search site result page
// Author by FakhriShahab
// First Commit : March, 28 2016

'use strict';
var sites, site_data, site_detail;

function loadScript(src, callback) {
    if(!src) src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDfSvkBOL2nOfLZKDWaf66EbbO9poShFaA&libraries=places&callback=initMap';
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

var user_data = _localStorage.get('user_data');

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
    resultList: $('.search-result-list'),

    inputArrival2: $('#search-arrival2'),
    inputDeparture2: $('#search-departure2'),
    rowAddFacilities: $('.row-add-facilites'),
    propertyDetailID: $('#property-detail-id'),
    btnBooking: $('.btn-book-site'),

    site_info_fullname: $('#site-info-fullname'),
    site_info_email: $('#site-info-email')
}

var latlngbounds, infoWindow, autocomplete, markers=[], map, siteSearch, resultSite;

element.btnFindSite.on('click', function () {
    element.preloadWrapper.show();
    var dataSearch = {
        'location' : element.inputLocation.val(),
        'stay_type' : element.inputStayType.val(),
        'arrival_date' : element.inputArrival.val(),
        'departure_date' : element.inputDeparture.val(),
        'latitude' : element.inputLat.val(),
        'longitude' : element.inputLong.val()
    }
    _cookies.putObject('siteSearch', dataSearch)
	
    if ($(this).validation(element.formSearch) == undefined) {
        $('#detail-menu li[data-window-target="map-list"]').click();
        initMap()	
    }
})
// Callback function from Google Map API
// Google Map API call in search page html file
var offset, limit;

var mapOptions;
function initMap(offset, limit, type) {
    if (!offset) offset = 0;

    if (!limit) limit = 10;
    siteSearch = _cookies.getObject('siteSearch');
    // Call the site data first before rendering the google map API

    element.resultList.empty();
    element.preloadWrapper.addClass('show')
    $.ajax({
        url: SITE.API_PATH+'/properties/search',
        type: 'POST',
        data: {
            "VehicleID" : user_data ? user_data.vehicle : null,
            "Longitude": siteSearch.longitude,
            "Latitude": siteSearch.latitude,
            "FromDate": siteSearch.arrival_date,
            "ToDate": siteSearch.departure_date,
            "Offset": offset,
            "Limit": limit
        },
        success: function (result) {
            // console.log(result)
            element.preloadWrapper.removeClass('show');
            element.preloadWrapper.hide();
            if(result){
                sites = result.Properties;	
            }else{
                sites = '';
            }

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
    })

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

                $('a', element.paginationWrapper).on('click', function () {
                    element.preloadWrapper.show();
                    $('#detail-menu li[data-window-target="map-list"]').click();
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
            var site_img = (sites[i]['image']) ? sites[i]['image'] : './assets/images/site-notfound.svg';
            var template = "\
		<div class='col-md-12 col-6'>\
			<div class='site-top-wrapper' data-id='"+sites[i]['ID']+"'>\
				<div class='site-img-thumb' style='background:url("+site_img+")'>\
					<!--<div class='site-price'>$ "+sites[i]['price']+".00 /day</div>-->\
					<div class='site-img-user'><img src='./assets/images/user-profile.png' alt=''></div>\
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
        	var site_image = (site['image']) ? site['image'] : './assets/images/site-notfound.svg';
            var content = "<div class='infoWindowWrapper'>\
			<h3>"+site_image+"</h3>\
			<div class='site-detail'>\
				<img src="+site['image']+">\
				<div class='site-location-window'>\
					<div class='ds-pin'></div>"+site['City']+"\
					<div class='site-desc-window'>"+site['description']+"</div>\
				</div>\
			</div>\
			<div class='btn-group-window'>\
				<button class='btn-blue see-detail' id='showDetail' data-id="+site['ID']+">See Detail</button>\
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
                    element.preloadWrapper.hide();
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
		    endPicker.gotoMonth(startDate.getMonth());
		},
		updateEndDate = function(){
		    startPicker.setEndRange(endDate);
		    startPicker.setMaxDate(endDate);
		    endPicker.setEndRange(endDate);
		    startPicker.gotoMonth(endDate.getMonth());
		},
		updateStartDate2 = function(){
		    startPicker2.setStartRange(startDate2);
		    endPicker2.setStartRange(startDate2);
		    endPicker2.setMinDate(startDate2);
		    endPicker2.gotoMonth(startDate2.getMonth());
		},
		updateEndDate2 = function(){
		    startPicker2.setEndRange(endDate2);
		    startPicker2.setMaxDate(endDate2);
		    endPicker2.setEndRange(endDate2);
		    startPicker2.gotoMonth(endDate2.getMonth());
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
    
    
    var groupingRate,
        billingContent = $('.billing-content'),
        siteRate = 0,
        amenitiesRate = 0;

    // document.getElementById('search-arrival2').value = '2016-03-28'
    // document.getElementById('search-departure2').value = '2016-04-02'
    // startPicker2.setStartRange(new Date(2016, 2,28))
    // startPicker2.setEndRange(new Date(2016, 3,2))
    // endPicker2.setStartRange(new Date(2016, 2,28))
    // endPicker2.setEndRange(new Date(2016, 3,2))
    // startPicker2.setDate('2016-03-31')


    function showDetail(id) {
        /*$.ajax({
            url : SITE.API_PATH_DEV+'/property/get/'+id,
            type: 'get',
            success: function (result) {
                console.log(result)
                $('#detail-menu li:last-child').removeClass('inactive')
                $('#detail-menu li:last-child').addClass('active')
                $('#detail-menu li:last-child').siblings('li').removeClass('active')
                $('.map-list').hide()
                $('.map-list').siblings('div').show()
                showSiteDetail(result)
                siteRate = 0;
                generateBilling()
            },
            error: function (status) {
                console.log(error, status)
            }
        })*/
        $.each(sites, function(key, val) {
            if(val['ID'] == id){
                var index = key;
                site_data = _localStorage.get('site_data')
                $('#detail-menu li:last-child').removeClass('inactive')
                $('#detail-menu li:last-child').addClass('active')
                $('#detail-menu li:last-child').siblings('li').removeClass('active')
                $('.map-list').hide()
                $('.map-list').siblings('div').show()                

                getCustomerDetail(site_data.CustomerID);
                showSiteDetail(index)
                siteRate = 0;
                generateBilling()
            }
        });
    }

    $('#detail-menu li').on('click', function(){
        var target = $(this).data('window-target');

        $('.'+target).show();
        $('.'+target).siblings('div').hide()
    })

    function generateBilling() {
        var arrivalDate = site_detail.PropertyRates[0].FromDate,
		departureDate = site_detail.PropertyRates[site_detail.PropertyRates.length - 1].FromDate;

        document.getElementById('search-arrival2').value = moment(new Date(siteSearch.arrival_date)).format('MM/DD/YYYY')
        document.getElementById('search-departure2').value = moment(new Date(siteSearch.departure_date)).format('MM/DD/YYYY')
        startPicker2.gotoMonth(moment(arrivalDate).month())
        endPicker2.gotoMonth(moment(departureDate).month())
        startPicker2.setStartRange(new Date(moment(arrivalDate)))
        startPicker2.setEndRange(new Date(moment(departureDate)))
        endPicker2.setStartRange(new Date(moment(arrivalDate)))
        endPicker2.setEndRange(new Date(moment(departureDate)))

        groupingRate = _.chain(site_detail.PropertyRates)
        .groupBy('Rate')
        .map(function (value, key) {
            return {
                rate: parseInt(key),
                date: _.pluck(value, 'FromDate')
            }
        }).reverse()._wrapped;
        //console.log(groupingRate);

        $('.daily-rate', billingContent).remove()
        countBilling('site')
    }

    function showSiteDetail(id){
        var data = sites[id]
        site_detail = data;
        element.propertyDetailID.val(data.ID + '-'+ id);
        $('#title-site').html(data.AddressLine1);
        $('.title-site').html(data.AddressLine1);
        $('.title-price').html('$ '+data.DefaultRate+'.00 / day');
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
        var site_img = (data.PropertyPictures.length > 1) ? data.PropertyPictures[0] : './assets/images/site-notfound-big.svg';
       	$('.detail-site-pic').css('background', 'url('+site_img+')')

        // 	$('.wrapper-photo').empty()
        // 	for(var i=0; i < data.imageThumb.length; i++){
        // 		$('.wrapper-photo').append("<div class=photo-thumbnail style='background:url("+data.imageThumb[i].img_small+")'></div>")
        // 	}

        $('.facilities-item').remove();
        $('#list-facilities').empty();
        var list;
        if (data.PropertyAmenities.length == 0) {
            element.rowAddFacilities.hide();
            //$('.detail-facilities').append("<div class='facilities-item'><div>No Facilities</div></div>");
            //$('.select-area').html('No Facilities Available');
        } else {
            element.rowAddFacilities.show();
            $('.select-area').html('Add Facilities');
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
        siteRate=0;
        generateBilling()
        countBilling('deleteAllFacilities')

        element.preloadWrapper.removeClass('show');
        // })
    }

    function getCustomerDetail(id) {
        $.ajax({
            url: SITE.API_PATH_DEV + '/customer/get/' + id,
            type: 'get',
            success: function (result) {
                var firstname = (result.FirstName != null) ? result.FirstName : '';
                var middlename = (result.MiddleName != null) ? result.MiddleName : '';
                var lastname = (result.LastName != null) ? result.LastName : '';
                element.site_info_fullname.html(firstname + ' ' + middlename + ' ' + lastname);
                element.site_info_email.html(result.EmailAddress);
            },
            error: function (status) {
                console.log('Error, cannot get customer detail info')
            }
        })
    }

    var arrAmenities = [];
    $('#btn-add-facilities').on('click', function () {
        var id = $('#add-facilities')
        if (id.val() == '' || id.val() == null || id.val() == undefined) {
            floatAlert('You must select amenities to add', 'error', function () { })
        } else {
            arrAmenities.push(id.val());
            countBilling('facilities', id.val());
            $('#list-facilities').find('li[value=' + id.val() + ']').remove();
            id.val(null);
            id.siblings('.select-area').html('Add Facilities');
        }
    })

    //element.inputA

    var bookDate, dailyRate, amenitiesItems = [];
    function countBilling(type, id){
        if (type == 'site' || !type || type == undefined) {
            billingContent.find('.daily-rate').remove();
            siteRate = 0;
            for(var i=0; i < groupingRate.length; i++){
                if (groupingRate[i].date.length > 1) {
                    bookDate = moment(groupingRate[i].date[0]).format('YYYY-MM-DD') + ' to ' + moment(groupingRate[i].date[groupingRate[i].date.length - 1]).format('YYYY-MM-DD') + '<span> - ' + groupingRate[i].date.length + ' day(s) x $' + groupingRate[i].rate + '.00</span>';
                } else {
                    bookDate = moment(groupingRate[i].date[0]).format('YYYY-MM-DD') + ' <span> - ' + groupingRate[i].date.length + ' day(s) x $' + groupingRate[i].rate + '.00</span>';
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
                //countBilling('updateAmenities')
            }
        }else if(type=='facilities'){
            var index = _.findIndex(site_detail.PropertyAmenities, {'ID':parseInt(id)});
		
            var facilities = site_detail.PropertyAmenities[index];
            facilities['days'] = site_detail.PropertyRates.length;
            amenitiesItems.push(facilities);

            amenitiesRate += facilities.Rate * site_detail.PropertyRates.length;
            var template = '\
			    <div class="billing-row facilities-row">\
				    <div class="ds-delete delete-facilities" data-id='+facilities.ID+'></div>\
				    <div class="title">' + facilities.Memo + '<br> (' + site_detail.PropertyRates.length + ' days x $' + facilities.Rate + '.00)</div>\
				    <div class="price">$ ' + site_detail.PropertyRates.length * facilities.Rate + '.00</div>\
			    </div>\
		    ';
            $('.billing-total').before(template)

            $('.delete-facilities').on('click', function () {
                var id = $(this).data('id')
                var indexMasterAmenities;
                Object.keys(site_detail.PropertyAmenities).forEach(function (key) {
                    if (site_detail.PropertyAmenities[key].ID == id) indexMasterAmenities = key;
                });

                var list = '<li value=' + site_detail.PropertyAmenities[indexMasterAmenities].ID + '>' + site_detail.PropertyAmenities[indexMasterAmenities].Memo + ' - $ ' + site_detail.PropertyAmenities[indexMasterAmenities].Rate + '.00</li>'
                $('#list-facilities').append(list)
                listTrigger();

                var indexAmenities = arrAmenities.indexOf($(this).data('id'));
                arrAmenities.splice(indexAmenities, 1);
                countBilling('delete', $(this).data('id'))
                $(this).parent().remove()
            })
        }else if(type=='delete'){
            var index = _.findIndex(site_detail.PropertyAmenities, {'ID':id});
            var facilities = site_detail.PropertyAmenities[index];

            amenitiesRate -= facilities.Rate * site_detail.PropertyRates.length;
        }else if(type=='deleteAllFacilities'){
            $('.facilities-row').remove()
        } else if (type == 'updateAmenities') {
            amenitiesRate = 0;
            $('.billing-content').find('.facilities-row').remove();
                for (var i = 0 ; i < amenitiesItems.length; i++) {
                    var template = '\
			            <div class="billing-row facilities-row">\
				            <div class="ds-delete delete-facilities" data-id=' + amenitiesItems[i].ID + '></div>\
				            <div class="title">' + amenitiesItems[i].Memo + '<br> (' + site_detail.PropertyRates.length + ' days x $' + amenitiesItems[i].Rate + '.00)</div>\
				            <div class="price">$ ' + site_detail.PropertyRates.length * amenitiesItems[i].Rate + '.00</div>\
			            </div>\
		            ';
                    $('.billing-total').before(template)
                    amenitiesRate += site_detail.PropertyRates.length * amenitiesItems[i].Rate;
                }
            $('.delete-facilities').on('click', function () {
                countBilling('delete', $(this).data('id'))
                $(this).parent().remove()
            })
        }
	
        $('.price', $('.billing-total')).html('$ '+parseInt(siteRate + amenitiesRate)+'.00')
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

    element.inputArrival2.on('change', function () {
        if (element.inputDeparture2.val() != '' || element.inputDeparture2.val() != undefined) {            
            changeDateRate()
        }
    })

    element.inputDeparture2.on('change', function () {
        if (element.inputArrival2.val() != '' || element.inputArrival2.val() != undefined) {
            changeDateRate()
        }
    })

    function changeDateRate() {
        var id = element.propertyDetailID.val().split('-')[0],
            index = element.propertyDetailID.val().split('-')[1],
            fromDate = element.inputArrival2.val().split('/'),
            toDate = element.inputDeparture2.val().split('/');

        console.log(fromDate, fromDate[2], element.inputArrival2.val())

        var dataSearch = {
            "PropertyID": id,
            "FromDate": fromDate[2] + '-' + fromDate[0] + '-' + fromDate[1],
            "ToDate": toDate[2] + '-' + toDate[0] + '-' + toDate[1]
        };

        $.ajax({
            url: SITE.API_PATH_DEV + '/properties/newdatesearch',
            type: 'post',
            data: dataSearch,
            beforeSend: function () {
                preload.show($('.billing-info-wrapper'))
            },
            success: function (result) {
                siteSearch.arrival_date = dataSearch.FromDate;
                siteSearch.departure_date = dataSearch.ToDate;
                //console.log(result.PropertyRates)
                console.log(sites[index].PropertyRates, result.PropertyRates);
                sites[index].PropertyRates = result.PropertyRates;
                //console.log(sites[index].PropertyRates)

                generateBilling()
                countBilling()
                countBilling('updateAmenities')
                preload.remove($('.billing-info-wrapper'))
            },
            error: function (status) {
                console.log(error, status)
                preload.remove($('.billing-info-wrapper'))
            }
        })
    }

    element.btnBooking.on('click', function () {
        if (user_data == undefined || user_data == '') {
            //preload.remove($('.billing-info-wrapper'));
            floatAlert('You must Login first to Booking this site', 'error', function () {
                window.location.href = './login.html';
            });
        } else {
            preload.show($(this).parents('.billing-info-wrapper'))
            $(this).prop('disabled', true);
            var fromDate = element.inputArrival2.val().split('/');
            var toDate = element.inputDeparture2.val().split('/');
            var bookData = {
                "PropertyID": element.propertyDetailID.val().split('-')[0],
                "FromDate": fromDate[2] + '-' + fromDate[0] + '-' + fromDate[1],
                "ToDate": toDate[2] + '-' + toDate[0] + '-' + toDate[1] ,
                "CustomerID": user_data.user_id,
                "ChosenAmenities": arrAmenities
            };

            console.log(bookData)
            $.ajax({
                url: SITE.API_PATH_DEV+'/request/save',
                type: 'post',
                data: bookData,
                success: function (result) {
                    console.log(result)
                    arrAmenities = [];
                    DS_MODAL.open({
                        status: 'confirm-success',
                        image: './assets/images/success.svg',
                        message: 'Your request has successfully submitted, check on your transaction list menu',
                        redirect: {
                            timeout : 3000,
                            dest : './transaction_list.html'
                        }
                    })
                    //window.location.href = './transaction_list.html';
                },
                error: function (status) {
                    element.btnBooking.prop('disabled', false);
                    console.log(status)
                    if (status.status == 409) {
                        floatAlert('The date you choose has already booked', 'error', function () { })
                    }

                    preload.remove($('.billing-info-wrapper'))
                }
            })
        }

    })

    // $('.map-list').hide()
    // $('.map-list').siblings('div').show()
