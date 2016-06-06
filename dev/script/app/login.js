'use strict';

$(document).ready(function () {
    var obj = {
        btn_register: $('#btn-register'),
        form_register: 'form-register',
        regType: $('#user-type'),
        regFirstname: $('#register-firstname'),
        regLastname: $('#register-lastname'),
        regEmail: $('#register-email'),
        regPassword: $('#register-password'),
        alertMsg: $('.alert-msg'),
        alertMsgLogin: $('.alert-msg-login'),

        login_username: $('#login-username'),
        login_password: $('#login-password'),
        btn_login: $('.btn-login')
    }

    obj.btn_login.on('click', function () {
        $.ajax({
            url: SITE.API_PATH_DEV + '/customer/getbyemail?email=' + obj.login_username.val(),
            type: 'get',
            beforeSend: function () {
                obj.alertMsgLogin.show();
                alertInfo({
                    'type': 'html',
                    'desc': '<img src=./assets/images/loading.svg style="width:40px;margin:0 auto">'
                }, $('.alert-msg-login'))
            },
            success: function (result) {
                console.log(result)
                if (result != null) {
                    var user_data = {
                        'firstname': result.FirstName,
                        'lastname': result.LastName,
                        'email': result.EmailAddress,
                        'password': '1234',
                        'user_id': result.ID,
                        'vehicle' : result.Vehicles.length > 0 ? result.Vehicles[0].ID : null
                    };

                    _localStorage.put('user_data', user_data);
                    window.location.href = './'
                } else {
                    floatAlert('Username is not exist ', 'error', function () { });
                }
                alertInfo.close($('.alert-msg-login'))
            },
            error: function (status) {
                floatAlert('Error Login ' + status.status, 'error', function () { })
                alertInfo.close($('.alert-msg-login'))
            }
        })
    })

    obj.btn_register.on('click', function () {
        var data_register = {
            'user_type': obj.regType.val(),
            'firstname': obj.regFirstname.val(),
            'lastname': obj.regLastname.val(),
            'email': obj.regEmail.val(),
            'password': obj.regPassword.val()
        }

        // AFTER VALIDATION
        if ($(this).validation(obj.form_register) == undefined) {
            _localStorage.put('user_data', data_register)
            checkEmail(function (result) {
                if (result) {
                    saveAccount()
                }
            })
        }

    })

    function checkEmail(output) {
        if (obj.alertMsg) {
            obj.alertMsg.hide()
        }
        var status;
        $.ajax({
            url: SITE.API_PATH_DEV + '/customer/validateEmail?email=' + obj.regEmail.val(),
            type: 'GET',
            beforeSend: function () {
                obj.alertMsg.show();
                alertInfo({
                    'type': 'html',
                    'desc': '<img src=./assets/images/loading.svg style="width:40px;margin:0 auto">'
                }, $('.alert-msg'))
            },
            success: function (result, status) {
                status = true;
                output(true);

                alertInfo.close()
            },
            error: function (result, status) {
                status = false;
                obj.alertMsg.empty()
                obj.alertMsg.show();
                obj.alertMsg.addClass('error');
                switch (result.status) {
                    case 409:
                        alertInfo({
                            'type': 'text',
                            'desc': 'Email is already exist, please login with this email account'
                        }, $('.alert-msg'))
                        obj.regEmail.focus();
                        break;
                }
            }
        })
    }

    function alertInfo(option, elm) {
        console.log(elm)
        console.log(option)
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
            elm.empty();
            elm.hide();
        }
    })

    function saveAccount() {
        var dataSend = {
            'EmailAddress': obj.regEmail.val(),
            'LastName': obj.regLastname.val(),
            'FirstName': obj.regFirstname.val()
        }

        var user_data = _localStorage.get('user_data');
        $.ajax({
            url: SITE.API_PATH_DEV + '/customer/save',
            type: 'POST',
            data: dataSend,
            beforeSend: function () {
                obj.alertMsg.show();
                alertInfo({
                    'type': 'html',
                    'desc': '<img src=./assets/images/loading.svg style="width:40px;margin:0 auto">'
                }, $('.alert-msg'))
            },
            success: function (result) {
                user_data.user_id = result;
                _localStorage.put('user_data', user_data)
                obj.alertMsg.hide()
                window.location.href = './register.html'
            },
            error: function (status) {
                console.log('error', status)
                obj.alertMsg.empty()
                obj.alertMsg.show();
                obj.alertMsg.addClass('error');
                switch (result.status) {
                    case 409:
                        alertInfo({
                            'type': 'text',
                            'desc': 'Conflict Data'
                        }, $('.alert-msg'))
                        obj.regEmail.focus();
                        break;
                    default:
                        alertInfo({
                            'type': 'text',
                            'desc': 'Unknown Error'
                        }, $('.alert-msg'))
                        break;
                }
            }
        })
    }
});
