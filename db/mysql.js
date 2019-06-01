let config = require('../config')

const mysql = require('mysql');

let db = mysql.createConnection(config.db);

let entries = require('./entries');


//登录验证
exports.login = (req, res) => {
    let ens = Object.assign({}, entries); 
    let userName = req.body.userName;
    let password = req.body.password;

    let sqlStr = `select USER_NAME,USER_PASSWORD from USER where USER_NAME = '${userName}'`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if(!results.length){
            ens.code = 0;
            ens.msg = '账号密码错误';
            return res.json(ens);
        }
        else {
            if(results[0].USER_NAME===userName && results[0].USER_PASSWORD===password){
                ens.code = 1;
                ens.msg = '登陆成功';
                return res.json(ens);
            }
            else {
                ens.code = 0;
                ens.msg = '账号密码错误';
                return res.json(ens);
            }
        }

    });    

}


//发送邮件
exports.sendEmail = (email, res, mailOptions, emailCode, func) => {
    let ens = Object.assign({}, entries); 


    //把上一个删除
    let sqlStr = `delete from EMAIL where USER_EMAIL = '${email}'`;
    db.query(sqlStr,(err, results) => {
        if(err){
            console.log(111111111111);
            console.log(err);
            throw err;
        }
    });

    console.log(55555555555);

    sqlStr = 'insert into EMAIL set ?';
    db.query(sqlStr, {USER_EMAIL: email, VERIFY_CODE: emailCode}, (err, results) => {
        if (err) {
            console.log(2222222);
            ens.code = 0;
            ens.msg = '发送失败';
            return res.json(ens);
        }
        else {
            console.log(22222);
            func(mailOptions);
            function deleteCode(){
                let sqlStr = `delete from EMAIL where USER_EMAIL = '${email}'`;
                db.query(sqlStr,(err, results) => {
                    if(err){
                        console.log(err);
                        throw err;
                    }
                });
            };
            setTimeout(deleteCode,180*1000)
            ens.code = 1;
            ens.msg = '发送成功';
            return res.json(ens);
        }
    });
}


//用户注册
exports.resgister = (req, res) =>{
    let ens = Object.assign({}, entries); 
    let userName = req.body.userName;
    let password = req.body.password;
    let email = req.body.email;
    let verifyCode = req.body.verifyCode;

    let sqlStr = `select VERIFY_CODE from EMAIL where USER_EMAIL = '${email}'`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if (!results.length) {
            ens.code = 0;
            ens.msg = '验证码错误';
            return res.json(ens);
        }
        else {
            if(results[0].VERIFY_CODE === verifyCode){
                let sqlStr = 'insert into USER set ?';
                db.query(sqlStr, {USER_NAME: userName, USER_PASSWORD: password, USER_EMAIL: email, USER_TYPE:1}, (err, results) => {
                    if (err) {
                        console.log(err);
                        ens.code = 1;
                        ens.msg = '用户已存在';
                        return res.json(ens);
                    }
                    else {
                        ens.code = 2;
                        ens.msg = '注册成功';
                        return res.json(ens);
                    }
                });
            }
            else{
                ens.code = 0;
                ens.msg = '验证码错误';
                return res.json(ens);
            }

        }

    });    

}

//找回密码（查找用户email）
exports.searchEmail = (userName, res, emailCode, func, sendEmail)=>{
    let sqlStr = `select USER_EMAIL from USER where USER_NAME = '${userName}'`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if(!results.length){
            return ""
        }
        else {
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
            　to: results[0].USER_EMAIL, // 收件人地址，多个收件人可以使用逗号分隔
            　subject: email.title, // 邮件标题
            　html: email.htmlBody // 邮件内容
            };
            console.log(results[0].USER_EMAIL);
            sendEmail(results[0].USER_EMAIL, res, mailOptions, emailCode, func)
        }

    });    
}


//找回密码（邮箱验证码是否正确）
exports.verifyEmailCode = (req, res)=>{
    let ens = Object.assign({}, entries); 
    let userName = req.body.userName;
    let verifyCode = req.body.verifyCode;

    let sqlStr = 
    `select EMAIL.VERIFY_CODE from USER,EMAIL
    where USER.USER_EMAIL=EMAIL.USER_EMAIL and USER.USER_NAME = '${userName}'
    `;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if(!results.length){
            ens.code = 0;
            ens.msg = '用户名或验证码不正确';
            return res.json(ens);
        }
        else {
            if(results[0].VERIFY_CODE===verifyCode){
                ens.code = 1;
                ens.msg = '验证成功';
                return res.json(ens);
            }
            else {
                ens.code = 0;
                ens.msg = '用户名或验证码不正确';
                return res.json(ens);
            }
        }

    });    
}


//修改密码
exports.updatePassword = (req, res)=>{
    let ens = Object.assign({}, entries); 
    let sqlStr = `update USER set USER_PASSWORD = '${req.body.password}' where USER_NAME = '${req.body.userName}'`;
    db.query(sqlStr,function(err,results){
        if(err){
            ens.code = 0;
            ens.msg = '修改失败';
            res.json(ens);
            throw err;
        }else {
            if(results.affectedRows===0){
                ens.code = 0;
                ens.msg = '修改失败';
                return res.json(ens);
            }
            else{
                ens.code = 1;
                ens.msg = '修改成功';
                return res.json(ens);
            }    
        }
    });
}

//修改邮箱
exports.updateEmail = (req, res)=>{
    let ens = Object.assign({}, entries); 

    let sqlStr = `select VERIFY_CODE from EMAIL where USER_EMAIL = '${req.body.email}'`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if (!results.length) {
            ens.code = 0;
            ens.msg = '验证码错误';
            return res.json(ens);
        }
        else {
            if(results[0].VERIFY_CODE === req.body.verifyCode){
                let sqlStr = `update USER set USER_EMAIL = '${req.body.email}' where USER_NAME = '${req.body.userName}'`;
                db.query(sqlStr,function(err,results){
                    if(err){
                        ens.code = 1;
                        ens.msg = '修改失败';
                        res.json(ens);
                        throw err;
                    }else {
                        if(results.affectedRows===0){
                            ens.code = 1;
                            ens.msg = '修改失败';
                            return res.json(ens);
                        }
                        else{
                            ens.code = 2;
                            ens.msg = '修改成功';
                            return res.json(ens);
                        }    
                    }
                });
            }
        }
    });
}