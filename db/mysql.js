let config = require('../config')

const mysql = require('mysql');

let moment = require('moment');

let db = mysql.createConnection(config.db);

let entries = require('./entries');


/*
----------------------------------------------------------------------------------------------------------------
用户信息部分
----------------------------------------------------------------------------------------------------------------
*/


//登录验证
exports.login = (req, res) => {
    let ens = Object.assign({}, entries); 
    let userName = req.body.userName;
    let password = req.body.password;

    let sqlStr = `select USER_NAME,USER_PASSWORD, USER_ID from USER where USER_NAME = '${userName}'`;
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
                ens.data = {userId: results[0].USER_ID};
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
            console.log(err);
            throw err;
        }
    });

    sqlStr = 'insert into EMAIL set ?';
    db.query(sqlStr, {USER_EMAIL: email, VERIFY_CODE: emailCode}, (err, results) => {
        if (err) {
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


//获取用户基本信息
exports.getUserInfo = (req, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr = `select USER_ID, USER_EMAIL, USER_IMG, USER_SIGNATURE, TEST_YEAR, GOAL_SCHOOL from USER where USER_NAME = '${req.body.userName}'`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if(!results.length){
            ens.code = 0;
            ens.data = {};
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.data = {
                userId: results[0].USER_ID,
                userEmail: results[0].USER_EMAIL,
                userSignature: results[0].USER_SIGNATURE,
                testYear: results[0].TEST_YEAR,
                goalSchool: results[0].GOAL_SCHOOL,
                userImg: results[0].USER_IMG
                }
            return res.json(ens);
        }

    });    
}


//修改用户基本信息
exports.updateUserInfo = (column, updateInfo, userName, res)=> {
    let ens = Object.assign({}, entries); 
    let sqlStr;
    if(column === "TEST_YEAR"){
        sqlStr = `update USER set ${column} = ${updateInfo} where USER_NAME = '${userName}'`;
    }
    else{
        sqlStr = `update USER set ${column} = '${updateInfo}' where USER_NAME = '${userName}'`;
    }
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
                ens.code = 2;
                ens.msg = '修改成功';
                return res.json(ens);
            }    
        }
    });
}




/*
----------------------------------------------------------------------------------------------------------------
任务部分
----------------------------------------------------------------------------------------------------------------
*/


//添加任务
exports.addTask = (req, res)=>{
    let ens = Object.assign({}, entries); 
    let sqlStr = 'insert into TASK set ?';
    db.query(sqlStr, {
        USER_ID: req.body.userId,
        TASK_NAME: req.body.taskName,
        TASK_CONTENT: req.body.taskContent,
        TASK_TYPE: req.body.taskType,
        DEAD_LINE: req.body.deadLine,
        REMIND_TIME: req.body.remindTime,
        IS_NOTIFIED: req.body.isNotification
    }, (err, results) => {
        if (err) {
            console.log(err);
            ens.code = 0;
            ens.msg = '添加失败';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.msg = '添加成功';
            return res.json(ens);
        }
    });
}  


//查询某用户的任务
exports.querryTasks = (req, res, today, week, month)=>{
    let ens = Object.assign({}, entries); 
    let sql1 = `select TASK_ID, TASK_NAME, TASK_CONTENT, DEAD_LINE, REMIND_TIME, IS_COMPLETED, IS_NOTIFIED from TASK
     where USER_ID = ${req.body.userId} and TASK_TYPE = 1 and DEAD_LINE between '${today[0]}' and '${today[1]}'`;
    let sql2 = `select TASK_ID, TASK_NAME, TASK_CONTENT, TASK_TYPE, DEAD_LINE, REMIND_TIME, IS_COMPLETED, IS_NOTIFIED from TASK
     where USER_ID = ${req.body.userId} and TASK_TYPE = 2 and DEAD_LINE between '${week[0]}' and '${week[1]}'`;
    let sql3 = `select TASK_ID, TASK_NAME, TASK_CONTENT, TASK_TYPE, DEAD_LINE, REMIND_TIME, IS_COMPLETED, IS_NOTIFIED from TASK
     where USER_ID = ${req.body.userId} and TASK_TYPE = 3 and DEAD_LINE between '${month[0]}' and '${month[1]}'`;
    let todayTask = [];
    let weekTask = [];
    let monthTask = [];

    db.query(sql1, (err, results) => {
        if (err) {
            throw err;
        }
        else {
            if(results.length){
                for(let i=0; i<results.length; ++i){
                    results[i].DEAD_LINE = moment(results[i].DEAD_LINE).format("YYYY-MM-DD HH:mm:ss");
                    results[i].REMIND_TIME = moment(results[i].REMIND_TIME).format("YYYY-MM-DD HH:mm:ss");
                }
            }
            todayTask = results;
            db.query(sql2, (err, results) => {
                if (err) {
                    throw err;
                }
                else {
                    if(results.length){
                        for(let i=0; i<results.length; ++i){
                            results[i].DEAD_LINE = moment(results[i].DEAD_LINE).format("YYYY-MM-DD HH:mm:ss");
                            results[i].REMIND_TIME = moment(results[i].REMIND_TIME).format("YYYY-MM-DD HH:mm:ss");
                        }
                    }
                    weekTask = results;
                    db.query(sql3, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            if(results.length){
                                for(let i=0; i<results.length; ++i){
                                    results[i].DEAD_LINE = moment(results[i].DEAD_LINE).format("YYYY-MM-DD HH:mm:ss");
                                    results[i].REMIND_TIME = moment(results[i].REMIND_TIME).format("YYYY-MM-DD HH:mm:ss");
                                }
                            }
                            ens.code = 1;
                            monthTask = results;
                            ens.data = {"todayTask": todayTask, "weekTask": weekTask, "monthTask": monthTask,}
                            return res.json(ens);
                        }
                    });   
                }
            });   
        }
    });    
    
}


//完成任务
exports.completeTask = (req, res) =>{
    let ens = Object.assign({}, entries); 
    let sqlStr = `update TASK set IS_COMPLETED = 1,IS_NOTIFIED = 0 where TASK_ID = '${req.body.taskId}'`;
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






/*
----------------------------------------------------------------------------------------------------------------
打卡部分
----------------------------------------------------------------------------------------------------------------
*/

//用户打卡
exports.addClock = (userId, clockContent, imgUrl, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr = 'insert into CLOCK set ?';
    db.query(sqlStr, {
        USER_ID: userId,
        CLOCK_CONTENT: clockContent,
        IMG_URL: imgUrl,
    }, (err, results) => {
        if (err) {
            console.log(err);
            ens.code = 0;
            ens.msg = '添加失败';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.msg = '添加成功';
            return res.json(ens);
        }
    });
}

//查询所有打卡信息
exports.queryAllClockInfo = (clockId, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr;
    if(clockId === -1){
        sqlStr = `select * from CLOCK order by CLOCK_ID DESC limit 0,8`;
    }
    else{
        sqlStr = `select * from CLOCK where CLOCK_ID < ${clockId} order by CLOCK_ID DESC limit 0,8`;
    }
    
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            ens.code = 1;
            ens.data = results;
            return res.json(ens);
        }

    });    
}

//查询某个用户打卡信息
exports.queryClockInfoByUserId = (userId, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr;
    if(clockId === -1){
        sqlStr = `select * from CLOCK where USER_ID = ${userId} order by CLOCK_ID DESC limit 0,8`;
    }
    else{
        sqlStr = `select * from CLOCK where CLOCK_ID < ${clockId} and USER_ID = ${userId} order by CLOCK_ID DESC limit 0,8`;
    }
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            ens.code = 1;
            ens.data = results;
            return res.json(ens);
        }

    });    
}