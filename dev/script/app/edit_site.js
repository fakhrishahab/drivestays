'use strict';

var form_wrapper = $('.form-add-site'),
	target = {
	    info: $('#profile-form'),
	    amenities: $('#amenities-form'),
	    availability: $('#availability-form'),
	    site_rate: $('#site-rate-form')
	},
	tab_trigger = $('.site-tab-wrapper div');

var element = {
    site_address1: $('#site-address1'),
    site_address2: $('#site-address2'),
    site_address3: $('#site-address3'),
    site_city: $('#site-city'),
    site_state: $('#site-state'),
    site_postalcode: $('#site-postalcode'),
    site_lat: $('#site-latitude'),
    site_lng: $('#site-longitude'),
    site_length: $('#site-length'),
    site_width: $('#site-width'),
    site_height: $('#site-height'),
    site_access: $('#site-access'),
    site_security: $('#site-security'),
    site_power: $('#site-power'),

    site_access_toggle: $('.input-toggle'),
    site_access_status: $('.toggle-status'),
    date_from: $('#effective-from'),
    date_to: $('#effective-to'),
    filter_year: $('#available-filter'),

    image_container: $('.image-uploaded'),
    trigger_upload: $('.upload-container'),
    file_upload: $('#file-upload'),
    btn_crop: $('#btn-crop'),

    btn_save_site : $('#btn-save-site')
}
var user_data = _localStorage.get('user_data');
var marker, autocomplete, markers = [], map;

$(function () {
    $("#slider").slider({
        min: 1,
        max: 5,
        step: 1,
        value: 1,
        slide: function (event, ui) {
            $('#site-noise').val(ui.value)
        }
    });
    $('#site-noise').val($("#slider").slider("value"))
    $("#slider").val($("#slider").slider("value"))
});

var site_id = _cookies.get('site_id');

function getSiteDetail() {
    $.ajax({
        url: SITE.API_PATH + '/property/get/' + site_id,
        type: 'GET',
        success: function (data) {
            element.site_address1.val(data.AddressLine1)
            element.site_address2.val(data.AddressLine2)
            element.site_address3.val(data.AddressLine3)
            element.site_city.val(data.City)
            element.site_state.val(data.State)
            element.site_postalcode.val(data.PostalCode)
            element.site_lat.val(data.Latitude)
            element.site_lng.val(data.Longitude)
            element.site_width.val(data.Width)
            element.site_length.val(data.Length)
            element.site_height.val(data.Height)
            element.site_security.val(data.Security == true ? '1' : '0')

            checkToggle()
            placeMarkerAndPanTo({ 'lng': data.Longitude, 'lat': data.Latitude }, map)
        },
        error: function (result) {
            console.log(result)
        }
    })
}

getSiteDetail()

function initMap() {
    map = new google.maps.Map(document.getElementById('map-site'), {
        zoom: 15,
        center: { lat: -25.363882, lng: 131.044922 }
    });

    var geocoder = new google.maps.Geocoder;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }

            map.setCenter(pos)
        })
    }

    map.addListener('click', function (e) {
        var latLng = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
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
        { types: ['geocode'] });

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        placeMarkerAndPanTo(place.geometry.location, map);
    });
}


function placeMarkerAndPanTo(latLng, map) {
    clearMarker()
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });
    markers.push(marker)
    map.setCenter(marker.getPosition())
}

function clearMarker() {
    if (marker) {
        marker.setMap(null)
    }
}

function getDetail(geocoder, map, latLng) {
    geocoder.geocode({ 'location': latLng }, function (result, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            element.site_city.val(result[0].address_components[6].long_name)
            element.site_state.val(result[0].address_components[8].long_name)
            element.site_postalcode.val(result[0].address_components[9].long_name)
        }
    })
}

var tab_handler = new Function();

$.extend(tab_handler.prototype, {
    default: function () {
        tab_handler.prototype.hideAll()
        target.info.show()
        // target.availability.show()
    },
    hideAll: function () {
        form_wrapper.hide()
    },
    click: function (elm) {
        elm.addClass('active')
        elm.siblings('div').removeClass('active')
        var target = elm.data('target');
        tab_handler.prototype.hideAll()
        $('#' + target).show()
    }
})

tab_handler.prototype.default();
tab_trigger.on('click', function () {
    tab_handler.prototype.click($(this))
})

var datepicker = new Function();

$.extend(datepicker.prototype, {
    startPicker: '',
    endPicker: '',
    startDate: '',
    endDate: '',
    startPickerRate: '',
    endPickerRate: '',
    startDateRate: '',
    endDateRate: '',
    set: function (id, type) {
        switch (type) {
            case 'start':
                this.startPicker = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.startDate = this.getDate()
                        datepicker.prototype.updateStartDate(this.getDate())
                    }
                })
                break;

            case 'end':
                this.endPicker = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.endDate = this.getDate()
                        datepicker.prototype.updateEndDate(this.getDate())
                    }
                })
                break;

            case 'start-rate':
                this.startPickerRate = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.startDateRate = this.getDate()
                        datepicker.prototype.updateStartDateRate(this.getDate())
                    }
                })
                break;

            case 'end-rate':
                this.endPickerRate = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.endDateRate = this.getDate()
                        datepicker.prototype.updateEndDateRate(this.getDate())
                    }
                })
                break;
        }
    },
    updateStartDate: function (date) {
        this.startPicker.setStartRange(date)
        this.endPicker.setStartRange(date)
        this.endPicker.setMinDate(date)
    },
    updateEndDate: function (date) {
        this.startPicker.setEndRange(date)
        this.endPicker.setEndRange(date)
    },
    updateStartDateRate: function (date) {
        this.startPickerRate.setStartRange(date)
        this.endPickerRate.setStartRange(date)
        this.endPickerRate.setMinDate(date)
    },
    updateEndDateRate: function (date) {
        this.startPickerRate.setEndRange(date)
        this.endPickerRate.setEndRange(date)
    }
})

datepicker.prototype.set('effective-from-available', 'start')
datepicker.prototype.set('effective-to-available', 'end')

datepicker.prototype.set('effective-from-rate', 'start-rate')
datepicker.prototype.set('effective-to-rate', 'end-rate')



var dateYear = new Function();

$.extend(dateYear.prototype, {
    totalDate: function (year, month) {
        if (year % 4 == 0 || year % 100 == 0 || year % 400 == 0) {
            this.totalDateMonth = []; //Empty array lists before pushing
            this.totalDateMonth.push("31", "29", "31", "30", "31", "30", "31", "31", "30", "31", "30", " 31");
        }
        else {
            this.totalDateMonth = []; // Empty array lists before pushing
            this.totalDateMonth.push("31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30", " 31");
        }

        return this.totalDateMonth[this.currentMonth(month)];
    },
    firstDay: function (year, month) {
        var firstDay = new Date(year, month, 1);
        return firstDay.getDay();
    },
    currentYear: function (year) {
        if (year) {
            return new Date(year, 1, 1).getFullYear()
        } else {
            return new Date().getFullYear();
        }

    },
    currentMonth: function (month) {
        if (!month && month != undefined && month != 0) {
            return new Date().getMonth()
        } else {
            return new Date(1, month, 1).getMonth()
        }

    },
    getDayString: function (lang) {
        switch (lang) {
            case 'id':
                return ['Sen', 'Sel', 'Rabu', 'Kam', 'Jum', 'Sab', 'Min'];
                break;
            case 'en':
            default:
                return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                break;
        }
    },
    getMonthString: function (month, lang) {
        switch (lang) {
            case 'id':
                return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                break;
            case 'en':
            default:
                return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
    },
    currentDate: new Date().getDate(),
    element: $('#date-container'),
    set: function (year, month) {

        var wrapper = '';
        var content = '';
        wrapper += '<div class="date" id="table-date" data-month="' + month + '"><div class="date-header-month">' + this.getMonthString()[month] + '</div><div class="date-head">';
        for (var i = 0; i < this.getDayString().length; i++) {
            wrapper += '<div class="date-field">' + this.getDayString()[i] + '</div>';
        }
        wrapper += '</div></div>';

        this.date = new Date(this.currentYear(year), this.currentMonth(month), 1)
        var total_date = this.totalDate(this.currentYear(year), this.currentMonth(month));

        content += '<div class="date-row">';

        for (var i = 1; i <= total_date; i++) {

            if (i <= this.firstDay(year, month)) {
                content += '<div class="date-field empty"></div>';
                total_date++;
            } else {
                if (month + 1 < 10) {
                    var months = '0' + (month + 1)
                } else {
                    months = month + 1;
                }

                if ((i - this.firstDay(year, month)) < 10) {
                    var day = '0' + (i - this.firstDay(year, month))
                } else {
                    day = (i - this.firstDay(year, month));
                }
                var id = year + '' + months + '' + day

                content += '<div class="date-field" data-date=' + id + '>' + (i - this.firstDay(year, month)) + '</div>';
            }

            if (i % 7 == 0) {
                content += '</div><div class="date-row">';
            }
        }

        this.element.append(wrapper)
        $('.date[data-month=' + month + ']').append(content)

    }
})

function filterYear(year) {
    for (var i = 0; i <= 11; i++) {
        dateYear.prototype.set(year, i)
    }
}

filterYear(new Date().getFullYear())

$('#year-select li').on('click', function () {
    var year = $(this).val();
    dateYear.prototype.element.empty()
    filterYear(year)
})


$('.date-field[data-date=20160101]').addClass('booked');
$('.date-field[data-date=20160102]').addClass('booked');
$('.date-field[data-date=20160103]').addClass('booked');
$('.date-field[data-date=20160108]').addClass('blackout');
$('.date-field[data-date=20160109]').addClass('blackout');
$('.date-field[data-date=20160115]').addClass('blackout');
$('.date-field[data-date=20160116]').addClass('blackout');


element.trigger_upload.on('click', function () {
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

element.file_upload.on('change', function () {
    dsModal.prototype.open('modal-upload')
    readFile(this)
})

element.btn_crop.on('click', function (ev) {
    $uploadCrop.croppie('result', {
        type: 'canvas',
        size: 'viewport'
    }).then(function (resp) {
        appendImage(resp)
        dsModal.prototype.closeAll();
    });
})

function appendImage(file) {
    var temp = '<div class="img-thumb" style="background:url(' + file + ')"><div class="ds-delete"></div></div>';
    element.image_container.append(temp);

    $('.ds-delete', element.image_container).on('click', function () {
        $(this).parent('.img-thumb').remove()
    })
}

element.btn_save_site.on('click', function () {
    var dataSite = {
        "ID": site_id,
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

    $.ajax({
        url: SITE.API_PATH_DEV + '/property/update',
        type: 'POST',
        data: JSON.stringify(dataSite),
        contentType: "application/json",
        dataType: 'json',
        success: function (data) {
            console.log(data)
        },
        error: function (status) {
            console.log(status)
        }
    })
})