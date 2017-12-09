(function($) {
    $("registerForm").validate();
    let signupForm = $("registerForm");
    let formAlert = $("#form-alert");
    signupForm.submit(function(event){
        event.preventDefault();
        $("registerForm").validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password1: {
                    required: true,
                    minlength: 8
                },
                password2: {
                    required: true,
                    minlength: 8,
                    equalTo: "#password1"
                },
                nickname: {
                    required: true,
                }
            },
            messages: {
                email:  "Please enter a valid email",
                password1: {
                    required: "Please provide a password",
                    minlength: "Your password must be at least 5 characters long"
                },
                password2: {
                    required: "Please provide a password",
                    minlength: "Your password must be at least 5 characters long",
                    equalTo: "Please enter the same password as above"
                },
                nickname: {
                    required: "Please enter a nick name"
                }
            }
        });
        let email = $("#email").val().trim();
        let nickname = $("#nickname").val().trim();
        let password1 = $("#password1").val().trim();
        let password2= $("#password2").val().trim();
        if (!nickname||nickname===undefined) {
            $("#nickname").focus();
            formAlert.html('<strong>Oh snap! Need a nickname</strong>').show().fadeOut( 2000 );
            formAlert.removeClass('hidden');
            return;
        }
        if (!email||email===undefined||email.length<8) {
            $("#email").focus();
            formAlert.html('<strong>Oh snap! Need a email</strong>').show().fadeOut( 2000 );
            formAlert.removeClass('hidden');
            return;
        }
        if (!password1||password1===undefined||password1.length<8) {
            $("#password1").focus();
            formAlert.html('<strong>Oh snap! Need a password</strong>').show().fadeOut( 2000 );
            formAlert.removeClass('hidden');
            return;
        }
        if (!password2||password2===undefined) {
            $("#password2").focus();
            formAlert.html('<strong>Oh snap! Need repeat password</strong>').show().fadeOut( 2000 );
            formAlert.removeClass('hidden');
            return;
        }
        if (password1!=password2) {
            formAlert.html('<strong>Oh snap! The repeat password is different</strong>');
            $("#password2").focus();
            formAlert.removeClass('hidden');
            return;
        }
        let requestConfig = {
            method: "POST",
            url: "/register",
            contentType: 'application/json',
            data: JSON.stringify({
                nickname: $("#nickname").val(),
                password: $("#password1").val(),
                username:  $("#email").val()
            })
        };

        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status==="success"){
                window.location.href = '/login';
            }else{
                formAlert.text(responseMessage);
                formAlert.removeClass('hidden');
            }
        })
    })      

})(window.jQuery);