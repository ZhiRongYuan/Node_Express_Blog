/*
应用程序的启用（入口）文件
 */


//加载express 模块

var express = require('express');
var swig= require('swig');

var mongoose = require('mongoose');


//加载body-parser  用于处理post方式 提交过来的数据
var bodyParser= require('body-parser');

//加载cookies
var Cookies = require('cookies');

var User = require('./models/users');

//创建App <==>  NodeJs 中的 http.createServer()

var app = express();

//设置静态文件托管
//当用户访问的路径以/public  那么直接返回对应__dirname+'/public'下的文件
app.use('/public', express.static(__dirname + '/public'));

//配置应用模板
//定义当前应用使用的模板引擎
//第一个参数： 模板引擎的名称，同时也是模板文件的后缀，  第二个参数表示解析处理模板内容的方法
app.engine('html',swig.renderFile);


//设置模板文件存放的目录， 第一个参数必须是views, 第二个参数是目录
app.set('views', './views');

//注册所使用的模板引擎， 第一个参数必须是view engine,  第二个参数和app.engine定义的模板引擎名称需保持一致
app.set('view engine', 'html');

//开发过程中 需要取消模板缓存机制
swig.setDefaults({cache: false})



//设置body-parser
app.use(bodyParser.urlencoded({ entended: true }));

//设置Cookies
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);

    req.userinfo={};
    if(req.cookies.get('userinfo')) {
        try {
            req.userinfo = JSON.parse(req.cookies.get('userinfo'));
            //判断当前用户 是否是超管
            User.findById(req.userinfo.id).then(function (userinfo) {
                req.userinfo.isAdmin = Boolean(userinfo.isAdmin);
                next();
            })
        } catch (e) {
            next()
        }
    } else {
        next();
    }
})



// app.get('/', function (req, res, next) {
//     //res.send('<h1>test1111</h1>')
//
//     /*
//     读取指定目录（views）下的文件  解析并返回给客户端
//     第一个参数为 相对于模板存放目录（views）文件路径
//     第二个参数： 传递给模板使用的数据
//      */
//     res.render('index');
// })


// app.get('/main.css', function (req, res, next) {
//    res.setHeader('content-type', 'text/css');
//    res.send('body: {background:red}')
// })
// console.log(__filename)

//根据不同功能划分模块
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/main'));



/*
mac 安装mongoDB :

# 进入 /usr/local
cd /usr/local

# 下载
sudo curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.4.2.tgz

# 解压
sudo tar -zxvf mongodb-osx-x86_64-3.4.2.tgz

# 重命名为 mongodb 目录

sudo mv mongodb-osx-x86_64-3.4.2 mongodb

安装完成后，我们可以把 MongoDB 的二进制命令文件目录（安装目录/bin）添加到 PATH 路径中：
export PATH=/usr/local/mongodb/bin:$PATH


启动MongoDB:

启动 mongodb，默认数据库目录即为 /data/db：
sudo mongod

# 如果没有创建全局路径 PATH，需要进入以下目录
cd /usr/local/mongodb/bin
sudo ./mongod

再打开另外一个终端
$ cd /usr/local/mongodb/bin
$ ./mongo
 */

mongoose.connect('mongodb://localhost:27017/blog', function (err) {
    if (err) {
        console.log('连接失败');
    } else {
        console.log('连接成功');
        //监听http请求
        app.listen(8080);
    }
})
