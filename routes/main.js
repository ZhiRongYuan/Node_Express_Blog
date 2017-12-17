var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var Content = require('../models/content');

var data = {};
router.use(function (req, res, next) {
    data = {
        userinfo: req.userinfo,
        categories: []
    }

    //读取所有分类信息
    Category.find().then(function (categories) {
        data.categories = categories;
        next()
    })
})

router.get('/', function (req, res, next) {
    data.category=req.query.category || '';
    data.page = Number(req.query.page || 1);
    data.count = 0;
    data.limit = 10;
    data.pages = 0;

    var where={};
    if (data.category) {
        where.category = data.category;
    }

    Content.where(where).count().then(function (count) {
        data.count = count;

        //总页数
        data.pages =Math.ceil(data.count / data.limit);
        //页码不能超过总页数
        data.page = Math.min(data.page, data.pages);
        //页码不能小于1
        data.page = Math.max(data.page, 1);

        var skip = (data.page - 1) * data.limit; //忽略条数

        /*
        -1:降序
        1： 升序
         */
        return Content.where(where).find().sort({addTime: -1 }).limit(data.limit).skip(skip).populate(['category', 'user']);

    }).then(function (contents) {
        data.contents = contents;
        res.render('main/index.html', data);
    })
})

router.get('/view', function (req, res, next) {
    const contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function (content){
        data.content = content;
        content.views++;
        content.save(); //增加阅读数
        res.render('main/view.html', data);
    })
})

module.exports= router;