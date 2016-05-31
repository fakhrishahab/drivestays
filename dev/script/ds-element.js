'use strict';

var input_select = $('.input-select'),
	input_element = $('.input-el'),
    site_access_toggle = $('.input-toggle'),
    btn_logout = $('#btn-logout'),
    notification_trigger = $('.notification-trigger'),
key,listTrigger,
user_menu = $('.user-menu-trigger');

(function(){
	btn_logout.on('click', function(){
		_localStorage.delete('site_data')
		_localStorage.delete('user_data')
		window.location.href='./'
	})

	input_element.on('focus', function(){
		$(this).find('.error-label').remove()
	})

	input_element.click(function(e) {
		input_element.find('ul[class=active]').removeClass('active')
		$(this).find('ul').toggleClass('active')
		$(this).find('.error-label').remove()
		e.stopPropagation();
	});

	user_menu.on('click', function(e){
		$(this).siblings('ul').toggleClass('active');
		e.stopPropagation();
	})

	$('body').on('click', function(e){
		if(input_element.find('ul').hasClass('active')){
			input_element.find('ul').removeClass('active')
		}
		$('.user-menu').removeClass('active')
		$('.notification-wrapper').hide();
	})

	listTrigger = function(){
		$('li', input_element).on('click', function(e){	
			$(this).parent().siblings('.select-area').html('<div>'+$(this).html()+'</div>')
			$(this).parent().removeClass('active');
			$(this).parent().siblings('input').val($(this).val())
			$(this).addClass('selected').siblings('li').removeClass('selected')
			e.stopPropagation();
		})	
	}
	listTrigger()
	
	
	$('.toggle-menu').on('click', function(){
		$('.menu-wrapper').toggleClass('menu-wrapper-active')
		$('.toggle-menu').toggleClass('toggle-menu-active')
	})

	$('.select-area').keydown(function(e) {
		$(this).focus()
		key = e.keyCode;
		
		if(key == 13){//enter
			if($(this).siblings('ul').hasClass('active')){
				selectOption($(this))
			}else{
				$(this).siblings('ul').addClass('active')
			}
		}

		if(key==38){ //up
			var selected = $('.selected', $(this).parent());
			selected.removeClass('selected')
			if (selected.prev().length == 0) {
	            selected.siblings().last().addClass("selected");
	        } else {
	            selected.prev().addClass("selected");
	        }
		}

		if (key == 40) { // down			
			$(this).siblings('ul').addClass('active')
	        var selected = $(".selected", $(this).parent());
	        selected.removeClass('selected')

	        if (selected.next().length == 0) {
	            selected.siblings().first().addClass("selected");
	        } else {
	            selected.next().addClass("selected");
	        }
	    }
	    if(key!=9){
	    	e.preventDefault();	
	    }
	    
	});

	function selectOption(elm){
		var val = elm.siblings('ul').find('li.selected')
		elm.siblings('input').val(val.val())
		elm.html('<div>'+val.html()+'</div>')
		elm.siblings('ul').removeClass('active')
	}

	$('input[type!=checkbox], textarea, .select-area', $('.input-el')).on('focus ', function(){
		$(this).parents('.input-el').addClass('focus')
	})

	$('input, textarea, .select-area', $('.input-el')).on('blur ', function(){
		$(this).parents('.input-el').removeClass('focus')
	})
}())

$(window).load(function(){
	resize()
})

$(window).resize(function(event) {
	resize()
});

function resize(){
	var width = $(window).width();
	// console.log(width)
	if(width < 800){
		$('.menu-wrapper').insertBefore('.wrapper-body')
	}else{
		$('.menu-wrapper').insertAfter('.logo-wrapper')
	}
}

function check_user(){
	var user_data = _localStorage.get('user_data')
	if(user_data){
		$('.register-head').addClass('hide')
		$('.user-wrapper').addClass('show')
		$('#profile-username').html(user_data.firstname)
	}else{
		$('.register-head').removeClass('hide')
		$('.user-wrapper').removeClass('show')
	}
}

check_user()

site_access_toggle.on('click', function(){
  var value = $(this).data('toggle').split(',');
  $(this).find('input[type=checkbox]').click();
  var checked_stat = $(this).find('input[type=checkbox]').prop('checked');
  console.log(checked_stat)
  if(checked_stat === true){
      $(this).addClass('active')
      $(this).find('.toggle-status').html(value[1])
      $(this).find('input[type=checkbox]').val(1)
  }else{
      $(this).removeClass('active')
      $(this).find('.toggle-status').html(value[0])
      $(this).find('input[type=checkbox]').val(0)
  }
})

notification_trigger.on('click', function(e){
	$('.notification-wrapper').toggle();
	e.stopPropagation();
})

var checkToggle = function () {
    $('.input-toggle').each(function (item, value) {
        var value = $(this).find('input[type=checkbox]').val()
        console.log(value)
        if (value == 1 || value === 'true') {
            $(this).addClass('active')
        } else {
            $(this).removeClass('active')
        }
    });
};
