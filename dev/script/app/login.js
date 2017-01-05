'use strict';

$(document).ready(function () {
    var obj = {
        btn_register: $('#btn-register'),
        form_register: 'form-register',
        form_login : 'form-login',
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

    function post(path, params, method) {
        method = method || "post"; // Set method to post by default if not specified.

        // The rest of this code assumes you are not using a library.
        // It can be made less wordy if you use one.
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", path);

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);

                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    }

    obj.btn_login.on('click', function () {
        var self = $(this);
        var credentials = {}
        if ($(this).validation(obj.form_login) == undefined) {
            obj.alertMsgLogin.show();
            alertInfo({
                'type': 'html',
                'desc': '<img src=/assets/images/loading.svg style="width:40px;margin:0 auto">'
            }, $('.alert-msg-login'));

            $.ajax({
                type : 'get',
                url : SITE.API_PATH_DEV+'/credentials?Email='+obj.login_username.val()+'&Password='+obj.login_password.val(),
                success: function (resp) {
                    if (param('ReturnUrl')) {
                        credentials = {
                            Email: obj.login_username.val(),
                            Password: obj.login_password.val(),
                            ReturnUrl: param('ReturnUrl')
                        }
                    }else{
                        credentials = {
                            Email: obj.login_username.val(),
                            Password: obj.login_password.val()
                        }
                    }

                    doLogin(credentials);
                    // post('./', credentials);
                },
                error: function (err) {
                    alertInfo.close(obj.alertMsgLogin);
                    obj.alertLogin.show();
                    obj.alertLogin.addClass('error');

                    alertInfo({
                        'type': 'text',
                        'desc': 'Email and Password combination does not exist!'
                    }, obj.alertLogin);
                }
            })

            //$('#auth-login').submit();
        //$.ajax({
        //    url: SITE.API_PATH_DEV+ '/customer/getbyemail?email=' + obj.login_username.val(),
        //    type: 'get',
        //    beforeSend: function () {
        //        obj.alertMsgLogin.show();
        //        alertInfo({
        //            'type': 'html',
        //            'desc': '<img src=/assets/images/loading.svg style="width:40px;margin:0 auto">'
        //        }, $('.alert-msg-login'))
        //    },
        //    success: function (result) {
        //        console.log(result)
        //        if (result != null) {
        //            var user_data = {
        //                'firstname': result.FirstName,
        //                'lastname': result.LastName,
        //                'email': result.EmailAddress,
        //                'password': '1234',
        //                'user_id': result.ID,
        //                'vehicle': result.Vehicles ? result.Vehicles[0].id : null
        //            };

        //            _localStorage.put('user_data', user_data);
        //            window.location.href = './';
        //        } else {
        //            floatAlert('username is not exist ', 'error', function () { });
        //        }
        //        alertInfo.close($('.alert-msg-login'))
        //    },
        //    error: function (status) {
        //        floatalert('error login ' + status.status, 'error', function () { })
        //        alertinfo.close($('.alert-msg-login'))
        //    }
        //})
        } else {
            return;
        }
        
        // 
    })

    function doLogin(credentials){
        $.ajax({
            url: SITE.API_PATH_DEV+'/login?email='+credentials.Email+'&password='+credentials.Password,
            type: 'GET',
            success: function(result){
                console.log(result)
                _cookies.put('DS', result.Auth_Token)
            },
            error: function(resp){
                console.log(resp)
            }
        })
    }

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
