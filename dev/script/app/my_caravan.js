var element = {
    image_container: $('.image-uploaded'),
    trigger_upload: $('.upload-container'),
    file_upload: $('#file-upload'),
    btn_crop: $('#btn-crop'),

    vehicle_id: $('#vehicle-id'),
    vehicle_type: $('#vehicle-type'),
    vehicle_selected: $('#vehicle-select'),
    vehicle_type_select: $('#vehicle-type-select'),
    vehicle_type_list: $('#vehicle-type-select li'),
    vehicle_brand: $('#vehicle-brand'),
    vehicle_year: $('#vehicle-year'),
    vehicle_width: $('#vehicle-width'),
    vehicle_length: $('#vehicle-length'),
    vehicle_height: $('#vehicle-height'),
    vehicle_plate: $('#vehicle-plate'),
    vehicle_expiry: $('#vehicle-expiry'),
    btn_save_vehicle: $('.btn-save-vehicle'),
    vehicle_body: $('.vehicle-body'),

    btn_add_caravan: $('.btn-add-caravan'),
    form_add_caravan: $('#caravan-form')
};

element.btn_add_caravan.on('click', function () {
    element.form_add_caravan.fadeToggle();
})

var exp_date = new Pikaday({
    field: document.getElementById('vehicle-expiry'),
    format: 'YYYY-MM-DD'
})

var user_id = _localStorage.get('user_data').user_id;

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
        };

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
});

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

    $('.ds-delete').on('click', function () {
        $(this).parent('.img-thumb').remove();
    });
};



/*  =========================================
 *   START VEHICLE TAB BLOCK FUNCTION
 *  =========================================
 */
getVehicleList()
function getVehicleList() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/vehicles/get/' + user_id,
        type: 'get',
        beforeSend: function () {
            var template = `
                    <tr>
                        <td colspan=6>
                            <center><object type="image/svg+xml" data="./assets/images/loading.svg" class ="logo">
                              Drivestays
                            </object></center>
                        </td>
                    </tr>
                `;
            element.vehicle_body.append(template)
        },
        success: function (result) {
            console.log(result)
            element.vehicle_body.empty();
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var template = `
                            <tr data-id= `+ result[i].ID + ` >
                                <td> `+ parseInt(i + 1) + ` </td>
                                <td> `+ result[i].Make + ` </td>
                                <td> `+ result[i].Year + ` </td>
                                <td>width: `+ result[i].Width+` cm <br> length: `+ result[i].Length +` cm <br> height: `+ result[i].Height +` cm</td>
                                <td>`+ result[i].License +`</td>
                                <td class ="action">
                                    <button class ='edit-vehicle' data-id= `+ result[i].ID + ` >
                                        <div class ="ds-edit"></div> <span>Edit</span>
                                    </button>
                                    <button class ='delete-vehicle' data-id= `+ result[i].ID + ` >
                                        <div class ="ds-delete"></div> <span>Delete</span>
                                    </button>
                                </td>
                            </tr>
                        `;

                    element.vehicle_body.append(template);
                }

                $('.edit-vehicle').on('click', function () {
                    element.btn_save_vehicle.attr('data-type', 'update');
                    var id = $(this).data('id');
                    getDetailVehicle(id)
                })

                $('.delete-vehicle').on('click', function () {
                    var id = $(this).data('id');
                    confirmDelete(id, $(this));
                })
            } else {
                var template = `
                        <tr class="row-null">
                            <td colspan=6>
                                <center>No Data</center>
                            </td>
                        </tr>
                    `;
                element.vehicle_body.append(template)
            }
        },
        error: function (status) {

        }
    })
};

function confirmDelete(id, elm) {
    var message = confirm('Are you sure want to delete this data?');

    if (message == true) {
        deleteVehicle(id, elm)
    }
}

function deleteVehicle(id, elm) {
    $.ajax({
        url: SITE.API_PATH_DEV + '/vehicle/delete/' + id,
        type: 'delete',
        success: function (result) {
            elm.parents('tr').remove()
            floatAlert('Data successfully deleted', 'success', function () { })
        },
        error: function (status) {

        }
    })
}

function getDetailVehicle(id) {
    $.ajax({
        url: SITE.API_PATH_DEV + '/vehicle/get/' + id,
        type: 'get',
        success: function (result) {
            console.log(result);
            element.vehicle_type_select.find('li[value=' + result.VehicleTypeID + ']').click();
            element.vehicle_brand.val(result.Make);
            element.vehicle_year.val(result.Year);
            element.vehicle_width.val(result.Width);
            element.vehicle_length.val(result.Length);
            element.vehicle_height.val(result.Height);
            element.vehicle_plate.val(result.License);
            element.vehicle_expiry.val(moment(result.LicenseExpiry).format('YYYY-MM-DD'));
            element.vehicle_id.val(result.ID);
        },
        error: function (status) {
            console.log(status)
        }
    })
}
getVehicleType()
function getVehicleType() {
    $.ajax({
        url: SITE.API_PATH_DEV + '/vehicleTypes/get',
        type: 'get',
        success: function (result) {
            element.vehicle_type_select.parent().removeClass('disable');

            for (var i = 0; i < result.length; i++) {
                var template = `
                        <li value=`+ result[i].ID + `>` + result[i].Description + `</li>
                    `;
                element.vehicle_type_select.append(template)
            }
            listTrigger()
        },
        error: function (status) {

        }
    })
}

element.btn_save_vehicle.on('click', function () {
    var type = $(this).data('type'),
        dataVehicle, api_url;

    switch (type) {
        case 'add':
            api_url = SITE.API_PATH_DEV + '/vehicle/save';
            dataVehicle = {
                //'ID' : '',
                'Make': element.vehicle_brand.val(),
                'Year': parseInt(element.vehicle_year.val()),
                'Width': parseFloat(element.vehicle_width.val()),
                'Length': parseFloat(element.vehicle_length.val()),
                'Height': parseFloat(element.vehicle_height.val()),
                'License': element.vehicle_plate.val(),
                'LicenseExpiry': element.vehicle_expiry.val(),
                'Kitchen': 0,
                'Shower': 0,
                'Toilet': 0,
                'Memo': 'tes',
                'CustomerID': parseInt(user_id),
                'VehicleTypeID': parseInt(element.vehicle_type.val())
            }
            break;
        case 'update':
            api_url = SITE.API_PATH_DEV + '/vehicle/update';
            dataVehicle = {
                'ID': element.vehicle_id.val(),
                'Make': element.vehicle_brand.val(),
                'Year': parseInt(element.vehicle_year.val()),
                'Width': parseFloat(element.vehicle_width.val()),
                'Length': parseFloat(element.vehicle_length.val()),
                'Height': parseFloat(element.vehicle_height.val()),
                'License': element.vehicle_plate.val(),
                'LicenseExpiry': element.vehicle_expiry.val(),
                'Kitchen': 0,
                'Shower': 0,
                'Toilet': 0,
                'Memo': 'tes',
                'CustomerID': parseInt(user_id),
                'VehicleTypeID': parseInt(element.vehicle_type.val())
            };
            break;
    }
    //console.log(dataVehicle)
    $.ajax({
        url: api_url,
        type: 'post',
        data: JSON.stringify(dataVehicle),
        contentType: 'application/json',
        dataType: 'json',
        success: function (result) {
            if (type == 'add') {
                var row_length = element.vehicle_body.find('tr').not('.row-null').length;
                element.vehicle_body.find('.row-null').remove();
                var template = `
                    <tr data-id=`+ result + `>
                        <td>`+ parseInt(row_length + 1) + `</td>
                        <td> `+ element.vehicle_brand.val() + ` </td>
                        <td> `+ element.vehicle_year.val() + ` </td>
                        <td>width: `+ element.vehicle_width.val() +` cm <br> length: `+ element.vehicle_length.val() +` cm <br> height: `+ element.vehicle_height.val() +` cm</td>
                        <td> `+ element.vehicle_plate.val() + ` </td>
                        <td class ="action">
                            <button class='edit-vehicle' data-id=`+ result + `>
                                <div class ="ds-edit"></div> <span>Edit</span>
                            </button>
                            <button class ='delete-vehicle' data-id= `+ result + ` >
                                <div class ="ds-delete"></div> <span>Delete</span>
                            </button>
                        </td>
                    </tr>
                `;

                element.vehicle_body.append(template);

                floatAlert('Data Successfully Saved', 'success', function () { })
            } else if (type == 'update') {
                var row = element.vehicle_body.find('tr[data-id=' + element.vehicle_id.val() + ']');
                row.find('td:eq(1)').html(element.vehicle_brand.val());
                row.find('td:eq(2)').html(element.vehicle_year.val());
                row.find('td:eq(3)').html('width: ' + element.vehicle_width.val() + ' cm <br> Length: ' + element.vehicle_length.val() + ' cm <br> Height: ' + element.vehicle_height.val()+ ' cm');
                row.find('td:eq(4)').html(element.vehicle_plate.val());
                element.btn_save_vehicle.attr('type', 'add');
                floatAlert('Data Successfully Updated', 'success', function () { })
            }

            $('.edit-vehicle').on('click', function () {
                element.btn_save_vehicle.attr('data-type', 'update');
                var id = $(this).data('id');
                getDetailvehicle(id)
            })

            $('.delete-vehicle').on('click', function () {
                var id = $(this).data('id');
                confirmDelete(id, $(this));
            })

            element.form_add_caravan.fadeToggle();

            resetForm()

        },
        error: function (status) {
            console.log(status)
            floatAlert('Error saving data', 'error', function () { })
        }
    })
})

function resetForm() {
    element.vehicle_id.val('');
    element.vehicle_type.val('');
    element.vehicle_brand.val('');
    element.vehicle_year.val('');
    element.vehicle_width.val('');
    element.vehicle_length.val('');
    element.vehicle_height.val('');
    element.vehicle_plate.val('');
    element.vehicle_expiry.val('');
    element.btn_save_vehicle.attr('type', 'add');
}

/*  =========================================
 *   END VEHICLE TAB BLOCK FUNCTION
 *  =========================================
 */