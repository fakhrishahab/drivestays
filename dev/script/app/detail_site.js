var element = {
    detailHeader: $('#detail-header'),
    btnSeeImage: $('#btn-see-image'),
    ownerImage: $('#owner-image'),
    ownerName: $('#owner-name'),
    btnContactHost : $('#btn-contact-host'),

    detailSitePicture: $('#detail-site-picture'),
    detailSiteName: $('#detail-site-name'),
    detailSiteAddress: $('#detail-site-address'),
    detailSiteAmenities: $('#detail-site-amenities'),
    detailSiteDesc: $('#detail-site-desc'),
    detailSiteWidth: $('#detail-site-width'),
    detailSiteLength: $('#detail-site-length'),
    detailSiteHeight: $('#detail-site-height'),
    detailSiteAccess: $('#detail-site-access'),
    detailSiteSecurity: $('#detail-site-security'),
    detailSitePower: $('#detail-site-power'),
    detailSiteNoise: $('#detail-site-noise'),
    detailSiteCapacity: $('#detail-site-capacity'),
    detailSiteNameBill : $('#detail-site-name-bill'),
    detailSiteRate: $('#detail-site-rate'),

    inputAddFacilities : $('.row-add-facilities'),
    inputBillingArrival: $('#billing-arrival'),
    inputBillingDeparture: $('#billing-departure'),
    billingContent: $('.billing-content'),
    billingTotal: $('.billing-total'),
    btnAddFacilities: $('#btn-add-facilities'),
    alertBilling: $('.alert-billing'),
    alertEnquiry: $('.alert-enquiry'),

    modalContactHost: $('#modal-contact-host'),
    btnBookSite: $('.btn-book-site'),
    sendEnquiry: $('#send-enquiry'),
    btnSendEnquiry : $('#btn-send-enquiry'),

    modalArrivalInput: $('#modal-arrival-input'),
    modalDepartureInput: $('#modal-departure-input'),

    propertyPictureModal: $('#property-picture-modal'),
    totalImage: $('#total-image'),
    indexImage: $('#index-image'),
    photoNav: $('.photo-nav')
}

siteParam = {
    PropertyID : 48,
    fromDate : '2016-10-21',
    toDate : '2016-10-24'
};

var siteDetail, diffDays, groupingRate, totalBilling, billingItems = [];

getSiteDetail();
function getSiteDetail() {
    $.ajax({
        url : SITE.API_PATH_DEV+'/property/viewproperty',
        type: 'post',
        data: {
            "PropertyID": siteParam.PropertyID,
            "FromDate": siteParam.fromDate,
            "ToDate" : siteParam.toDate
        },
        beforeSend: function(){
            DS_MODAL.open({
                status: 'preload-full',
            })
        },
        success: function (result) {
            siteDetail = result;
            //console.log(result)
            DS_MODAL.close()
            var location = { lat: result.Latitude, lng: result.Longitude };
            initMap(location);

            generateDetail(result);
        },
        error: function (resp) {

        }
    })
}

function generateDetail(data) {

    if (data.PropertyPictures.length >= 1) {
        element.btnSeeImage.show();
        element.detailSitePicture.css('background-image', 'url(' + SITE.PATH + '' + data.PropertyPictures[0].Path + ')')
        element.detailHeader.css('background-image', 'url(' + SITE.PATH + '' + data.PropertyPictures[0].Path + ')')

        element.propertyPictureModal.css('background', 'url(../' + data.PropertyPictures[0].Path + ')')

        element.totalImage.html(data.PropertyPictures.length);

        sliderModalImage(data.PropertyPictures);

    } else {
        element.btnSeeImage.hide();
        element.detailSitePicture.css('background-image', 'url(https://maps.googleapis.com/maps/api/streetview?size=600x300&location=' + data.Latitude + ',' + data.Longitude + '&key=AIzaSyAT5L7QlWsBgKjtvLHZaCDWy8M2MdIEIiU)')
        element.detailHeader.css('background-image', 'url(https://maps.googleapis.com/maps/api/streetview?size=600x300&location=' + data.Latitude + ',' + data.Longitude + '&key=AIzaSyAT5L7QlWsBgKjtvLHZaCDWy8M2MdIEIiU)')
    }
    
    if(data.customer.CustomerPictures.length >= 1){
        element.ownerImage.css('background-image', 'url('+ SITE.PATH +''+ data.customer.CustomerPictures[0].Path +')')
    }

    element.ownerName.html(data.customer.FirstName)
    element.detailSiteName.html(data.AddressLine1)
    element.detailSiteAddress.html(data.City + ', ' + data.State + ' ' + data.PostalCode)

    if (data.PropertyAmenities.length >= 1) {
        //element.inputAddFacilities.hide();
        data.PropertyAmenities.map(function (key) {
            var template = `
                <div class ="detail-site-info__site-wrapper__amenities__item">
                    <div>`+ key.Memo +`</div>
                    <div class ="price">$ `+ key.Rate +` /day</div>
                </div>
            `;
            element.detailSiteAmenities.append(template)

            list = '<li value=' + key.ID + '>' + key.Memo + ' - $ ' + key.Rate + '.00</li>'
            $('#list-facilities').append(list)
        })
    } else {
        var template = `
            <div class ="detail-site-info__site-wrapper__amenities__item">
                    <div> No Amenities Available </div>
            </div>
        `;
        element.detailSiteAmenities.append(template);
        element.inputAddFacilities.hide();
    }

    element.detailSiteDesc.html(data.Description);

    element.detailSiteWidth.html('Width : ' + (data.Width ? data.Width + ' (cm)' : 'N/A'));
    element.detailSiteLength.html('Length : ' + (data.Length ? data.Length + ' (cm)' : 'N/A'));
    element.detailSiteHeight.html('Height : ' + (data.Height ? data.Height + ' (cm)' : 'N/A'));

    element.detailSiteAccess.html('Access : ' + (data.AccessToProperty ? 'Lock' : 'No Lock'));
    element.detailSiteSecurity.html('Security : ' + (data.Security ? 'Yes' : 'No'));
    element.detailSitePower.html('Power : ' + (data.Powered ? 'Yes' : 'No'));
    element.detailSiteNameBill.html(data.AddressLine1);
    element.detailSiteRate.html('$ ' + data.DefaultRate + '.00');

    listTrigger();
    generateBilling(data);
}

function sliderModalImage(data) {
    var indexImg = 0;

    element.photoNav.on('click', function () {
        var type = $(this).data('type'),
        total_img = data.length;

        switch (type) {
            case 'next':
                if (indexImg < total_img - 1) {
                    indexImg += 1
                } else {
                    indexImg = 0
                }
                break;
            case 'prev':
                if (indexImg == 0) {
                    indexImg = total_img - 1
                } else {
                    indexImg -= 1
                }
                break;
        }

        $('.photo-wrapper').css('background', 'url(../' + data[indexImg].Path + ')')

        $('#index-image').html(indexImg + 1);
    });
}

function generateBilling(data) {
    billingItems = [];
    var arrivalDate = siteParam.FromDate,
        departureDate = siteParam.ToDate;

    document.getElementById('billing-arrival').value = siteParam.fromDate;
    document.getElementById('billing-departure').value = siteParam.toDate;

    startPicker.setStartRange(new Date(moment(siteParam.fromDate)));
    endPicker.setStartRange(new Date(moment(siteParam.fromDate)));
    startPicker.setEndRange(new Date(moment(siteParam.toDate)));
    endPicker.setEndRange(new Date(moment(siteParam.toDate)));

    startPicker.gotoMonth(moment.utc(siteParam.fromDate).month());
    endPicker.gotoMonth(moment.utc(siteParam.toDate).month());

    groupingRate = _.chain(data.PropertyRates)
                    .groupBy('Rate')
                    .map(function (value, key) {
                        return {
                            rate: parseInt(key),
                            date: _.pluck(value, 'FromDate')
                        }
                    }).reverse()._wrapped;
    
    groupingRate.map(function (key) {
        var memo = moment(key.date[0]).format('YYYY-MM-DD') + ' to ' + moment(key.date[key.date.length - 1]).format('YYYY-MM-DD') + '<span>'+key.date.length +' days(s) x $ '+key.rate+'.00'+'</span>';
        var dailyBilling = {
            'ID': '',
            'Memo': memo,
            'DailyRate ' : key.rate,
            'Rate' : key.rate * key.date.length,
            'Type' : 'daily'
        }
        billingItems.push(dailyBilling)
    })

    var timeDiff = Math.abs(new Date(siteParam.toDate).getTime() - new Date(siteParam.fromDate).getTime())
    diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    countBilling();
}

element.btnAddFacilities.on('click', function () {
    var id = $('#add-facilities')
    if (id.val() == '' || id.val() == null || id.val() == undefined) {
        floatAlert('You must select amenities to add', 'error', function () { })
    } else {
        var choosen = _.where(siteDetail.PropertyAmenities, { ID: parseInt(id.val()) })
        $('#list-facilities').find('li[value=' + id.val() + ']').remove();
        id.val(null);
        id.siblings('.select-area').html('Add Facilities');

        billingItems.push({
            'ID': choosen[0]['ID'],
            'Memo': choosen[0]['Memo'],
            'DailyRate' : choosen[0]['Rate'],
            'Rate': choosen[0]['Rate'] * diffDays,
            'Type' : 'amenities'
        })
    }

    countBilling();
})

function countBilling() {
    totalBilling = 0;
    $('.daily-rate').remove();
    $('.facilities-row').remove();
    billingItems.map(function (key) {
        if (key.Type == 'daily') {
            var template = `
                <div class ="billing-row daily-rate">
                    <div class ="title">`+ key.Memo +`</span></div>
                    <div class ="price">$ `+ key.Rate +`.00</div>
                </div>
            `;
            element.billingContent.prepend(template);
        } else {
            var template = `
                <div class ="billing-row facilities-row">
                    <div class ="ds-delete delete-facilities" data-id= `+key.ID+` ></div>
                    <div class ="title"> `+ key.Memo +` <br/>
                        (`+ diffDays +` days x $ `+ key.DailyRate +`.00)
                    </div>
                    <div class ="price">
                        $ `+ key.Rate +`.00
                    </div>
                </div>
            `;
            element.billingTotal.before(template);
        }
        console.log('sini')
    })

    $('.delete-facilities').on('click', function () {
        var index = _.findLastIndex(billingItems, { ID: parseInt($(this).data('id')) })
        var list = `
            <li value= `+ billingItems[index].ID +` >
                `+ billingItems[index].Memo +` - $ `+ billingItems[index].DailyRate +`.00
            </li>
        `;
        $('#list-facilities').append(list);
        listTrigger();

        billingItems.splice(index, 1);
        countBilling();
    })

    billingItems.map(function (key) {
        totalBilling += parseInt(key.Rate);
        $('.title-price').html('$ ' + totalBilling + '.00');
    })

}

function refineDate() {

    $.ajax({
        url : SITE.API_PATH_DEV + '/properties/newdatesearch',
        type : 'post',
        data: {
            "PropertyID": siteParam.PropertyID,
            "FromDate": element.inputBillingArrival.val(),
            "ToDate": element.inputBillingDeparture.val()
        },
        beforeSend: function () {
            preload.show($('.billing-info-wrapper'))
        },
        success: function (result) {
            siteParam.fromDate = element.inputBillingArrival.val();
            siteParam.toDate = element.inputBillingDeparture.val();

            if (result != null) {
                element.billingContent.show();
                generateBilling(result);
                alertInfo.close(element.alertBilling);

                // IF MODAL ENQUIRY IS OPENED
                if (element.alertEnquiry) {
                    alertInfo.close($('.alert-enquiry'));
                    $('#btn-confirm-ok').show();
                }
            } else {
                alertInfo({
                    'type': 'text',
                    'desc': 'The date you choose has already booked!',
                    'status' : 'error'
                }, element.alertBilling)
                element.billingContent.hide();

                // IF MODAL ENQUIRY IS OPENED
                if (element.alertEnquiry) {
                    alertInfo({
                        'type': 'text',
                        'desc': 'The date you choose has already booked!',
                        'status': 'error'
                    }, $('.alert-enquiry'))
                    $('.alert-enquiry').addClass('push-top');
                    $('#btn-confirm-ok').hide();
                }
            }
            
            preload.remove($('.billing-info-wrapper'));
        },
        error: function (resp) {
            element.inputBillingArrival.val(siteParam.fromDate);
            element.inputBillingDeparture.val(siteParam.toDate);
            preload.remove($('.billing-info-wrapper'));
        }
    })
}

function checkClosure(month, year) {

    var dateButton = $('.pika-day');

    $.ajax({
        url : SITE.API_PATH_DEV+'/property/closure?propertyid='+ siteParam.PropertyID +'&date='+year+'-'+month+'-01',
        type: 'get',
        beforeSend: function(){
            preload.show($('.pika-single'))
        },
        success: function (result) {
            result.map(function (key) {
                var day = parseInt(moment(key).format('DD')),
                    month = parseInt(moment(key).format('MM') - 1),
                    year = moment(key).format('YYYY');

                $('.pika-day[data-pika-year='+year+'][data-pika-month='+month+'][data-pika-day='+day+']').parent().addClass('is-disabled')
            })
            preload.remove($('.pika-single'))
        },
        error: function (resp) {
            console.log(resp)
        }
    })
}

/* =======================
    START DATE PICKER FUNCTION
*  =======================*/
var testDate;
var disable = false;
var startDate, endDate, startDate2, endDate2,
    updateStartDate = function () {
        startPicker.setStartRange(startDate);
        endPicker.setStartRange(startDate);
        endPicker.setMinDate(startDate);
        endPicker.gotoMonth(startDate.getMonth());
        siteParam.fromDate = moment(startDate).format('YYYY-MM-DD');
        document.getElementById('billing-arrival').value = siteParam.fromDate;
        
        refineDate();
    },
    updateEndDate = function () {
        startPicker.setEndRange(endDate);
        startPicker.setMaxDate(endDate);
        endPicker.setEndRange(endDate);
        startPicker.gotoMonth(endDate.getMonth());
        siteParam.toDate = moment(endDate).format('YYYY-MM-DD');
        document.getElementById('billing-departure').value = siteParam.toDate;

        refineDate();
    },
    startPicker = new Pikaday({
        field: document.getElementById('billing-arrival'),
        numberOfMonths: 2,
        minDate: new Date(),
        maxDate: new Date(2020, 12, 31),
        format: 'YYYY-MM-DD',
        reposition: true,
        onDraw: function (drawn) {
            checkClosure(drawn.calendars[0].month+1, drawn.calendars[0].year);
        },
        onOpen: function () {
            checkClosure(moment(siteParam.fromDate).format('MM'), moment(siteParam.fromDate).format('YYYY'))
        },
        onSelect: function () {
            startDate = this.getDate();
            updateStartDate();

            //if (endPicker.getDate() == null) {
            //    endPicker.show();
            //}
        }
    }),
    endPicker = new Pikaday({
        field: document.getElementById('billing-departure'),
        numberOfMonths: 2,
        minDate: new Date(),
        maxDate: new Date(2020, 12, 31),
        format: 'YYYY-MM-DD',
        reposition: true,
        onDraw: function (drawn) {
            checkClosure(drawn.calendars[0].month+1, drawn.calendars[0].year);
        },
        onOpen: function () {
            checkClosure(moment(siteParam.fromDate).format('MM'), moment(siteParam.fromDate).format('YYYY'))
        },
        onSelect: function () {
            endDate = this.getDate();
            updateEndDate();

            //if (startPicker.getDate() == null) {
            //    startPicker.show();
            //}
        }
    }),
    _startDate = startPicker.getDate(),
    _endDate = endPicker.getDate();

if (_startDate) {
    startDate = _startDate;
    updateStartDate()
}

if (_endDate) {
    endDate = _endDate;
    updateEndDate()
}

/* =======================
    END DATE PICKER FUNCTION
*  =======================*/


/* =======================
    START MAP SITE FUNCTION
*  =======================*/
var marker, autocomplete, markers = [];
var componentForm = {
    street_number: '',
    route: '',
    locality: '',
    administrative_area_level_1: '',
    country: '',
    postal_code: ''
};

function initMap(location){
    myLatLng = {lat: 0, lng: 0 };

    var map = new google.maps.Map(document.getElementById('detail-site-map'), {
        zoom: 13,
        center: location ? location : myLatLng
    });

    var image = {
        url: '/assets/images/marker.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(35, 35),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(35, 35)
    };

    var marker = new google.maps.Marker({
        position: location ? location : myLatLng,
        map: map,
        icon : image,
        title: 'Hello World!'
    });

    var circle = new google.maps.Circle({
        strokeColor : '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: location ? location : myLatLng,
        radius : 1000
    })
}

/* =======================
    END MAP SITE FUNCTION
*  =======================*/

element.sendEnquiry.on('click', function () {
    openModalContact();
});

element.btnContactHost.on('click', function () {
    openModalContact();
});

function openModalContact() {
    DS_MODAL.open({
        status: 'contact-host',
        image: '/assets/images/success.svg',
        message: 'Your request has successfully submitted, check on your transaction list menu'
    });

    document.getElementById('modal-arrival-input').value = siteParam.fromDate;
    document.getElementById('modal-departure-input').value = siteParam.toDate;

    if (siteDetail.customer.CustomerPictures.length >= 1) {
        $('#modal-host-image').css('background-image', 'url(' + SITE.PATH + '' + siteDetail.customer.CustomerPictures[0].Path + ')')
    }

    $('#modal-host-name').html(siteDetail.customer.FirstName);

    startPicker2 = new Pikaday({
        field: document.getElementById('modal-arrival-input'),
        numberOfMonths: 2,
        minDate: new Date(),
        maxDate: new Date(2020, 12, 31),
        format: 'YYYY-MM-DD',
        reposition: true,
        onDraw: function (drawn) {
            checkClosure(drawn.calendars[0].month+1, drawn.calendars[0].year);
        },
        onOpen: function () {
            checkClosure(moment(siteParam.fromDate).format('MM'), moment(siteParam.fromDate).format('YYYY'))
        },
        onSelect: function () {
            startDate = this.getDate();
            updateStartDate();
            siteParam.fromDate = moment(this.getDate()).format('YYYY-MM-DD')
            //if (endPicker.getDate() == null) {
            //    endPicker.show();
            //}
        }
    }),
    endPicker2 = new Pikaday({
        field: document.getElementById('modal-departure-input'),
        numberOfMonths: 2,
        minDate: new Date(),
        maxDate: new Date(2020, 12, 31),
        format: 'YYYY-MM-DD',
        reposition: true,
        onDraw: function (drawn) {
            checkClosure(drawn.calendars[0].month+1, drawn.calendars[0].year);
        },
        onOpen: function () {
            checkClosure(moment(siteParam.fromDate).format('MM'), moment(siteParam.fromDate).format('YYYY'))
        },
        onSelect: function () {
            endDate = this.getDate();
            updateEndDate();
            siteParam.toDate = moment(this.getDate()).format('YYYY-MM-DD')

            //if (startPicker.getDate() == null) {
            //    startPicker.show();
            //}
        }
    });

    startPicker2.setStartRange(new Date(moment(siteParam.fromDate)))
    startPicker2.setEndRange(new Date(moment(siteParam.toDate)))
    endPicker2.setStartRange(new Date(moment(siteParam.fromDate)))
    endPicker2.setEndRange(new Date(moment(siteParam.toDate)))

    var arrival = new Pikaday({
        field: document.getElementById('search-arrival-modal'),
        format: 'MM/DD/YYYY'
    });

    $('#btn-send-enquiry').on('click', function () {
        alertInfo({
            'type': 'html',
            'desc': '<img src=/assets/images/loading.svg style="width:40px;margin:0 auto">'
        }, $('.alert-post-enquiry'))
        
        $.ajax({
            url: SITE.API_PATH_DEV+'/message/create',
            type: 'post',
            data: {
                'PropertyID': siteParam.PropertyID,
                'FromDate': siteParam.fromDate,
                'ToDate': siteParam.toDate,
                'Text' : $('.modal-message-input').val()
            },
            success: function (result) {
                alertInfo.close($('.alert-post-enquiry'));
            },
            error: function (resp) {
                alertInfo.close($('.alert-post-enquiry'));
                alertInfo({
                    'type': 'text',
                    'desc': 'Error send Enquiry'
                }, $('.alert-post-enquiry'))
            }
        })
    })
}
