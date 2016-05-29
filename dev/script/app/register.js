'use strict';

var obj = {
	firstname : $('#profile-firstname'),
	middlename : $('#profile-middlename'),
	lastname  : $('#profile-lastname'),
	name : $('#profile-name'),
	phone1 : $('#profile-phone1'),
	phone2 : $('#profile-phone2'),
	license : $('#profile-license'),
	exp_date : $('#profile-expdate'),
	city : $('#profile-city'),
	state : $('#profile-state'),
	postal_code : $('#profile-postalcode'),
	address1 : $('#profile-address1'),
	address2 : $('#profile-address2'),
	address3 : $('#profile-address3'),
	btn_save : $('#save-profile'),
	upload_file : $('#file-upload'),
	upload_trigger : $('.upload-trigger'),
	btn_crop : $('#btn-crop')
}

var user_data = _localStorage.get('user_data');

if(user_data){
	obj.firstname.val(user_data.firstname);
	obj.lastname.val(user_data.lastname);
}

function get_user_data(){
	$.ajax({
		url: SITE.API_PATH+'/customer/get/'+user_data.user_id,
		type: 'GET',
		success: function(result){
			obj.firstname.val(result.FirstName)
			obj.middlename.val(result.MiddleName)
			obj.lastname.val(result.LastName)
			obj.phone1.val(result.PhoneNumber1)
			obj.phone2.val(result.PhoneNumber2)
			obj.license.val(result.LicenseNumber)
			obj.exp_date.val(result.LicenseExpiry)
			obj.city.val(result.City)
			obj.state.val(result.State)
			obj.postal_code.val(result.PostalCode)
			obj.address1.val(result.AddressLine1)
			obj.address2.val(result.AddressLine2)
			obj.address3.val(result.AddressLine3)
		},
		error: function(result){

		}
	})
}

get_user_data();


var exp_date = new Pikaday({
	field : document.getElementById('profile-expdate'),
	format : 'MM/DD/YYYY'
})

obj.btn_save.on('click', function(){
	if($(this).validation($(this).data('target-form')) == undefined){
		// window.location.href='./index.html';
		update_user()
	}
})

function update_user(){
	var dataReg = {
		'ID' : user_data.user_id,
		'EmailAddress' : user_data.email,
		'LastName' : obj.lastname.val(),
		'FirstName' : obj.firstname.val(),
		'MiddleName' : obj.middlename.val() || '',
		'AddressLine1' : obj.address1.val() || '',
		'AddressLine2' : obj.address2.val() || '',
		'AddressLine3' : obj.address3.val() || '',
		'PhoneNumber1' : obj.phone1.val() || '',
		'PhoneNumber2' : obj.phone2.val() || '',
		'City' : obj.city.val() || '',
		'State' : obj.state.val() || '',
		'PostalCode' : obj.postal_code.val() || '',
		'Country' : '',
		'LicenseNumber' : obj.license.val() || '',
		'LicenseIssuingEntity' : '',
		'LicenseExpiry' : obj.exp_date.val() || '',
		'Memo' : '',
		'Properties' : '',
		'Vehicle' : ''
	};
	// console.log(dataReg)		
	$.ajax({
   		url : SITE.API_PATH+'/customer/update',
   		type : 'POST',
   		data :  dataReg,
   		success:function(data){
   			user_data.firstname = dataReg.FirstName;
   			user_data.lastname = dataReg.LastName;
   			_localStorage.put('user_data', user_data)
	    	window.location.href="./"
	   	},
	   	error:function(status){
	    	console.log('error')
	   	}
  	})
}

$('.upload-trigger').on('click', function(){
	obj.upload_file.click()
	// $('#file-upload').click()
})

var $uploadCrop;

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
		type: 'circle'
	},
	boundary: {
		width: 300,
		height: 300
	},
	exif: true
});

obj.upload_file.on('change', function(){
	dsModal.prototype.open('modal-upload');
	readFile(this); 
})

obj.btn_crop.on('click', function(ev){
	$uploadCrop.croppie('result', {
		type: 'canvas',
		size: 'viewport'
	}).then(function (resp) {
		obj.upload_trigger.find('img').attr('src', resp)
		dsModal.prototype.closeAll();
		// popupResult({
		// 	src: resp
		// });
		// console.log(resp)
	});
})