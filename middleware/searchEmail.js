const nodemailer = require('nodemailer');
let express = require('express');
let router = express.Router();
let db = require('../db/mysql');
let config = require('../config')

// 创建可重用邮件传输器
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',//代理商，这里写的qq的
    secure: true,
    port: 465,
    auth: {
        user: config.email.user,//授权邮箱
        pass: config.email.smtp
    }
});
const send = (mailOptions) => {

    console.log(888888, mailOptions)

　　transporter.sendMail(mailOptions, function(error, info) {
　　if (error) {
　　　　　return console.log(error);
　　}
　　console.log('Message send: %s', info.messageId);
　　});
}


randomnSixCode = ()=> {
    code='';
    for(let i=0; i<6; ++i){
        code+=Math.floor(Math.random()*10);
    }
    return code;
}

　　
router.post('/', function(req, res) {
    
    let emailCode = randomnSixCode() //验证码为6位随机数
    db.searchEmail(req.body.userName,  res, emailCode, send, db.sendEmail);
});

module.exports = router;