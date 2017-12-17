var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Category = require('../models/category');
var Content = require('../models/content');


router.use(function (req, res, next) {
    if(!req.userinfo.isAdmin) {
        res.send('对不起，只有超级管理员才能登陆后台管理');
        return;
    }
    next();
})

router.get('/', function (req, res, next) {
    res.render('admin/index.html', {
        userinfo: req.userinfo
    });
})

router.get('/user', function (req, res, next) {

    /*
    从数据库中读取用户所有数据
     */


    var page = Number(req.query.page || 1);
    var limit = 2;


    var pages=0;

    //获取总记录数
    User.count().then(function (count) {
        //总页数
        pages =Math.ceil(count / limit);
        //页码不能超过总页数
        page = Math.min(page, pages);
        //页码不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit; //忽略条数

        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index.html', {
                userinfo: req.userinfo,
                users: users,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    })
})


router.get('/category', function (req, res, next) {

    var page = Number(req.query.page || 1);
    var limit = 2;


    var pages=0;

    //获取总记录数
    Category.count().then(function (count) {
        //总页数
        pages =Math.ceil(count / limit);
        //页码不能超过总页数
        page = Math.min(page, pages);
        //页码不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit; //忽略条数

        /*
        -1:降序
        1： 升序
         */
        Category.find().sort({_id: -1 }).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category.html', {
                userinfo: req.userinfo,
                categories: categories,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    })
})

router.get('/category/add', function (req, res, next) {
    res.render('admin/addcategory.html', {
        userinfo: req.userinfo
    });
})


router.post('/category/add', function (req, res) {
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '名称不能为空'
        })
    }

    //数据库是否已经存在该分类

    Category.findOne({
        name: name
    }).then(function (rs) {
        if(rs) {
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '已经存在该分类'
            });
            return new Promise.reject();
        } else {
            return new Category({
                name: name
            }).save()
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userinfo: req.userinfo,
            message: '分类保存成功',
            url: '/admin/category'
        });
    })
})



router.get('/category/edit', function (req, res) {
    var categoryId = req.query.id || '';
    //数据库是否已经存在该分类
    Category.findOne({
        _id: categoryId
    }).then(function (category) {
        if(!category) {
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '不存在该分类'
            });
        } else {
            res.render('admin/category_edit', {
                userinfo: req.userinfo,
                category: category
            });
        }
    })
})



router.post('/category/edit', function (req, res) {
    console.log(req)
    var id = req.query.id || '5a11a327130b9609e4e1fd2e';
    var name = req.body.name || '';
    console.log(id)
    if (name == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '名称不能为空'
        })
    }

    //数据库是否已经存在该分类

    Category.findOne({
        _id: id
    }).then(function (category) {
        if(!category) {
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '分类信息不存在'
            });
            return new Promise.reject();
        } else {
            if(name === category.name) {
                res.render('admin/success', {
                    userinfo: req.userinfo,
                    message: '修改成功',
                    url: '/admin/category'
                });
                return new Promise.reject();
            } else {
                //要修改的名称是否在数据库中已存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function (sameCategory) {
        if(sameCategory) {
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '已经存在同名分类'
            });
            return new Promise.reject();
        } else {
            return Category.update({
                _id: id
            },{
                name: name
            })
        }
    }).then(function () {
        res.render('admin/success', {
            userinfo: req.userinfo,
            message: '修改成功',
            url: '/admin/category'
        });
    })
})


router.get('/category/delete', function (req, res) {
    var categoryId = req.query.id || '';
    //数据库是否已经存在该分类
    Category.findOne({
        _id: categoryId
    }).then(function (category) {
        if(!category) {
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '不存在该分类'
            });
        } else {
            Category.remove({
                _id: categoryId
            }).then(function () {
                res.render('admin/success', {
                    userinfo: req.userinfo,
                    message: '删除成功',
                    url: '/admin/category'
                });
            })
        }
    })
})


/*
内容首页
 */

router.get('/content', function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 2;


    var pages=0;

    //获取总记录数
    Content.count().then(function (count) {
        //总页数
        pages =Math.ceil(count / limit);
        //页码不能超过总页数
        page = Math.min(page, pages);
        //页码不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit; //忽略条数

        /*
        -1:降序
        1： 升序
         */
        Content.find().sort({_id: -1 }).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
            console.log(contents)
            res.render('admin/content.html', {
                userinfo: req.userinfo,
                contents: contents,
                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    })
})


router.get('/content/add', function (req, res, next) {
    Category.find().sort({_id: -1}).then(function (categories) {
        res.render('admin/content_add.html', {
            userinfo: req.userinfo,
            categories: categories
        });
    })

})


router.post('/content/add', function (req, res, next) {
    if (req.body.category == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '内容分类不能为空'
        });
        return
    }

    if (req.body.title == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '内容标题不能为空'
        });
        return
    }

    new Content({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        user: req.userinfo.id.toString()
    }).save().then(function (content) {
        res.render('admin/success', {
            userinfo: req.userinfo,
            message: '内容新增成功',
            url: '/admin/content'
        });
    })
})


router.get('/content/edit', function (req, res) {
    var contentId = req.query.id || '';

    Category.find().sort({_id: -1}).then(function (categories) {
        Content.findOne({
            _id: contentId
        }).populate('category').then(function (content) {
            if(!content) {
                res.render('admin/error', {
                    userinfo: req.userinfo,
                    message: '不存在该内容'
                });
            } else {
                res.render('admin/content_edit', {
                    userinfo: req.userinfo,
                    content: content,
                    categories: categories
                });
            }
        })
    })

})



router.post('/content/edit', function (req, res, next) {
    var contentId = req.query.id;
    if (req.body.category == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '内容分类不能为空'
        });
        return
    }

    if (req.body.title == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '内容标题不能为空'
        });
        return
    }

    Content.update({
        _id: contentId
    },{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function () {
        res.render('admin/success', {
            userinfo: req.userinfo,
            message: '内容更新成功',
            url: '/admin/content/edit?id='+contentId
        });
    })
})


router.get('/content/delete', function (req, res) {
    var contentId = req.query.id || '';
    //数据库是否已经存在该内容
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        if(!content) {
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '不存在该内容'
            });
        } else {
            Content.remove({
                _id: contentId
            }).then(function () {
                res.render('admin/success', {
                    userinfo: req.userinfo,
                    message: '删除成功',
                    url: '/admin/content'
                });
            })
        }
    })
})

module.exports= router;
