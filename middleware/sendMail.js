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
    let email = {
    　title: '考研平台--邮箱验证码',
    　htmlBody: `<h1>你好!</h1>
                    <p style="font-size: 18px;color:#000;">
                        考研平台的验证码为：<u style="font-size: 16px;color:#1890ff;">'${emailCode}'</u>
                    </p>
                    <p style="font-size: 14px;color:#666;">
                        3分钟内有效
                    </p>`
    }
    let mailOptions = {
    　from: config.email.user, // 发件人地址
    　to: req.body.email, // 收件人地址，多个收件人可以使用逗号分隔
    　subject: email.title, // 邮件标题
    　html: email.htmlBody // 邮件内容
    };
    db.sendEmail(req.body.email, res, mailOptions, emailCode, send)
});

module.exports = router;