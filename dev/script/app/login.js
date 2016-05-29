'use strict';

$(document).ready(function() {
	var obj = {
		btn_register : $('#btn-register'),
		form_register : 'form-register',
		regType : $('#user-type'),
		regFirstname : $('#register-firstname'),
		regLastname : $('#register-lastname'),
		regEmail : $('#register-email'),
		regPassword : $('#register-password'),
		alertMsg : $('.alert-msg')
	}

	obj.btn_register.on('click', function(){
		var data_register = {
			'user_type' : obj.regType.val(),
			'firstname' : obj.regFirstname.val(),
			'lastname' : obj.regLastname.val(),
			'email' : obj.regEmail.val(),
			'password' : obj.regPassword.val()
		}

		// AFTER VALIDATION
		if($(this).validation(obj.form_register) == undefined){
			_localStorage.put('user_data', data_register)
			checkEmail(function(result){
				if(result){
					saveAccount()
				}
			})
		}
		
	})	

	function checkEmail(output){
		if(obj.alertMsg){
			obj.alertMsg.hide()
		}
		var status;
		$.ajax({
			url : SITE.API_PATH+'/customer/validateEmail?email='+obj.regEmail.val(),
			type : 'GET',
			beforeSend: function(){
				obj.alertMsg.show();
				alertInfo({
					'type' : 'html',
					'desc' : '<img src=./assets/images/loading.svg>'
				})
			},
			success: function(result, status){
				status = true;
				output(true);

				obj.alertMsg.hide()
			},
			error: function(result, status){
				status = false;
				obj.alertMsg.empty()
				obj.alertMsg.show();
				obj.alertMsg.addClass('error');
				switch(result.status){
					case 409 : 
						alertInfo({
							'type' : 'text',
							'desc' : 'Email is already exist, please login with this email account' 
						})
						obj.regEmail.focus();
						break;
				}
			}
		})
	}

	function alertInfo(option){
		switch(option.type){
			case 'html' :
					obj.alertMsg.append(option.desc)
				break;
			case 'text' : 
					obj.alertMsg.html(option.desc)
				break;
		}
	}

	function saveAccount(){
		var dataSend = {
			'EmailAddress' : obj.regEmail.val(),
			'LastName' : obj.regLastname.val(),
			'FirstName' : obj.regFirstname.val(),
			'MiddleName' : '',
			'AddressLine1' : '',
			'AddressLine2' : '',
			'AddressLine3' : '',
			'PhoneNumber1' : '',
			'PhoneNumber2' : '',
			'City' : '',
			'State' : '',
			'PostalCode' : '',
			'Country' : '',
			'LicenseNumber' : '',
			'LicenseIssuingEntity' : '',
			'LicenseExpiry' : '',
			'Memo' : '',
			'Properties' : '',
			'Vehicle' : ''
		}

		var user_data = _localStorage.get('user_data');
		$.ajax({
			url : SITE.API_PATH+'/customer/save',
			type : 'POST',
			data : dataSend,
			beforeSend: function(){
				obj.alertMsg.show();
				alertInfo({
					'type' : 'html',
					'desc' : '<img src=./assets/images/loading.svg>'
				})
			},
			success: function(result){
				user_data.user_id = result;
				_localStorage.put('user_data', user_data)
				obj.alertMsg.hide()
				window.location.href='./register.html'
			},
			error: function(status){
				console.log('error', status)
				obj.alertMsg.empty()
				obj.alertMsg.show();
				obj.alertMsg.addClass('error');
				switch(result.status){
					case 409 : 
						alertInfo({
							'type' : 'text',
							'desc' : 'Conflict Data' 
						})
						obj.regEmail.focus();
						break;
					default : 
						alertInfo({
							'type' : 'text',
							'desc' : 'Unknown Error'
						})
						break;
				}
			}
		})
	}
});
