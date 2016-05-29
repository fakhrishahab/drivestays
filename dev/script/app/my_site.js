'use strict';
var element = {
    site_lat: $('#site-latitude'),
    site_lng: $('#site-longitude'),
    site_city: $('#site-city'),
    site_state: $('#site-state'),
    site_postalcode: $('#site-postalcode'),
    site_access_toggle: $('.input-toggle'),
    site_access: $('#site-access'),
    site_access_status: $('.toggle-status'),
    form_wrapper: $('#profile-form'),
    btn_add_site: $('#btn-add-site'),
    site_address1: $('#site-address1'),
    site_address2: $('#site-address2'),
    site_address3: $('#site-address3'),
    site_length: $('#site-length'),
    site_width: $('#site-width'),
    site_height: $('#site-height'),
    site_security: $('#site-security'),
    site_power: $('#site-power'),
    site_noise: $('#site-noise'),
    site_power_capacity: $('#site-power-capacity'),

    image_container : $('.image-uploaded'),
    trigger_upload : $('.upload-container'),
    file_upload : $('#file-upload'),
    btn_crop: $('#btn-crop'),
    btn_save: $('#btn-save'),

    table_body : $('tbody')
}

var user_data = _localStorage.get('user_data');

// GET SITE LIST BY USER ID
$.ajax({
    url: SITE.API_PATH_DEV + '/properties/get/' + user_data.user_id,
    type: 'get',
    beforeSend: function () {
        var template = `
                    <tr>
                        <td colspan=5>
                            <center><object type="image/svg+xml" data="./assets/images/loading.svg" class ="logo">
                              Kiwi Logo <!--fallback image in CSS-->
                            </object></center>
                        </td>
                    </tr>
                `;
        element.table_body.append(template);
    },
    success: function (data) {
        console.log(data)
        element.table_body.empty()
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var template = `
                    <tr>\
                        <td>`+ parseInt(i + 1) + `</td>
                        <td>`+ data[i].AddressLine1 + `</td>
                        <td>`+ data[i].City + ` / ` + data[i].State + `</td>
                        <td>width: `+ data[i].Width + ` cm <br> length: ` + data[i].Length + ` cm </td>
                        <td class ='action'>
                            
                            <button class =' edit-site' data-id= `+ data[i].ID + ` >
                                <div class ='ds-edit'></div> <span>Edit</span>
                            </button>
                            
                            <button>
                                <div class ='ds-delete delete-site' data-id= `+ data[i].ID + ` ></div> <span>Delete</span>
                            </button>
                        </td>
                    </tr>
                `;
                element.table_body.append(template)
            }

            $('.edit-site').on('click', function () {
                var id = $(this).data('id');
                _cookies.put('site_id', id);
                window.location.href = './edit_site.html';
            })
        } else {
            var template = `
                    <tr>
                        <td colspan=5>
                            <center>No Data</center>
                        </td>
                    </tr>
                `;
            element.table_body.append(template)
        }
        
    },
    error: function (result) {
        console.log(result)
    }
})

element.form_wrapper.hide();

element.btn_add_site.on('click', function(){
    element.form_wrapper.fadeToggle();
    initMap()
})


var marker, autocomplete, markers = [];
var componentForm = {
    street_number: '',
    route: '',
    locality: '',
    administrative_area_level_1: '',
    country: '',
    postal_code: ''
};
function initMap() {
    var map = new google.maps.Map(document.getElementById('map-site'), {
        zoom: 15,
        center: {lat: -25.363882, lng: 131.044922 }
    });

    var geocoder = new google.maps.Geocoder;

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            var pos = {
                lat : position.coords.latitude,
                lng : position.coords.longitude
            }

            map.setCenter(pos)
        })
    }

    map.addListener('click', function(e) {
        var latLng = {
            lat : e.latLng.lat(),
            lng : e.latLng.lng()
        }

        element.site_lat.val(latLng.lat)
        element.site_lng.val(latLng.lng)

        getDetail(geocoder, map, latLng)
        
        placeMarkerAndPanTo(e.latLng, map);
    });

    // Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('site-address1')),
        {types: ['geocode']});

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', function(){
        var place = autocomplete.getPlace();
        placeMarkerAndPanTo(place.geometry.location, map);

        getAddressDetail(place)
    });
}

function getAddressDetail(place, type) {
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (place.address_components[i]) {
            var val = place.address_components[i]['long_name'];
            componentForm[addressType] = val;
        }
    }

    if (type === 'map') {
        element.site_address1.val(componentForm.route)
    }
    element.site_city.val(componentForm.administrative_area_level_1)
    element.site_state.val(componentForm.country)
    element.site_postalcode.val(componentForm.postal_code)
    element.site_lat.val(place.geometry.location.lat())
    element.site_lng.val(place.geometry.location.lng())
}

function placeMarkerAndPanTo(latLng, map) {
    clearMarker()
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        draggable : true,
        animation: google.maps.Animation.DROP
    });
    markers.push(marker)
    map.setCenter(marker.getPosition())
}

function clearMarker(){
    if(marker){
        marker.setMap(null)
    }
}

function getDetail(geocoder, map, latLng){
    geocoder.geocode({ 'location': latLng }, function (result, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            getAddressDetail(result[0], 'map')
        }
    })
}

$(function() {
    $( "#slider" ).slider({
        min : 1,
        max : 5,
        step: 1,
        value : 1,
        slide : function(event, ui){
            $('#site-noise').val(ui.value)
        }
    });
    $('#site-noise').val($( "#slider" ).slider("value"))
    $( "#slider" ).val($( "#slider" ).slider("value"))
});


element.trigger_upload.on('click', function(){
    element.file_upload.click()
})

var $uploadCrop, $imgFiles = [];

function readFile(input) {
    if (input.files && input.files[0]) {
        $('.text').remove();
        var reader = new FileReader();
        
        reader.onload = function (e) {
            $uploadCrop.croppie('bind', {
                url: e.target.result
            });
            $('.upload-demo').addClass('ready');
        }
        
        reader.readAsDataURL(input.files[0]);
    }
    else {
        swal("Sorry - you're browser doesn't support the FileReader API");
    }
}

$uploadCrop = $('.upload-container-modal').croppie({
    viewport: {
        width: 200,
        height: 200,
        type: 'square'
    },
    boundary: {
        width: 300,
        height: 300
    },
    exif: true
});

element.file_upload.on('change',function(){
    dsModal.prototype.open('modal-upload')
    readFile(this)
})

element.btn_crop.on('click', function(ev){
    $uploadCrop.croppie('result', {
        type: 'canvas',
        size: 'viewport'
    }).then(function (resp) {
        appendImage(resp)
        dsModal.prototype.closeAll();
    });
})

function appendImage(file){
    var temp = '<div class="img-thumb" style="background:url('+file+')"><div class="ds-delete"></div></div>';
    element.image_container.append(temp);

    $('.ds-delete', element.image_container).on('click', function(){
        $(this).parent('.img-thumb').remove()
    })
}

element.btn_save.on('click', function () {
    var dataSite = {
        "AddressLine1": element.site_address1.val(),
        "AddressLine2": element.site_address2.val(),
        "AddressLine3": element.site_address3.val(),
        "City": element.site_city.val(),
        "State": element.site_state.val(),
        "PostalCode": element.site_postalcode.val(),
        "Width": parseInt(element.site_width.val()) || null,
        "Length": parseInt(element.site_length.val()) || null,
        "Height": parseInt(element.site_height.val()) || null,
        "Security": parseInt(element.site_security.val()),
        "DefaultRate": 0,
        "Longitude": parseFloat(element.site_lng.val()),
        "Latitude": parseFloat(element.site_lat.val()),
        "CustomerID": parseInt(user_data.user_id),
        "PropertyPictures": [],
        "PropertyAmenities": [],
        "PropertyRates": [],
        "PropertyClosures": []
    }

    console.log(dataSite);
    $(this).validation(element.form_wrapper)
    if ($(this).validation(element.form_wrapper) == undefined) {
        $.ajax({
            url: SITE.API_PATH_DEV + '/property/save',
            type: 'POST',
            data: JSON.stringify(dataSite),
            contentType: "application/json",
            dataType : 'json',
            success: function (data) {
                console.log(data)
                floatAlert('Data has successfully saved', function(result){
                    _cookies.put('site_id', data);
                    window.location.href = '/edit_site.html';
                })
            },
            error: function (status) {
                console.log(status)
            }
        })
    }

    
})

$('.test').on('click', function(){
    floatAlert('Test', function(){
        
    })
})

