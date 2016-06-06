'use strict';

var form_wrapper = $('.form-add-site'),
    target = {
        info: $('#profile-form'),
        amenities: $('#amenities-form'),
        availability: $('#blackout-form'),
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
    site_default_rate: $('#default-rate'),

    site_access_toggle: $('.input-toggle'),
    site_access_status: $('.toggle-status'),
    date_from: $('#effective-from'),
    date_to: $('#effective-to'),

    image_container: $('.image-uploaded'),
    trigger_upload: $('.upload-container'),
    file_upload: $('#file-upload'),
    btn_crop: $('#btn-crop'),

    btn_save_site: $('#btn-save-site'),
    form_validation: 'profile-form',

    closure_body: $('.closure-body'),
    btn_save_blackout: $('.btn-save-blackout'),
    blackout_form: 'blackout-form',
    blackout_from_date: $('#blackout-from-date'),
    blackout_to_date: $('#blackout-to-date'),
    blackout_annual : $('#blackout-annual'),
    blackout_desc: $('#blackout-desc'),
    blackout_id: $('#blackout-id'),
    blackout_filter: $('#blackout-filter'),
    blackout_year: $('#year-select li'),

    rate_id: $('#rate_id'),
    rate_type: $('#rate-type'),
    rate_type_select: $('#rate-type-select'),
    rate_type_list: $('#rate-type-select li'),
    rate_from: $('#rate-from'),
    rate_to: $('#rate-to'),
    rate_annual: $('#rate-annual'),
    rate_value: $('#rate-value'),
    rate_surcharge: $('#rate-surcharge'),
    btn_save_rate: $('.btn-save-rate'),
    rate_body: $('.rate-body'),

    amenities_id: $('#amenities-id'),
    amenities_selected: $('.amenities-select'),
    amenities_type: $('#amenities-type'),
    amenities_type_select: $('#amenities-type-select'),
    amenities_type_list: $('#amenities-type-select li'),
    amenities_rate: $('#amenities-rate'),
    btn_save_amenities: $('.btn-save-amenities'),
    amenities_body: $('.amenities-body')
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
    $('#site-noise').val($("#slider").slider("value"));
    $("#slider").val($("#slider").slider("value"));
});

var site_id = _cookies.get('site_id');

function runTabFunction(target) {
    switch (target) {
        case 'blackout-form':
            getBlackoutList();
            changeBlackoutYear('2016');
            break;
        case 'site-rate-form':
            getPropertyRateList();
            getRateType();
            break;
        case 'amenities-form':
            getPropertyAmenitiesList();
            getAmenitiesType();
            break;
    };
};

function getSiteDetail() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/property/get/' + site_id,
        type: 'GET',
        success: function (data) {
            element.site_address1.val(data.AddressLine1);
            element.site_address2.val(data.AddressLine2);
            element.site_address3.val(data.AddressLine3);
            element.site_city.val(data.City);
            element.site_state.val(data.State);
            element.site_postalcode.val(data.PostalCode);
            element.site_lat.val(data.Latitude);
            element.site_lng.val(data.Longitude);
            element.site_width.val(data.Width);
            element.site_length.val(data.Length);
            element.site_height.val(data.Height);
            element.site_default_rate.val(data.DefaultRate);
            element.site_security.val(data.Security == true ? '1' : '0');

            checkToggle();
            placeMarkerAndPanTo({ 'lng': data.Longitude, 'lat': data.Latitude }, map);
        },
        error: function (result) {
            console.log(result);
        }
    });
};

getSiteDetail();

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
            };

            map.setCenter(pos);
        });
    };

    map.addListener('click', function (e) {
        var latLng = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };

        element.site_lat.val(latLng.lat);
        element.site_lng.val(latLng.lng);

        getDetail(geocoder, map, latLng);

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
};


function placeMarkerAndPanTo(latLng, map) {
    clearMarker();
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    map.setCenter(marker.getPosition());
}

function clearMarker() {
    if (marker) {
        marker.setMap(null);
    };
};

function getDetail(geocoder, map, latLng) {
    geocoder.geocode({ 'location': latLng }, function (result, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            element.site_city.val(result[0].address_components[6].long_name);
            element.site_state.val(result[0].address_components[8].long_name);
            element.site_postalcode.val(result[0].address_components[9].long_name);
        };
    });
};

var tab_handler = new Function();

$.extend(tab_handler.prototype, {
    default: function () {
        tab_handler.prototype.hideAll();
        target.info.show();
        // target.availability.show()
    },
    hideAll: function () {
        form_wrapper.hide();
    },
    click: function (elm) {
        elm.addClass('active');
        elm.siblings('div').removeClass('active');
        var target = elm.data('target');
        tab_handler.prototype.hideAll();
        $('#' + target).show();

        runTabFunction(target);
    }
})

tab_handler.prototype.default();
tab_trigger.on('click', function () {
    tab_handler.prototype.click($(this));
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
                        datepicker.prototype.startDate = this.getDate();
                        datepicker.prototype.updateStartDate(this.getDate());
                    }
                });
                break;

            case 'end':
                this.endPicker = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.endDate = this.getDate();
                        datepicker.prototype.updateEndDate(this.getDate());
                    }
                });
                break;

            case 'start-rate':
                this.startPickerRate = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.startDateRate = this.getDate();
                        datepicker.prototype.updateStartDateRate(this.getDate());
                    }
                });
                break;

            case 'end-rate':
                this.endPickerRate = new Pikaday({
                    field: document.getElementById(id),
                    numberOfMonths: 2,
                    minDate: new Date(),
                    onSelect: function () {
                        datepicker.prototype.endDateRate = this.getDate();
                        datepicker.prototype.updateEndDateRate(this.getDate());
                    }
                });
                break;
        };
    },
    updateStartDate: function (date) {
        this.startPicker.setStartRange(date);
        this.endPicker.setStartRange(date);
        this.endPicker.setMinDate(date);
    },
    updateEndDate: function (date) {
        this.startPicker.setEndRange(date);
        this.endPicker.setEndRange(date);
    },
    updateStartDateRate: function (date) {
        this.startPickerRate.setStartRange(date);
        this.endPickerRate.setStartRange(date);
        this.endPickerRate.setMinDate(date);
    },
    updateEndDateRate: function (date) {
        this.startPickerRate.setEndRange(date);
        this.endPickerRate.setEndRange(date);
    }
})

datepicker.prototype.set('blackout-from-date', 'start');
datepicker.prototype.set('blackout-to-date', 'end');

datepicker.prototype.set('rate-from', 'start-rate');
datepicker.prototype.set('rate-to', 'end-rate');



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
        };

        return this.totalDateMonth[this.currentMonth(month)];
    },
    firstDay: function (year, month) {
        var firstDay = new Date(year, month, 1);
        return firstDay.getDay();
    },
    currentYear: function (year) {
        if (year) {
            return new Date(year, 1, 1).getFullYear();
        } else {
            return new Date().getFullYear();
        };
    },
    currentMonth: function (month) {
        if (!month && month != undefined && month != 0) {
            return new Date().getMonth();
        } else {
            return new Date(1, month, 1).getMonth();
        };
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
        };
    },
    getMonthString: function (month, lang) {
        switch (lang) {
            case 'id':
                return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                break;
            case 'en':
            default:
                return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        };
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

        this.date = new Date(this.currentYear(year), this.currentMonth(month), 1);
        var total_date = this.totalDate(this.currentYear(year), this.currentMonth(month));

        content += '<div class="date-row">';

        for (var i = 1; i <= total_date; i++) {

            if (i <= this.firstDay(year, month)) {
                content += '<div class="date-field empty"></div>';
                total_date++;
            } else {
                if (month + 1 < 10) {
                    var months = '0' + (month + 1);
                } else {
                    months = month + 1;
                };

                if ((i - this.firstDay(year, month)) < 10) {
                    var day = '0' + (i - this.firstDay(year, month));
                } else {
                    day = (i - this.firstDay(year, month));
                };
                var id = year + '' + months + '' + day;

                content += '<div class="date-field" data-date=' + id + '>' + (i - this.firstDay(year, month)) + '</div>';
            };

            if (i % 7 == 0) {
                content += '</div><div class="date-row">';
            };
        };

        this.element.append(wrapper);
        $('.date[data-month=' + month + ']').append(content);

    }
});

function filterYear(year) {
    for (var i = 0; i <= 11; i++) {
        dateYear.prototype.set(year, i);
    };
};

filterYear(new Date().getFullYear());

$('#year-select li').on('click', function () {
    var year = $(this).val();
    dateYear.prototype.element.empty();
    filterYear(year);
});

element.trigger_upload.on('click', function () {
    element.file_upload.click();
});

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
    };
};

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
    dsModal.prototype.open('modal-upload');
    readFile(this);
})

element.btn_crop.on('click', function (ev) {
    $uploadCrop.croppie('result', {
        type: 'canvas',
        size: 'viewport'
    }).then(function (resp) {
        appendImage(resp);
        dsModal.prototype.closeAll();
    });
});

function appendImage(file) {
    var temp = '<div class="img-thumb" style="background:url(' + file + ')"><div class="ds-delete"></div></div>';
    element.image_container.append(temp);

    $('.ds-delete', element.image_container).on('click', function () {
        $(this).parent('.img-thumb').remove();
    });
};

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
        "DefaultRate": parseInt(element.site_default_rate.val()),
        "Longitude": parseFloat(element.site_lng.val()),
        "Latitude": parseFloat(element.site_lat.val()),
        "CustomerID": parseInt(user_data.user_id),
        "PropertyPictures": [],
        "PropertyAmenities": [],
        "PropertyRates": [],
        "PropertyClosures": []
    };

    //console.log(dataSite);
    if ($(this).validation(element.form_validation) == undefined) {
        $.ajax({
            url: SITE.API_PATH_DEV + '/property/update',
            type: 'POST',
            data: JSON.stringify(dataSite),
            contentType: "application/json",
            dataType: 'json',
            success: function (data) {
                floatAlert('Data has successfully updated', 'success', function (result) {
                    _cookies.put('site_id', site_id);
                    window.location.href = './my_site.html';
                });
            },
            error: function (status) {
                console.log(status);
            }
        });
    };

});

/*  =========================================
 *   START BLACKOUT TAB BLOCK FUNCTION
 *  =========================================
 */

function changeBlackoutYear(year) {
    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyclosures/get/' + site_id + '/' + year,
        type: 'get',
        success: function (result) {
            for (var i = 0; i < result.length; i++) {
                calendarMarking(result[i].FromDate, result[i].ToDate, 'add');
            }
        },
        error: function (status) {
            console.log(status);
        }
    });
};

element.blackout_year.on('click', function(){
    var year = $(this).val();
    changeBlackoutYear(year);
});

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

var dates = [];
function calendarMarking(fromDate, toDate, type) {
    var from = new Date(fromDate),
        to = new Date(toDate);

    switch (type) {
        case 'add':
            while (from <= to) {
                dates.push(moment(from).format('YYYYMMDD'));
                from = from.addDays(1);
            };

            for (var i = 0; i < dates.length; i++) {
                $('.date-field[data-date=' + dates[i] + ']').addClass('blackout');
            };
            break;
        case 'delete':
            var deleteDate = [];
            while (from <= to) {
                Object.keys(dates).forEach(function (item) {
                    if (dates[item] == moment(from).format('YYYYMMDD')) {
                        deleteDate.push(dates[item]);
                        dates.splice(item, 1);
                    };
                });
                from = from.addDays(1);
            };

            for (var i = 0; i < deleteDate.length; i++) {
                $('.date-field[data-date=' + deleteDate[i] + ']').removeClass('blackout');
            };
           
            break;
        default:
            while (from <= to) {
                dates.push(moment(from).format('YYYYMMDD'));
                from = from.addDays(1);
            };

            for (var i = 0; i < dates.length; i++) {
                $('.date-field[data-date=' + dates[i] + ']').addClass('blackout');
            };
            break;
    }
}

function getBlackoutList() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyclosures/get/' + site_id,
        type: 'get',
        beforeSend: function () {
            var template = `
                    <tr>
                        <td colspan=5>
                            <center><object type="image/svg+xml" data="./assets/images/loading.svg" class ="logo">
                              Drivestays
                            </object></center>
                        </td>
                    </tr>
                `;
            element.closure_body.append(template);
        },
        success: function (result) {
            element.closure_body.empty();
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var template = `
                        <tr data-id= `+ result[i].ID + ` >
                            <td>`+ parseInt(i + 1) + `</td>
                            <td> `+ moment(result[i].FromDate).format("YYYY-MM-DD") + ` </td>
                            <td> `+ moment(result[i].ToDate).format("YYYY-MM-DD") + ` </td>
                            <td>`+ result[i].Description + `</td>
                            <td class="action">
                                <button class="edit-blackout" data-id=`+ result[i].ID + `>
                                    <div class ="ds-edit"></div> <span>Edit</span>
                                </button>
                                <button class="delete-blackout" data-id=`+ result[i].ID + `>
                                    <div class ="ds-delete"></div> <span>Delete</span>
                                </button>
                            </td>
                        </tr>
                    `;

                    element.closure_body.append(template);

                };

                $('.edit-blackout').on('click', function () {
                    element.btn_save_blackout.attr('data-type', 'update');
                    var id = $(this).data('id');
                    getDetailBlackout(id);
                });

                $('.delete-blackout').on('click', function () {
                    var id = $(this).data('id');
                    confirmDelete(id, $(this));
                });

            } else {
                var template = `
                    <tr class="row-null">
                        <td colspan=5>
                            <center>No Data</center>
                        </td>
                    </tr>
                `;
                element.closure_body.append(template);
            };
        },
        error: function (status) {

        }
    });
};

element.btn_save_blackout.on('click', function () {
    var type = $(this).data('type');
    var api_url;

    switch (type) {
        case 'add':
            var dataBlackout = {
                'FromDate': moment.utc(element.blackout_from_date.val()).format(),
                'ToDate': moment.utc(element.blackout_to_date.val()).format(),
                'Description': element.blackout_desc.val(),
                'Memo': '',
                'Booking': false,
                'PropertyID': parseInt(site_id)
            };
            api_url = SITE.API_PATH_DEV + '/propertyclosure/save';
            break;
        case 'update':
            var dataBlackout = {
                'ID': element.blackout_id.val(),
                'FromDate': moment.utc(element.blackout_from_date.val()).format(),
                'ToDate': moment.utc(element.blackout_to_date.val()).format(),
                'Description': element.blackout_desc.val(),
                'Memo': '',
                'Booking': false,
                'PropertyID': parseInt(site_id)
            };
            api_url = SITE.API_PATH_DEV + '/propertyclosure/update';
            break;
    };

    $.ajax({
        url: api_url,
        type: 'post',
        data: dataBlackout,
        success: function (result) {
            if (type == 'add') {
                element.closure_body.find('.row-null').remove();
                var rowLength = element.amenities_body.find('tr').not('.row-null').length;
                var template = `
                        <tr data-id=`+ result + `>
                            <td>`+ parseInt(rowLength + 1) + `</td>
                            <td> `+ moment(element.blackout_from_date.val()).format('YYYY-MM-DD') + ` </td>
                            <td> `+ moment(element.blackout_to_date.val()).format('YYYY-MM-DD') + ` </td>
                            <td>`+ element.blackout_desc.val() + `</td>
                            <td class="action">
                                <button class="edit-blackout" data-id=`+ result + `>
                                    <div class ="ds-edit"></div> <span>Edit</span>
                                </button>
                                <button class="delete-blackout" data-id=`+ result + `>
                                    <div class ="ds-delete"></div> <span>Delete</span>
                                </button>
                            </td>
                        </tr>
                    `;
                element.closure_body.append(template);
                calendarMarking(element.blackout_from_date.val(), element.blackout_to_date.val(), 'add');
            } else if (type == 'update') {
                var row = element.closure_body.find('tr[data-id=' + element.blackout_id.val() + ']');
                row.find('td:eq(1)').html(moment.utc(element.blackout_from_date.val()).format('YYYY-MM-DD'));
                row.find('td:eq(2)').html(moment.utc(element.blackout_to_date.val()).format('YYYY-MM-DD'));
                row.find('td:eq(3)').html(element.blackout_desc.val())

                element.btn_save_blackout.attr('data-type', 'add');
                resetBlackout();
            };

            floatAlert('Data has successfully saved', 'success', function (result) {
                //_cookies.put('site_id', data);
            });

            $('.edit-blackout').on('click', function () {
                element.btn_save_blackout.attr('data-type', 'update');
                var id = $(this).data('id');
                getDetailBlackout(id);
            });

            $('.delete-blackout').on('click', function () {
                var id = $(this).data('id');
                confirmDelete(id, $(this));
            });
        },
        error: function (status) {
            if (status.status == 409) {
                errorConflict();
            };
        }
    });
});

function resetBlackout() {
    element.blackout_id.val('');
    element.blackout_from_date.val('');
    element.blackout_to_date.val('');
    element.blackout_desc.val('');
};

function confirmDelete(id, elm) {
    var message = confirm('Are you sure want to delete this data?');
    if (message == true) {
        doDelete(id, elm);
    };
};

function errorConflict() {
    floatAlert('Error, blackout date has blocked. Please check Effective From Date and Effective To Date', 'error', function () { });
};

function doDelete(id, elm) {
    var fromDate = elm.parents('tr').find('td:eq(1)').html(),
        toDate = elm.parents('tr').find('td:eq(2)').html();
    //console.log(new Date(fromDate))

    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyclosure/delete/' + id,
        type: 'delete',
        success: function (result) {
            //console.log(result)
            calendarMarking(fromDate, toDate, 'delete');
            floatAlert('Data Successfully deleted', 'success', function () {
                elm.parents('tr').remove();
            })
        },
        error: function (status) {

        }
    });
};

function getDetailBlackout(id) {
    element.blackout_id.val(id);

    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyclosure/get/' + id,
        type: 'get',
        success: function (result) {
            //console.log(result)
            element.btn_save_blackout.data('type', 'update');
            element.blackout_id.val(result.ID);
            element.blackout_from_date.val(moment(result.FromDate).format('YYYY-MM-DD'));
            element.blackout_to_date.val(moment(result.toDate).format('YYYY-MM-DD'));
            element.blackout_desc.val(result.Description);
        },
        error: function (status) {
            console.log(status);
        }
    });
};
/*  =========================================
 *   END BLACKOUT TAB BLOCK FUNCTION
 *  =========================================
 */


/*  =========================================
 *   START RATE TAB BLOCK FUNCTION
 *  =========================================
 */

function getPropertyRateList() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyRates/get/' + site_id,
        type: 'get',
        beforeSend: function () {
            var template = `
                    <tr>
                        <td colspan=5>
                            <center><object type="image/svg+xml" data="./assets/images/loading.svg" class ="logo">
                              Drivestays
                            </object></center>
                        </td>
                    </tr>
                `;
            element.rate_body.append(template)
        },
        success: function (result) {
            var tempalte;
            element.rate_body.empty();
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var template = `
                            <tr data-id= `+ result[i].ID +` >
                                <td> `+ parseInt(i+1) +` </td>
                                <td> `+ moment(result[i].FromDate).format('YYYY-MM-DD') +` </td>
                                <td> `+ moment(result[i].ToDate).format('YYYY-MM-DD')+` </td>
                                <td> `+ result[i].Rate +` </td>
                                <td class ="action">
                                    <button class ='edit-rate' data-id= `+ result[i].ID +` >
                                        <div class ="ds-edit"></div> <span>Edit</span>
                                    </button>
                                    <button class ='delete-rate' data-id= `+ result[i].ID +` >
                                        <div class ="ds-delete"></div> <span>Delete</span>
                                    </button>
                                </td>
                            </tr>
                        `;

                    element.rate_body.append(template);
                }

                $('.edit-rate').on('click', function () {
                    element.btn_save_rate.attr('data-type', 'update');
                    var id = $(this).data('id');
                    getDetailRate(id)
                })

                $('.delete-rate').on('click', function () {
                    var id = $(this).data('id');
                    confirmDelete(id, $(this));
                })
            } else {
                var template = `
                        <tr class="row-null">
                            <td colspan=5>
                                <center>No Data</center>
                            </td>
                        </tr>
                    `;
                element.rate_body.append(template)
            }
        },
        error: function (status) {

        }
    })
};

function confirmDelete(id, elm) {
    var message = confirm('Are you sure want to delete this data?');

    if (message == true) {
        deleteRate(id, elm)
    }
}

function deleteRate(id, elm) {
    $.ajax({
        url: SITE.API_PATH_DEV+'/propertyRate/delete/'+id,
        type: 'delete',
        success: function (result) {
            elm.parents('tr').remove()
            floatAlert('Data successfully deleted', 'success', function () {})
        },
        error: function (status) {

        }
    })
}

function getDetailRate(id) {
    $.ajax({
        url: SITE.API_PATH_DEV+'/propertyRate/get/'+id,
        type: 'get',
        success: function (result) {
            console.log(result)
            element.rate_type_select.find('li[value=' + result.RateTypeID + ']').click();
            element.rate_from.val(moment(result.FromDate).format('YYYY-MM-DD'));
            element.rate_to.val(moment(result.ToDate).format('YYYY-MM-DD'));
            element.rate_value.val(result.Rate);
            element.rate_id.val(result.ID);
        },
        error: function (status) {
            console.log(status)
        }
    })
}

function getRateType() {
    $.ajax({
        url: SITE.API_PATH_DEV+'/rateTypes/get',
        type: 'get',
        success: function (result) {
            element.rate_type_select.parent().removeClass('disable');
            
            for(var i = 0; i < result.length; i++){
                var template = `
                        <li value=`+ result[i].ID +`>`+ result[i].Description +`</li>
                    `;
                element.rate_type_select.append(template)
            }
            listTrigger()
        },
        error: function (status) {

        }
    })
}

element.btn_save_rate.on('click', function () {
    var type = $(this).data('type'),
        dataRate, api_url;

    switch (type) {
        case 'add':
            api_url = SITE.API_PATH_DEV + '/propertyRate/save';
            dataRate = {
                'FromDate' : element.rate_from.val(),
                'ToDate': element.rate_to.val(),
                'Rate': element.rate_value.val(),
                'Memo': '',
                'RateTypeID': element.rate_type.val(),
                'PropertyID': site_id
            }
            break;
        case 'update':
            api_url = SITE.API_PATH_DEV+'/propertyRate/update'; 
            dataRate = {
                'ID': element.rate_id.val(),
                'FromDate' : element.rate_from.val(),
                'ToDate': element.rate_to.val(),
                'Rate': element.rate_value.val(),
                'Memo': '',
                'RateTypeID': element.rate_type.val(),
                'PropertyID': site_id
            }
            break;
    }

    $.ajax({
        url: api_url,
        type: 'post',
        data: dataRate,
        success: function (result) {
            console.log(result);
            if (type == 'add') {
                var rowLength = element.amenities_body.find('tr').not('.row-null').length;
                element.rate_body.find('.row-null').remove();
                var template = `
                    <tr data-id=`+ result + `>
                        <td>`+ parseInt(rowLength+1) + `</td>
                        <td>`+ moment(element.rate_from.val()).format('YYYY-MM-DD') + `</td>
                        <td>`+ moment(element.rate_to.val()).format('YYYY-MM-DD') + `</td>
                        <td>`+ element.rate_value.val() + `</td>
                        <td class ="action">
                            <button class='edit-rate' data-id=`+ result + `>
                                <div class ="ds-edit"></div> <span>Edit</span>
                            </button>
                            <button class ='delete-rate' data-id= `+ result + ` >
                                <div class ="ds-delete"></div> <span>Delete</span>
                            </button>
                        </td>
                    </tr>
                `;

                element.rate_body.append(template);

                floatAlert('Data Successfully Saved', 'success', function(){})
            } else if (type == 'update') {
                var row = element.rate_body.find('tr[data-id=' + element.rate_id.val() + ']');
                row.find('td:eq(1)').html(moment(element.rate_from.val()).format('YYYY-MM-DD'));
                row.find('td:eq(2)').html(moment(element.rate_to.val()).format('YYYY-MM-DD'));
                row.find('td:eq(3)').html(element.rate_value.val());
                element.btn_save_rate.attr('type', 'add');
                floatAlert('Data Successfully Updated', 'success', function () { })
            }

            $('.edit-rate').on('click', function () {
                element.btn_save_rate.attr('data-type', 'update');
                var id = $(this).data('id');
                getDetailRate(id)
            })

            $('.delete-rate').on('click', function () {
                var id = $(this).data('id');
                confirmDelete(id, $(this));
            })
            
        },
        error: function (status) {
            floatAlert('Error saving data', 'error', function () { })
        }
    })
})

/*  =========================================
 *   END RATE TAB BLOCK FUNCTION
 *  =========================================
 */


/*  =========================================
 *   START AMENITIES TAB BLOCK FUNCTION
 *  =========================================
 */

function getPropertyAmenitiesList() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyamenities/get/' + site_id,
        type: 'get',
        beforeSend: function () {
            var template = `
                    <tr>
                        <td colspan=4>
                            <center><object type="image/svg+xml" data="./assets/images/loading.svg" class ="logo">
                              Drivestays
                            </object></center>
                        </td>
                    </tr>
                `;
            element.amenities_body.append(template)
        },
        success: function (result) {
            element.amenities_body.empty();
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var template = `
                            <tr data-id= `+ result[i].ID + ` >
                                <td> `+ parseInt(i + 1) + ` </td>
                                <td> `+ result[i].Memo + ` </td>
                                <td>$ `+ result[i].Rate + ` </td>
                                <td class ="action">
                                    <button class ='edit-rate' data-id= `+ result[i].ID + ` >
                                        <div class ="ds-edit"></div> <span>Edit</span>
                                    </button>
                                    <button class ='delete-rate' data-id= `+ result[i].ID + ` >
                                        <div class ="ds-delete"></div> <span>Delete</span>
                                    </button>
                                </td>
                            </tr>
                        `;

                    element.amenities_body.append(template);
                }

                $('.edit-rate').on('click', function () {
                    element.btn_save_amenities.attr('data-type', 'update');
                    var id = $(this).data('id');
                    getDetailAmenities(id)
                })

                $('.delete-rate').on('click', function () {
                    var id = $(this).data('id');
                    confirmDelete(id, $(this));
                })
            } else {
                var template = `
                        <tr class="row-null">
                            <td colspan=4>
                                <center>No Data</center>
                            </td>
                        </tr>
                    `;
                element.amenities_body.append(template)
            }
        },
        error: function (status) {

        }
    })
};

function confirmDelete(id, elm) {
    var message = confirm('Are you sure want to delete this data?');

    if (message == true) {
        deleteAmenities(id, elm)
    }
}

function deleteAmenities(id, elm) {
    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyamenity/delete/' + id,
        type: 'delete',
        success: function (result) {
            elm.parents('tr').remove()
            floatAlert('Data successfully deleted', 'success', function () { })
        },
        error: function (status) {

        }
    })
}

function getDetailAmenities(id) {
    $.ajax({
        url: SITE.API_PATH_DEV + '/propertyamenity/get/' + id,
        type: 'get',
        success: function (result) {
            element.amenities_type_select.find('li[value=' + result.AmenityTypeID + ']').click();
            element.amenities_rate.val(result.Rate);
            element.amenities_id.val(result.ID);
        },
        error: function (status) {
            console.log(status)
        }
    })
}

function getAmenitiesType() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/amenitytypes/get',
        type: 'get',
        success: function (result) {
            element.amenities_type_select.parent().removeClass('disable');

            for (var i = 0; i < result.length; i++) {
                var template = `
                        <li value=`+ result[i].ID + `>` + result[i].Description + `</li>
                    `;
                element.amenities_type_select.append(template)
            }
            listTrigger()
        },
        error: function (status) {

        }
    })
}

element.btn_save_amenities.on('click', function () {
    var type = $(this).data('type'),
        dataAmenities, api_url;

    switch (type) {
        case 'add':
            api_url = SITE.API_PATH_DEV + '/propertyamenity/save';
            dataAmenities = {
                'Rate': element.amenities_rate.val(),
                'Memo': element.amenities_selected.find('div').html(),
                'AmenityTypeID': element.amenities_type.val(),
                'PropertyID': site_id
            }
            break;
        case 'update':
            api_url = SITE.API_PATH_DEV + '/propertyamenity/update';
            dataAmenities = {
                'ID': element.amenities_id.val(),
                'Rate': element.amenities_rate.val(),
                'Memo': element.amenities_selected.find('div').html(),
                'AmenityTypeID': element.amenities_type.val(),
                'PropertyID': site_id
            }
            break;
    }

    $.ajax({
        url: api_url,
        type: 'post',
        data: dataAmenities,
        success: function (result) {
            if (type == 'add') {
                var row_length = element.amenities_body.find('tr').not('.row-null').length;
                element.amenities_body.find('.row-null').remove();
                var template = `
                    <tr data-id=`+ result + `>
                        <td>`+ parseInt(row_length+1) + `</td>
                        <td>`+ element.amenities_selected.find('div').html() + `</td>
                        <td>$ `+ element.amenities_rate.val() + `</td>
                        <td class ="action">
                            <button class='edit-amenities' data-id=`+ result + `>
                                <div class ="ds-edit"></div> <span>Edit</span>
                            </button>
                            <button class ='delete-amenities' data-id= `+ result + ` >
                                <div class ="ds-delete"></div> <span>Delete</span>
                            </button>
                        </td>
                    </tr>
                `;

                element.amenities_body.append(template);

                floatAlert('Data Successfully Saved', 'success', function () { })
            } else if (type == 'update') {
                var row = element.amenities_body.find('tr[data-id=' + element.amenities_id.val() + ']');
                row.find('td:eq(1)').html(element.amenities_selected.find('div').html());
                row.find('td:eq(2)').html(element.amenities_rate.val());
                element.btn_save_amenities.attr('type', 'add');
                floatAlert('Data Successfully Updated', 'success', function () { })
            }

            $('.edit-amenities').on('click', function () {
                element.btn_save_amenities.attr('data-type', 'update');
                var id = $(this).data('id');
                getDetailAmenities(id)
            })

            $('.delete-amenities').on('click', function () {
                var id = $(this).data('id');
                confirmDelete(id, $(this));
            })

        },
        error: function (status) {
            floatAlert('Error saving data', 'error', function () { })
        }
    })
})

/*  =========================================
 *   END AMENITIES TAB BLOCK FUNCTION
 *  =========================================
 */