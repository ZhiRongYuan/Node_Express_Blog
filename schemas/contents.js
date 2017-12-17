var mongoose = require('mongoose');


//内容的表结构

module.exports= new mongoose.Schema({
    //用户
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //关联字段
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    //数据插入时间
    addTime: {
        type: Date,
        default: new Date()
    },

    //阅读量
    views: {
        type: Number,
        default: 0
    },

    title: String,
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    }
})