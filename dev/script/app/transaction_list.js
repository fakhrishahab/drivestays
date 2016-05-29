'use strict';

var element = {
	orderWrapper : $('.order-wrapper'),
	tab_trigger : $('.site-tab-wrapper div'),
	form_wrapper : $('.form-add-site'),
	target : {
		booking_list : $('#booking-list'),
		stay_request : $('#stay-request'),
		transaction_complete : $('#transaction-complete')
	},
	stay_tab_trigger : $('.review-menu li'),
	stay_wrapper : $('.stay-wrapper')
}

element.orderWrapper.on('click', function(){
	$(this).toggleClass('order-wrapper-collapse');
})

var tab_handler = new Function();

$.extend(tab_handler.prototype, {
	default: function(){
		tab_handler.prototype.hideAll()
		element.target.booking_list.show()
		// element.target.stay_request.show()
	},
	hideAll: function(){
		element.form_wrapper.hide()
	},
	click: function(elm){
		elm.addClass('active')
		elm.siblings('div').removeClass('active')
		var target = elm.data('target');
		tab_handler.prototype.hideAll()
		$('#'+target).show()
	}
})

tab_handler.prototype.default();
element.tab_trigger.on('click', function(){
	tab_handler.prototype.click($(this))
})

var tab_stay = new Function();

$.extend(tab_stay.prototype, {
	default: function(){
		tab_stay.prototype.hideAll()
	},
	hideAll: function(){
		element.stay_wrapper.hide()
	},
	click: function(elm){
		elm.addClass('active')
		elm.siblings('li').removeClass('active')
	}
})

element.stay_tab_trigger.on('click', function(){
	tab_stay.prototype.click($(this))
})