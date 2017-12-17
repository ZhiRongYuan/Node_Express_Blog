$(function () {
    $('#loginBox').find('a').on('click', function () {
        $('#loginBox').hide();
        $('#registerBox').show();
    })


    $('#registerBox').find('a').on('click', function () {
        $('#loginBox').show();
        $('#registerBox').hide();
    })


    $('#registerBox').find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: 'api/user/register',
            data: {
                username: $('#registerBox').find("[name='username']").val(),
                password: $('#registerBox').find("[name='password']").val(),
                repassword: $('#registerBox').find("[name='repassword']").val()
            },
            dataType: 'json',
            success: function (result) {
                console.log(result);
                $('#messageShow').html(result.message);
                if(!result.code) {
                    setTimeout(function () {
                        $('#loginBox').show();
                        $('#registerBox').hide();
                    },1000)
                }
            }
        })
    })



    $('#loginBox').find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: 'api/user/login',
            data: {
                username: $('#loginBox').find("[name='username']").val(),
                password: $('#loginBox').find("[name='password']").val()
            },
            dataType: 'json',
            success: function (result) {
                $('#loginInfo').html(result.message);
                if(!result.code) {
                    setTimeout(function () {
                        //后端控制cookies 显示
                        // $('#loginBox').hide();
                        // $('#registerBox').hide();
                        // $('#userInfo').show();
                        // $('#userInfo').find('.username').html(result.userinfo.username);
                        // $('#userInfo').find('.info').html('欢迎登录')

                        //动态数据控制  直接刷新页面
                        window.location.reload()
                    },1000)
                }
            }
        })
    })



    $('#logout').on('click', function () {
        $.ajax({
            type: 'post',
            url: 'api/user/logout',
            success: function (result) {
                if(!result.code) {
                    window.location.reload()
                }
            }
        })
    })
})