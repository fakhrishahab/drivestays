var element = {
	image_container : $('.image-uploaded'),
	trigger_upload : $('.upload-container'),
	file_upload : $('#file-upload'),
	btn_crop : $('#btn-crop')
}

element.trigger_upload.on('click', function(){
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

element.file_upload.on('change',function(){
	dsModal.prototype.open('modal-upload')
	readFile(this)
})

element.btn_crop.on('click', function(ev){
	$uploadCrop.croppie('result', {
		type: 'canvas',
		size: 'viewport'
	}).then(function (resp) {
		appendImage(resp)
		dsModal.prototype.closeAll();
	});
})

function appendImage(file){
	var temp = '<div class="img-thumb" style="background:url('+file+')"><div class="ds-delete"></div></div>';
	element.image_container.append(temp);

	$('.ds-delete').on('click', function(){
		$(this).parent('.img-thumb').remove()
	})
}