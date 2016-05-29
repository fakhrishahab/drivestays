
var SITE = {
	API_KEY : 'AIzaSyDfSvkBOL2nOfLZKDWaf66EbbO9poShFaA',
	API_PATH : 'http://travellers.azurewebsites.net',
	API_PATH_DEV : 'http://localhost:58777'
}

$(document).ready(function(){
	var user_info = _cookies.getObject('reg_cookies');
	var profile_username = $('#profile-username'),
		btn_logout = $('#btn-logout');
	

	// if(user_info){
	// 	profile_username.html(user_info.firstname)
	// 	$('.btn-register').parent().addClass('display-none')
	// 	$('.user-wrapper').addClass('show')

	// 	if(localStorage.getItem('photo')){
	// 		$('.user-wrapper').find('img').attr('src', localStorage.getItem('photo'))
	// 		$('#upload-img').find('img').attr('src', localStorage.getItem('photo'))	
	// 	}
		
	// }else{
	// 	$('.btn-register').parent().removeClass('display-none')
	// 	$('.user-wrapper').removeClass('show')
	// }

	btn_logout.on('click', function(){
		_cookies.delete('reg_cookies');
		window.location.href="index.html";
	})
})

var dsModal = new Function();

$.extend(dsModal.prototype,{
	open : function(target){
		$('#'+target).removeClass('hide');
	},
	closeAll: function(){
		$('.modal').addClass('hide');
	}
})
$('#open-modal').on('click', function(){
	var target = $(this).data('target');
	$('#'+target).removeClass('hide')
})

$('.ds-close').on('click', function(){
	$(this).parents('.modal').addClass('hide')	
})

function floatAlert(content, fn){
	var func = function(){}
	$('.float-alert').find('.content').html(content);
	$('.float-alert').addClass('success').addClass('active');
    setTimeout(function(){
        $('.float-alert').removeClass('active');
        fn('ok')
    },4000);
}

$('.close-alert').on('click', function(){
	$(this).parent().removeClass('active');
})