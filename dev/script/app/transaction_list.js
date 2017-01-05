'use strict';

var element = {
    orderWrapper: $('.order-wrapper'),
    orderHeader: $('.order-header'),
    tab_trigger: $('.site-tab-wrapper div'),
    form_wrapper: $('.form-add-site'),
    target: {
        booking_list: $('#booking-list'),
        stay_request: $('#stay-request'),
        transaction_complete: $('#transaction-complete')
    },
    stay_tab_trigger: $('.review-menu li'),
    stay_wrapper: $('.stay-wrapper'),

    filter_type_booking: $('#filter-type-booking')
};

var user_data = {
    user_id : 371
};

$('.order-header').on('click', function () {
        $(this).parent().toggleClass('order-wrapper-collapse');
    });

var tab_handler = new Function();

$.extend(tab_handler.prototype, {
    default: function () {
        tab_handler.prototype.hideAll();
        element.target.booking_list.show();
        getBookingList();
        // element.target.stay_request.show()
    },
    hideAll: function () {
        element.form_wrapper.hide();
    },
    click: function (elm) {
        elm.addClass('active');
        elm.siblings('div').removeClass('active');
        var target = elm.data('target');
        switch (target) {
            case 'booking-list':
                getBookingList();
                break;
            case 'stay-request':
                getRequestList();
                break;
            case 'transaction-complete':
                break;
            default:
                getBookingList();
                break;
        }
        tab_handler.prototype.hideAll();
        $('#' + target).show();
    }
})

tab_handler.prototype.default();
element.tab_trigger.on('click', function () {
    tab_handler.prototype.click($(this));
});

var tab_stay = new Function();

$.extend(tab_stay.prototype, {
    default: function () {
        tab_stay.prototype.hideAll()
    },
    hideAll: function () {
        element.stay_wrapper.hide();
    },
    click: function (elm) {
        elm.addClass('active');
        elm.siblings('li').removeClass('active');
    }
});

/*  =========================================
 *   START BOOKING LIST FUNCTION
 *  =========================================
 */

$.extend(element, {
    booking_list_wrapper: $('#booking-list-wrapper'),
    booking_preload: $('#booking-preload')
});

function bookingListTrigger() {
    element.orderWrapper.on('click', function (e) {
        $(this).toggleClass('order-wrapper-collapse');
        e.stopPropagation();
        e.preventDefault();
    });
};

function getBookingList() {
    console.log('ini aja')
    $.ajax({
        url: SITE.API_PATH_DEV + '/requests/get',
        type: 'get',
        headers: {
            "Authorization": access_token
        },
        success: function (result) {
            if (result.Data.length < 1) {
                noDataBooking();
            } else {
                renderBookingList(result.Data);
            };
        },
        error: function (status) {
            console.log(status);
        }
    });
};

function showFilterBooking() {
    var typeArr = [];
    Object.keys(CONSTANT).map(function (key, value) {
        var word = key.split('_');
        if (word[0] == 'STATUS') {
            var name= '';
            for (var i = 0; i < word.length; i++) {
                name += word[i] + ' ';
            }
            
            typeArr.push({ 'id': value, 'name': name });

            var list = '<li value=' + value + '>' + name + '</li>'
            element.filter_type_booking.append(list)
        }
    });
    listTrigger();
};

showFilterBooking()

function noDataBooking() {
    element.booking_preload.find('.loader').empty();
    element.booking_preload.find('.loader').html('<div>No Booking Data</div>');
};

function renderBookingList(result) {
    element.booking_list_wrapper.empty();
    for (var i = 0; i < result.length; i++) {
        var days = 0;
        var dailyRate = 0;
        var templateAmenities = '';
        Object.keys(result[i].Request.RequestBillingItems).forEach(function (key) {
            if (result[i].Request.RequestBillingItems[key].BillingItemTypeID == 1) {
                dailyRate += result[i].Request.RequestBillingItems[key].Amount;
                days += 1;
            } else {
                dailyRate += days * result[i].Request.RequestBillingItems[key].Amount;
                templateAmenities += `<div><div class=ds-bathroom></div><div>` + result[i].Request.RequestBillingItems[key].Description + `</div></div>`;
            };
        });

        var templateStatus = '',
            btnPayment = '',
            statusMessage = '',
            statusIcon = '',
            btnCancel = `<button class ='btn-site btn-blue btn-cancel'>Cancel Order</button>`;

        switch (result[i].Request.StatusTypeID) {
            case CONSTANT.STATUS_SUBMITTED:
                templateStatus = `<span class ='ds-booked'></span>`;
                statusMessage = 'This request is awaiting for owner response';
                statusIcon = 'ds-book-submit';
                break;
            case CONSTANT.STATUS_ACCEPTED:
                templateStatus = `<span class ='ds-review'></span>`;
                btnPayment = `<button class ='btn-site btn-payment'>Continue To Payment</button>`;
                statusMessage = 'This request has been accepted by the property owner. Please continue to payment process';
                statusIcon = 'ds-review';
                break;
            case CONSTANT.STATUS_DECLINED:
                templateStatus = `<span class ='ds-book-decline'></span>`;
                statusMessage = 'This request has been declined by the property owner.';
                statusIcon = 'ds-book-decline';
                break;
            case CONSTANT.STATUS_PAID:
                templateStatus = `<span class ='ds-book-paid'></span>`;
                statusMessage = 'This request has been paid';
                statusIcon = 'ds-book-paid';
                break;
            case CONSTANT.STATUS_FREE:
                templateStatus = `<span class ='ds-book-free'></span>`;
                statusMessage = 'This request has been granted';
                statusIcon = 'ds-book-free';
                break;
            case CONSTANT.STATUS_CANCELLED_VISITOR:
                templateStatus = `<span class ='ds-book-cancel'></span>`;
                statusMessage = 'This request has been cancelled by the customer';
                statusIcon = 'ds-book-cancel';
                break;
            case CONSTANT.STATUS_CANCELLED_OWNER:
                templateStatus = `<span class ='ds-book-cancel'></span>`;
                statusMessage = 'You have cancelled this request';
                statusIcon = 'ds-book-cancel';
                break;
            case CONSTANT.STATUS_CANCELLED_SYSTEM:
                templateStatus = `<span class ='ds-book-cancel'></span>`;
                statusMessage = 'System Administrator has cancelled this request';
                statusIcon = 'ds-book-cancel';
                break;
        }

        var template = `
            <div class ='order-wrapper order-wrapper-collapse'>
                <div class ='order-header'>
                    <div class ='order-charet'>
                        <div class ='ds-chevron-right'></div>
                    </div>
                    <div class ='order-title'>
                        <span>`+ result[i].PropertyAddressLine1 + `</span>
                        <span>Booking Date `+ moment(result[i].Request.Date).format('YYYY-MM-DD') + `</span>
                    </div>

                    <div class ='order-total'>
                        <span>TOTAL</span>
                        <span>$ `+ dailyRate + `.00</span>
                    </div>

                    <div class ='order-status'>
                        `+ templateStatus + `
                        <span>` + result[i].Request.StatusType.Description + `</span>
                    </div>
                </div>
                <div class ='order-content'>
                    <div class="ds-row">
                        <div class="col-3">
                            <div class ='order-content-image'>
                                <img src='./assets/images/site/1.png' alt=''>
                            </div>
                        </div>

                        <div class="col-4 pulls-left">
                            <div class ='order-content-title'>
                                <span> `+ result[i].PropertyAddressLine1 + ` </span>
                                <span>Date `+ moment(result[i].Request.FromDate).format('YYYY-MM-DD') + ` to ` + moment(result[i].Request.ToDate).format('YYYY-MM-DD') + ` (` + days + ` days) </span>
                                <div class ='order-content-amenities'>
                                    `+ templateAmenities + `
                                </div>
                            </div>
                        </div>

                        <div class="col-2">
							<div class="border-grey box-content-status">
								<div class="box-status-icon `+ statusIcon +`"></div>
								<div class="box-description">
									`+ statusMessage +`
								</div>
							</div>
						</div>

                        <div class="col-3 pulls-left">
                            <div class ='order-content-action' data-id=`+ result[i].Request.ID +`>
                                <div class ='alert alert-warning'>You dont have any payment method, please input on your <a href='./my_payment.html'>payment method</a> menu</div>
                                `+ btnPayment +`
                                `+ btnCancel +`
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        element.booking_list_wrapper.append(template);

        //bookingListTrigger();
    };
    $('.order-header').on('click', function () {
        $(this).parent().toggleClass('order-wrapper-collapse');
    });

    $('.btn-payment').on('click', function () {
        var id = $(this).parent().data('id');
        doPay(id);
    });

    $('.btn-cancel').on('click', function () {
        var id = $(this).parent().data('id');
        doCancelRenter(id, $(this));
    });
};

function doPay(id) {
    console.log(id);
};

function doCancelRenter(id, elm) {
    var message = confirm('Are you sure want to cancel this booked rent?');

    if (message == true) {
        preload.show(elm.parents('.order-wrapper'))
        $.ajax({
            url: SITE.API_PATH_DEV + '/request/cancelbyrenter/'+id,
            type: 'DELETE',
            headers: {
                'Authorization': access_token
            },
            beforeSent: function () {
                preload.show(elm.parents('.order-wrapper'));
            },
            success: function (result) {
                //elm.parents('.order-wrapper').remove()
                getBookingList()
            },
            error: function (status) {
                floatAlert('Error delete your booking', 'error', function () { });
            }
        })
    }
};

/*  =========================================
 *   END BOOKING LIST FUNCTION
 *  =========================================
 */

/*  =========================================
 *   START STAY REQUEST FUNCTION
 *  =========================================
 */
$.extend(element, {
    stay_request_container: $('.stay-request-container'),
    request_preload: $('#request-preload'),
    request_list: $('.review-menu'),
    preview_request: $('.stay-wrapper'),

    user_info_name: $('#user-info-name'),
    user_info_address: $('#user-info-address'),
    user_info_email: $('#user-info-email'),
    user_info_phone: $('#user-info-phone'),

    site_info_address: $('#site-info-address'),
    site_info_address2: $('#site-info-address2'),
    site_info_fromdate: $('#site-info-fromdate'),
    site_info_todate: $('#site-info-todate'),
    site_price: $('#site-price'),
    site_price_total: $('#site-price-total'),
    site_total_billing: $('.total-billing'),

    btn_request_wrapper : $('.btn-wrapper'),
    btn_request_accept: $('.btn-request-accept'),
    btn_request_decline: $('.btn-request-decline'),
    btn_request_free: $('.btn-request-free'),
    request_id: $('#request-id'),

    box_status_icon : $('.box-status-icon'),
    box_status_message : $('.box-description')
});

function requestTabTrigger(){
    element.request_list.find('li').on('click', function () {
        tab_stay.prototype.click($(this));
        renderStayRequest($(this).index());
    });
};

var choosenRequest;

function getRequestList(status = 0) {
    element.request_list.empty();
    element.request_preload.addClass('show');
    element.preview_request.hide();
    var index;
    $.ajax({
        url: SITE.API_PATH_DEV+'/requests/getincoming/'+user_data.user_id+'/'+status,
        type: 'GET',
        headers: {
            'Authorization': access_token
        },
        beforeSent: function(){
            element.request_preload.show();
            element.request_preload.addClass('show');
        },
        success: function(result){
            if(result.length < 1){
                element.request_preload.find('.loader').empty();
                element.request_preload.find('.loader').html('<div>No Request Data</div>');
            }else{
                element.request_preload.removeClass('show');
                element.preview_request.show();
                console.log(result)

                for(var i = 0; i < result.length; i++){
                    var days = 0;
                    Object.keys(result[i].Request.RequestBillingItems).forEach(function(key){
                        if(result[i].Request.RequestBillingItems[key].BillingItemTypeID == 1){
                            days += 1;
                        }
                        result[i]['RequestDays'] = days;
                    })

                    var style = i == 0 && 'class=active';
                    var requestList = `
                    <li `+ style +` data-id=`+ result[i].Request.ID +`><div><span class="title">`+ result[i].RenterFirstName + ` ` + result[i].RenterLastName +`</span> 
                    <span>`+ moment(result[i].Request.FromDate).format('MM/DD/YYYY') +` to `+ moment(result[i].Request.ToDate).format('MM/DD/YYYY') +` (`+ days +` days)</span></div></li>
                `;

                    element.request_list.append(requestList);
                }

                choosenRequest = result;  

                renderStayRequest(index=0);

                requestTabTrigger()
            }
            
        },
        error: function(status){
            console.log(status)
        }
    });
};

var statusMessage='',
        statusIcon = '',
        btnAcceptFree = `<div class="col-3"><button class="btn-site small btn-request-free">Accept for Free Stay</button></div>`,
        btnAccept = `<div class="col-3 pulls-left"><button class="btn-site small btn-request-accept">Accept Request</button></div>`,
        btnDecline = `<div class="col-3 pulls-left"><button class="btn-site small btn-blue btn-request-decline">Decline Request</button></div>`,
        btnCancel = `<div class="col-3 pulls-left"><button class="btn-site small btn-blue btn-request-cancel">Cancel Request</button></div>`;

function renderStayRequest(index){

    statusMessage='';
    statusIcon = '';
    btnAcceptFree = `<div class="col-3"><button class="btn-site small btn-request-free">Accept for Free Stay</button></div>`;
    btnAccept = `<div class="col-3 pulls-left"><button class="btn-site small btn-request-accept">Accept Request</button></div>`;
    btnDecline = `<div class="col-3 pulls-left"><button class="btn-site small btn-blue btn-request-decline">Decline Request</button></div>`;
    btnCancel = `<div class="col-3 pulls-left"><button class="btn-site small btn-blue btn-request-cancel">Cancel Request</button></div>`;
    
    element.btn_request_wrapper.empty();
    var data = choosenRequest[index];
    element.request_id.val(data.Request.ID);
    //console.log(data)
    switch(data.Request.StatusTypeID){
        case CONSTANT.STATUS_SUBMITTED:
            console.log(btnAcceptFree + btnAccept + btnDecline + btnCancel)
            statusMessage = 'This request is awaiting your response';
            statusIcon = 'ds-book-submit';
            btnCancel = ``;
            break;
        case CONSTANT.STATUS_ACCEPTED:
            statusMessage = 'You have accepted this request. You are awaiting payment from customer';
            statusIcon = 'ds-review';
            btnAccept = ``;
            btnDecline = ``;
            break;
        case CONSTANT.STATUS_DECLINED:
            statusMessage = 'You have declined this request.<br>customer has been notified';
            statusIcon = 'ds-book-decline';
            btnAcceptFree = ``;
            btnAccept = ``;
            btnDecline =``;
            btnCancel = ``;
            break;
        case CONSTANT.STATUS_PAID:
            statusMessage = 'This request has been paid';
            statusIcon = 'ds-book-paid';
            btnAcceptFree = ``;
            btnAccept = ``;
            btnDecline =``;
            break;
        case CONSTANT.STATUS_FREE:
            statusMessage = 'This request has been granted';
            statusIcon = 'ds-book-free';
            btnAcceptFree = ``;
            btnAccept = ``;
            btnDecline =``;
            break;
        case CONSTANT.STATUS_CANCELLED_VISITOR:
            statusMessage = 'This request has been cancelled by the customer';
            statusIcon = 'ds-book-cancel';
            btnAcceptFree = ``;
            btnAccept = ``;
            btnDecline =``;
            btnCancel = ``;
            break;
        case CONSTANT.STATUS_CANCELLED_OWNER:
            statusMessage = 'You have cancelled this request';
            statusIcon = 'ds-book-cancel';
            btnAcceptFree = ``;
            btnAccept = ``;
            btnDecline =``;
            btnCancel = ``;
            break;
        case CONSTANT.STATUS_CANCELLED_SYSTEM:
            statusMessage = 'System Administrator has cancelled this request';
            statusIcon = 'ds-book-cancel';
            btnAcceptFree = ``;
            btnAccept = ``;
            btnDecline =``;
            btnCancel = ``;
            break;
    }

    element.box_status_icon.addClass(statusIcon);
    element.box_status_icon.after().empty();
    element.box_status_icon.after('<h3>'+data.Request.StatusType.Description+'</h3>');
    element.box_status_message.html(statusMessage);
    element.btn_request_wrapper.append(btnAcceptFree + btnAccept + btnDecline + btnCancel);

    $('.row-facilities').remove();
    $('.order-content-amenities').empty();

    element.user_info_name.html(data.RenterFirstName + ' ' + data.RenterLastName);
    element.user_info_address.html(data.RenterPostalCode + ' ' + data.RenterCity + ', '+ data.RenterState);
    element.user_info_email.html(data.RenterEmailAddress);
    element.user_info_phone.html('XXX XXXX XXXX');

    element.site_info_address.html(data.PropertyAddressLine1);
    element.site_info_fromdate.html(moment(data.Request.FromDate).format('MM/DD/YYYY'));
    element.site_info_todate.html(moment(data.Request.ToDate).format('MM/DD/YYYY'));

    var days = 0;
    var dailyRate = 0;
    var totalRate = 0;
    var facilityRate = 0;
    var templateAmenities = '';
    var templateFacilities = '';
    var countAmenities = 0;
    countAmenities = _.countBy(data.Request.RequestBillingItems, function(num){
        //return num.BillingItemTypeID;
        return num.BillingItemTypeID == 2 ? 'amenities' : 'non_amenities';
    })

    if(!countAmenities.amenities){
        templateFacilities += `
                <div class="row row-facilities">
                    <div class="title">
                        <div class="has-facilities"><div class="ds"></div><div>No Additional Amenities</div></div>
                    </div>
                    <div class="price"></div>
                </div>
            `;
    }
    console.log(countAmenities)
    Object.keys(data.Request.RequestBillingItems).forEach(function (key) {
        
        if (data.Request.RequestBillingItems[key].BillingItemTypeID == 1) {
            dailyRate += data.Request.RequestBillingItems[key].Amount;
            days += 1;
            /*templateAmenities += `<div>No additional Amenities</div>`;
            templateFacilities += `
                    <div class="row row-facilities">
                        <div class="title">
                            <div class="has-facilities"><div>No Additional Amenities</div></div>
                        </div>
                        <div class="price">$ 0.00</div>
                    </div>
                `;*/
        } else {
            facilityRate += days * data.Request.RequestBillingItems[key].Amount;
            templateAmenities += `<div><div class=ds-bathroom></div><div>` + data.Request.RequestBillingItems[key].Description + `</div></div>`;
            templateFacilities += `
                <div class="row row-facilities">
                    <div class="title">
                        <div class="has-facilities"><div class="ds-wifi"></div><div>`+ data.Request.RequestBillingItems[key].Description +`</div></div>
                    </div>
                    <div class="price">$ `+ days * data.Request.RequestBillingItems[key].Amount +`.00</div>
                </div>
            `;
        };
    });
    totalRate = dailyRate + facilityRate;

    $('.order-content-amenities').append(templateAmenities);

    //console.log(days, totalRate)
    element.site_info_address2.html(data.PropertyAddressLine1 +'<br/>'+ moment(data.Request.FromDate).format('MM/DD/YYYY') + ' to ' + moment(data.Request.ToDate).format('MM/DD/YYYY') + '( '+days+' days )');
    element.site_price.html('$ '+dailyRate+'.00');
    element.site_price_total.html('$ '+totalRate+'.00');
    element.site_total_billing.before(templateFacilities)

    $('.btn-request-free').on('click', function(){
        requestAcceptFree();
    });

    $('.btn-request-accept').on('click', function(){
        requestAccept();
    });

    $('.btn-request-decline').on('click', function(){
        requestDecline();
    });

    $('.btn-request-cancel').on('click', function(){
        requestCancel();
    });
};


function requestAccept(){
    preload.show(element.stay_request_container)
    var id = element.request_id.val();
    //console.log(statusMessage);
    //getRequestList()
    $(this).prop('disabled', true);
    $.ajax({
        url: SITE.API_PATH_DEV+'/request/accept/'+id,
        type: 'POST',
        headers: {
            'Authorization': access_token
        },
        beforeSent: function(){

        },
        success: function(result){
            console.log(result);
            $(this).prop('disabled', false);
            DS_MODAL.open({
                status : 'confirm-success',
                image : './assets/images/success.svg',
                message : 'You have accepted this request. You are awaiting payment from customer',
                close: {
                    timeout : 4000
                }
            })
            preload.remove(element.stay_request_container)
            getRequestList()
        },
        error: function(status){
            console.log('error', status);
            $(this).prop('disabled', false);
            floatAlert('Error accepting request', 'error', function(){});
            preload.remove(element.stay_request_container)
        }
    })
};

function requestDecline(){
    var message = confirm("Are you sure you want to decline this request? ");
    preload.show(element.stay_request_container)
    var id = element.request_id.val();
    if(message == true){
        $(this).prop('disabled', true);
        $.ajax({
            url: SITE.API_PATH_DEV+'/request/decline/'+id,
            type: 'DELETE',
            headers: {
                'Authorization': access_token
            },
            beforeSent: function(){

            },
            success: function(result){
                console.log(result);
                $(this).prop('disabled', false);
                preload.remove(element.stay_request_container)
                getRequestList()

                DS_MODAL.open({
                    status : 'confirm-success',
                    image : './assets/images/success.svg',
                    message : 'You have declined this request. <br> Customer has been notified.',
                    close: {
                        timeout : 4000
                    }
                })
            },
            error: function(status){
                console.log('error', status);
                $(this).prop('disabled', false);
                floatAlert('Error decline request', 'error', function(){});
                preload.remove(element.stay_request_container)
            }
        })
    }
}

function requestAcceptFree(){
    
    preload.show(element.stay_request_container)
    var id = element.request_id.val();
    $(this).prop('disabled', true);
    $.ajax({
        url: SITE.API_PATH_DEV+'/request/acceptforfree/'+id,
        type: 'POST',
        headers: {
            'Authorization': access_token
        },
        beforeSent: function(){

        },
        success: function(result){
            console.log(result);
            $(this).prop('disabled', false);
            preload.remove(element.stay_request_container);
            getRequestList()

            DS_MODAL.open({
                status : 'confirm-success',
                image : './assets/images/success.svg',
                message : 'This request has been granted.',
                close: {
                    timeout : 4000
                }
            })
        },
        error: function(status){
            console.log('error', status);
            $(this).prop('disabled', false);
            floatAlert('Error accepting request for free', 'error', function(){});
            preload.remove(element.stay_request_container);
        }
    })
}

function requestCancel(){
    var id = element.request_id.val();
    DS_MODAL.open({
        status : 'confirm-delete',
        image : './assets/images/attention.svg',
        message : 'Are you sure want to cancel this request.'
    }, function(res){
        if(res){
            $.ajax({
                url: SITE.API_PATH_DEV+'/request/cancelbyowner/'+id,
                type: 'DELETE',
                headers: {
                    'Authorization': access_token
                },
                beforeSent: function(){

                },
                success: function(result){
                    console.log(result);
                    $(this).prop('disabled', false);
                    preload.remove(element.stay_request_container);
                    getRequestList()

                    DS_MODAL.open({
                        status : 'confirm-success',
                        image : './assets/images/success.svg',
                        message : 'You have cancelled this request.',
                        close: {
                            timeout : 4000
                        }
                    })
                },
                error: function(status){
                    console.log('error', status);
                    $(this).prop('disabled', false);
                    floatAlert('Error canceling request for free', 'error', function(){});
                    preload.remove(element.stay_request_container);
                }
            })
        }
    })
    // var message = confirm("Are you sure you want to cancel this request? ");
    // preload.show(element.stay_request_container)
    // $(this).prop('disabled', true);

    // if(message == true){
        
    // }
    
}

/*  =========================================
 *   END STAY REQUEST FUNCTION
 *  =========================================
 */