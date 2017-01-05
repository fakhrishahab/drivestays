
var SITE = {
    API_KEY: 'AIzaSyDfSvkBOL2nOfLZKDWaf66EbbO9poShFaA',
    API_PATH: 'https://travellers.azurewebsites.net/api',
    API_PATH_DEV: 'http://localhost:58777/api'
}

var CONSTANT = {
    STATUS_SUBMITTED: 1,
    STATUS_ACCEPTED: 2,
    STATUS_DECLINED: 3,
    STATUS_PAID: 4,
    STATUS_FREE: 5,
    STATUS_CANCELLED_VISITOR: 7,
    STATUS_CANCELLED_OWNER: 8,
    STATUS_CANCELLED_SYSTEM: 9
}
var access_token = _cookies.get('DS');
console.log('access token', access_token)
$(document).ready(function () {
    $('.scrollbar-macosx').scrollbar();


    // var user_info = window.customer ? window.customer : '';
    var user_info = _cookies.get('ASP.NET_SessionId ');
    console.log(window.cookie)
    var profile_username = $('#profile-username'),
        btn_logout = $('#btn-logout');


    if (access_token) {
        profile_username.html(user_info.FirstName);
        //$('.btn-register').parent().addClass('hide');
        //$('.user-wrapper').addClass('show');

        //if(localStorage.getItem('photo')){
        //  $('.user-wrapper').find('img').attr('src', localStorage.getItem('photo'))
        //  $('#upload-img').find('img').attr('src', localStorage.getItem('photo')) 
        //}

     }else{
        $('.btn-register').parent().removeClass('hide');
        $('.user-wrapper').removeClass('show');
     }

    btn_logout.on('click', function () {
        _cookies.delete('reg_cookies');
        window.location.href = "index.html";
    })
})

var dsModal = new Function();

$.extend(dsModal.prototype, {
    open: function (target) {
        $('#' + target).removeClass('hide');
    },
    closeAll: function () {
        $('.modal').addClass('hide');
    }
})
$('#open-modal').on('click', function () {
    var target = $(this).data('target');
    $('#' + target).removeClass('hide')
})

$('.ds-close').on('click', function () {
    $(this).parents('.modal').addClass('hide')
})

function floatAlert(content, type, fn) {
    var func = function () { }
    $('.float-alert').find('.content').html(content);
    $('.float-alert').addClass(type).addClass('active');
    setTimeout(function () {
        $('.float-alert').removeClass('active');
        fn('ok')
    }, 5000);
}

$('.close-alert').on('click', function () {
    $(this).parent().removeClass('active');
})


var preload = new Function();

$.extend(preload, {
    show: function (elm, color) {
        var preloadTemplate = `
			<div class="reload-search show `+color+`" style="height:`+ elm.height() + `px">
				<div class="loader loader--style4" title="3">
				  	<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="44px" viewBox="0 0 24 24" style="enable-background:new 0 0 50 50;" xml:space="preserve">
				    	<rect x="0" y="0" width="4" height="7" fill="#333">
				      		<animateTransform  attributeType="xml" attributeName="transform" type="scale" values="1,1; 1,3; 1,1" begin="0s" dur="0.6s" repeatCount="indefinite" />
				    	</rect>

				    	<rect x="10" y="0" width="4" height="7" fill="#333">
				      		<animateTransform  attributeType="xml" attributeName="transform" type="scale" values="1,1; 1,3; 1,1" begin="0.2s" dur="0.6s" repeatCount="indefinite" />
				      	</rect>

				    	<rect x="20" y="0" width="4" height="7" fill="#333">
				      		<animateTransform  attributeType="xml" attributeName="transform" type="scale" values="1,1; 1,3; 1,1" begin="0.4s" dur="0.6s" repeatCount="indefinite" />
				      	</rect>
				  	</svg>
				</div>
			</div>
		`;
        elm.prepend(preloadTemplate);
    },
    remove: function (elm) {
        elm.find('.reload-search').remove();
        elm.find('.reload-search').hide();
    }
});


function param(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ajaxError(function (event, jqxhr, settings, thrownError) {
    console.log(jqxhr.status);
    if (jqxhr.status == 401) {
        floatAlert('You must Login first for running this action', 'error', function () {
            //window.location.href = './Auth/login';
        });
        //window.location.href = './';
    }

})

function alertInfo(option, elm) {
    //console.log(elm)
    console.log(option)
    elm.show();
    if (option.status && option.status == 'error') {
        elm.addClass('error');
    }
    switch (option.type) {
        case 'html':
            elm.append(option.desc)
            break;
        case 'text':
            elm.html(option.desc)
            break;
    }
}

$.extend(alertInfo, {
    close: function (elm) {
        elm.removeClass('error');
        elm.empty();
        elm.hide();
    }
})

var helpers = {
    limitWord: function (text, length) {
        var words = text.split(/\b[\s,\.-:;]*/);

        if(words.length > length){
            words.splice(length);
            return words.join(" ");
        } else {
            return words;
        }
    }
}