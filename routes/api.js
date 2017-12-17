var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Content = require('../models/content');


//统一返回格式
var responData;
router.use(function (req, res, next) {
    responData = {
        code: 0,
        message: ''
    }
    next();
})
router.post('/user/register', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if(username == '') {
        responData.code=1;
        responData.message='用户名不能为空';
        res.json(responData);
        return;
    }
    if(password == '') {
        responData.code=2;
        responData.message='密码不能为空';
        res.json(responData);
        return;
    }
    if(password !== repassword) {
        responData.code=3;
        responData.message='两次密码必须一致';
        res.json(responData);
        return;
    }

    //查找数据库 判断用户名是否已经被注册了
    User.findOne({
        username: username
    }).then(function (userinfo) {
        if(userinfo){
            responData.code=4;
            responData.message='此用户已注册';
            res.json(responData);
            return
        }

        var user =  new User({
            username: username,
            password: password
        });
        
        return user.save();
    }).then(function (newUserInfo) {
        responData.message='注册成功';
        res.json(responData);
    })

})




router.post('/user/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    if(username == '') {
        responData.code=1;
        responData.message='用户名不能为空';
        res.json(responData);
        return;
    }
    if(password == '') {
        responData.code=2;
        responData.message='密码不能为空';
        res.json(responData);
        return;
    }

    //查找数据库 判断用户名是否已经被注册了
    User.findOne({
        username: username,
        password: password
    }).then(function (userinfo) {
        if(!userinfo){
            responData.code=3;
            responData.message='该用户还没注册';
            res.json(responData);
            return
        }

        responData.message='登录成功';
        responData.userinfo = {
            id: userinfo._id,
            username: userinfo.username
        }
        req.cookies.set('userinfo', JSON.stringify({
            id: userinfo._id,
            username: userinfo.username
        }));
        res.json(responData);
        return;
    })

})



router.post('/user/logout', function (req, res, next) {
    req.cookies.set('userinfo', null);
    res.json(responData);
})


//获取所有评论
router.get('/comment', function (req, res, next) {
    const contentId = req.query.contentid || '';
    //查询当前文章的信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responData.message='查询成功';
        responData.data = content;
        res.json(responData);
    })
})

//提交评论
router.post('/comment/post', function (req, res, next) {
    //内容id
    const contentId = req.body.contentid || '';
    var params = {
        username: req.userinfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前文章的信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(params);
        return content.save();
    }).then(function (newComments) {
        responData.message='评论成功';
        responData.data = newComments;
        res.json(responData);
    })
})

module.exports= router;