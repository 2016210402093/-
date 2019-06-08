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
    let sqlStr = `select USER_NAME, USER_ID, USER_EMAIL, USER_IMG, USER_SIGNATURE, TEST_YEAR, GOAL_SCHOOL from USER where USER_ID = ${req.body.userId}`;
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
                userImg: results[0].USER_IMG,
                userName: results[0].USER_NAME
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


formatCreationTime = (results) =>{
    for(let i=0; i<results.length; ++i){
        results[i].CREATION_TIME = moment(results[i].CREATION_TIME).format("YYYY-MM-DD HH:mm:ss");
    }
    return results;
}

//查询所有打卡信息
exports.queryAllClockInfo = (clockId, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    if(Number(clockId) === -1){
        sqlStr1 = `select USER.USER_NAME, USER.USER_IMG, CLOCK.CLOCK_ID, CLOCK.CLOCK_CONTENT, CLOCK.LIKE_NUMBER, CLOCK.IMG_URL, CLOCK.CREATION_TIME
         from CLOCK,USER Where CLOCK.USER_ID = USER.USER_ID order by CLOCK_ID DESC limit 0,8`;
    }
    else{
        sqlStr1 = `select USER.USER_NAME, USER.USER_IMG, CLOCK.CLOCK_ID, CLOCK.CLOCK_CONTENT, CLOCK.LIKE_NUMBER, CLOCK.IMG_URL, CLOCK.CREATION_TIME
         from CLOCK, USER Where CLOCK.USER_ID = USER.USER_ID AND CLOCK.CLOCK_ID < ${clockId} order by CLOCK_ID DESC limit 0,8`;
    }
    sqlStr2 = `select count(*) from CLOCK,USER Where CLOCK.USER_ID = USER.USER_ID`
    
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let clockTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "clockTotalNum"))[0].clockTotalNum;  
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {clockTotalNum: clockTotalNum, list: formatCreationTime(results)};
                    return res.json(ens);
                }
            });    
        
        }

    });    
}

//查询某个用户打卡信息
exports.queryClockInfoByUserId = (userId, clockId, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    if(clockId === -1){
        sqlStr1 = `select * from CLOCK where USER_ID = ${userId} order by CLOCK_ID DESC limit 0,8`;
    }
    else{
        sqlStr1 = `select * from CLOCK where CLOCK_ID < ${clockId} and USER_ID = ${userId} order by CLOCK_ID DESC limit 0,8`;
    }
    // sqlStr2 = `select count(*) from CLOCK,USER Where CLOCK.USER_ID = USER.USER_ID and USER.USER_ID = ${userId}`
    sqlStr2 = `select count(*) from CLOCK WHERE USER_ID = ${userId}`
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let clockTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "clockTotalNum"))[0].clockTotalNum;  
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {clockTotalNum: clockTotalNum, list: formatCreationTime(results)};
                    return res.json(ens);
                }
            });    
        
        }

    });    
}



/*
----------------------------------------------------------------------------------------------------------------
帖子部分
----------------------------------------------------------------------------------------------------------------
*/


exports.addEssay = (userId, essayTitle, essaySubTitle, essayContent, imgUrl, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr = 'insert into ESSAY set ?';
    db.query(sqlStr, {
        USER_ID: userId,
        ESSAY_TITLE: essayTitle,
        ESSAY_SUBTITLE: essaySubTitle,
        ESSAY_CONTENT: essayContent,
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

formatCreationTime = (results) =>{
    for(let i=0; i<results.length; ++i){
        results[i].CREATION_TIME = moment(results[i].CREATION_TIME).format("YYYY-MM-DD HH:mm:ss");
    }
    return results;
}



//查询所有帖子信息
exports.queryAllEssayInfo = (essayId, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    if(Number(essayId) === -1){
        sqlStr1 = `select ESSAY_ID, ESSAY_TITLE, ESSAY_SUBTITLE, IMG_URL, CREATION_TIME, LIKE_NUMBER
         from ESSAY order by ESSAY_ID DESC limit 0,8`;
    }
    else{
        sqlStr1 = `select ESSAY_ID, ESSAY_TITLE, ESSAY_SUBTITLE, IMG_URL, CREATION_TIME, LIKE_NUMBER
        from ESSAY Where ESSAY_ID < ${essayId} order by ESSAY_ID DESC limit 0,8`;
    }
    sqlStr2 = `select count(*) from ESSAY`
    
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let essayTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "essayTotalNum"))[0].essayTotalNum;  
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {essayTotalNum: essayTotalNum, list: formatCreationTime(results)};
                    return res.json(ens);
                }
            });    
        
        }

    });    
}

//查询某个用户帖子信息
exports.queryEssayInfoByUserId = (userId, essayId, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    if(essayId === -1){
        sqlStr1 = `select * from ESSAY where USER_ID = ${userId} order by ESSAY_ID DESC limit 0,8`;
    }
    else{
        sqlStr1 = `select * from ESSAY where ESSAY_ID < ${essayId} and USER_ID = ${userId} order by ESSAY_ID DESC limit 0,8`;
    }
    sqlStr2 = `select count(*) from ESSAY Where USER_ID = ${userId}`
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let essayTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "essayTotalNum"))[0].essayTotalNum;  
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {essayTotalNum: essayTotalNum, list: formatCreationTime(results)};
                    return res.json(ens);
                }
            });    
        
        }

    });    
}


//帖子搜索
exports.searchEssay = (req, res) => {
    let ens = Object.assign({}, entries); 
    let keywords = req.body.keywords.replace(/\'/g,"")
    let sqlStr = `select ESSAY_ID, ESSAY_TITLE FROM ESSAY WHERE ESSAY_TITLE LIKE '%${keywords}%'`;
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else if(!results.length){
            ens.code = 0;
            ens.msg = '为搜索到相关帖子';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.data = results;
            return res.json(ens);
        }
    });    
}

//院校资讯
exports.querySchoolInfo = (req, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    let schoolInfoId = Number(req.body.schoolInfoId)

    if(schoolInfoId === -1){
        sqlStr1 = `select INFO_ID, INFO_TITLE, INFO_SUBTITLE, IMG_URL, CREATION_TIME, LIKE_NUMBER
        from SCHOOL_INFO order by INFO_ID DESC limit 0,8`;
    }
    else{
        sqlStr1 = `select INFO_ID, INFO_TITLE, INFO_SUBTITLE, IMG_URL, CREATION_TIME, LIKE_NUMBER
        from SCHOOL_INFO where INFO_ID < ${schoolInfoId} order by INFO_ID DESC limit 0,8`;
    }
    
    sqlStr2 = `select count(*) from SCHOOL_INFO`
    
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let schoolInfoTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "schoolInfoTotalNum"))[0].schoolInfoTotalNum;  
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {schoolInfoTotalNum: schoolInfoTotalNum, list: formatCreationTime(results)};
                    return res.json(ens);
                }
            });    
        
        }

    });    
}


updateLikeNumber = (sql, ens, res)=>{
    db.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            ens.code = 0;
            ens.msg = '修改失败';
            return res.json(ens);
        }
        else{
            ens.code = 1;
            ens.msg = '修改成功';
            return res.json(ens);
        }
    });
}

//点赞
exports.isLike = (req, res)=>{
    let ens = Object.assign({}, entries); 
    let type = req.body.type; 
    let isLike = Number(req.body.isLike);
    let id = req.body.id;
    let userId = req.body.userId;
    let sql1, sql2;
    if(isLike === -1){
        if(type === 'essay'){
            sql1 = `DELETE FROM ESSAY_LIKE WHERE ESSAY_ID = ${id} and USER_ID = ${userId}`;
            sql2 = `update ESSAY set LIKE_NUMBER = LIKE_NUMBER-1 WHERE ESSAY_ID = ${id}`;
        }
        else {
            sql1 = `DELETE FROM INFO_LIKE WHERE INFO_ID = ${id} and USER_ID = ${userId}`;
            sql2 = `update SCHOOL_INFO set LIKE_NUMBER = LIKE_NUMBER-1 WHERE INFO_ID = ${id}`;
        }
        db.query(sql1, (err, results)=>{
            if (err){
                console.log(err);
                ens.code = 0;
                ens.msg = '修改失败';
                return res.json(ens);
            }
            else {
                updateLikeNumber(sql2, ens, res);
            }
        });
    }
    else {
        let insertInfo;
        if(type === 'essay'){
            sql1 = `insert into ESSAY_LIKE set ?`;
            sql2 = `update ESSAY set LIKE_NUMBER = LIKE_NUMBER+1 WHERE ESSAY_ID = ${id}`;
            insertInfo = {ESSAY_ID: id, USER_ID: userId};
        }
        else {
            sql1 = `insert into INFO_LIKE set ?`;
            sql2 = `update SCHOOL_INFO set LIKE_NUMBER = LIKE_NUMBER+1 WHERE INFO_ID = ${id}`;
            insertInfo = {INFO_ID: id, USER_ID: userId}
        }
        db.query(sql1, insertInfo ,(err, results)=>{
            if (err){
                console.log(err);
                ens.code = 0;
                ens.msg = '修改失败';
                return res.json(ens);
            }
            else {
                updateLikeNumber(sql2, ens, res);
            }
        });
    }

}



//删除帖子
exports.deleteEssay = (req, res) => {
    let ens = Object.assign({}, entries); 
    sql = `DELETE FROM ESSAY WHERE ESSAY_ID = ${req.body.essayId}`;
    db.query(sql, (err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            ens.msg = '删除失败';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.msg = "删除成功";
            return res.json(ens);
        }
    });
}


//获取帖子/资讯详细内容
exports.getEssayDetail = (req, res)=>{
    let ens = Object.assign({}, entries); 
    let sqlStr;
    if(req.body.type === "essay"){
        sqlStr = `select USER.USER_NAME, USER.USER_ID, USER.USER_IMG, ESSAY.ESSAY_TITLE, ESSAY.ESSAY_CONTENT, ESSAY.LIKE_NUMBER, ESSAY.CREATION_TIME,
        ESSAY.ESSAY_ID FROM ESSAY, USER WHERE ESSAY.USER_ID = USER.USER_ID AND ESSAY_ID = ${req.body.Id}`;
    }
    else if (req.body.type === "info"){
        sqlStr = `select USER.USER_NAME, USER.USER_ID, USER.USER_IMG, SCHOOL_INFO.INFO_TITLE, SCHOOL_INFO.INFO_CONTENT, SCHOOL_INFO.LIKE_NUMBER, SCHOOL_INFO.CREATION_TIME,
         SCHOOL_INFO.INFO_ID FROM SCHOOL_INFO,USER WHERE SCHOOL_INFO.USER_ID = USER.USER_ID and INFO_ID = ${req.body.Id}`;
    }
    db.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            ens.code = 1;
            ens.data = formatCreationTime(results);
            return res.json(ens);
        }
    });    
}


// 获取是否收藏点赞关注等信息
exports.getOtherEssayDetail = (req, res)=>{
    let ens = Object.assign({}, entries); 
    if(req.body.type === "essay"){
        let sql1 = `select * from ESSAY_LIKE WHERE ESSAY_ID = ${req.body.essayId} and USER_ID = ${req.body.userId}`;
        let sql2 = `select * from CONCERNED WHERE CONCERNED_PERSON_ID = ${req.body.personId} and USER_ID = ${req.body.userId}`;
        let sql3 = `select * from COLLECTION WHERE COLLECTION_ESSAY_ID = ${req.body.essayId} and USER_ID = ${req.body.userId}`;
        let isLike = 0;
        let isCollect = 0;
        let isConcerned = 0; 
        db.query(sql1, (err, results) => {
            if (err) {
                console.log(err);
                ens.code = 0;
                return res.json(ens);
            }
            else {
                isLike = results.length ? 1 : 0;
                db.query(sql2, (err, results) => {
                    if (err) {
                        console.log(err);
                        ens.code = 0;
                        return res.json(ens);
                    }
                    else {
                        isConcerned = results.length ? 1 : 0;
                        db.query(sql3, (err, results) => {
                            if (err) {
                                console.log(err);
                                ens.code = 0;
                                return res.json(ens);
                            }
                            else {
                                isCollect = results.length ? 1 : 0;
                                ens.code = 1;
                                ens.data = {isLike: isLike, isConcerned: isConcerned, isCollect: isCollect};
                                return res.json(ens);
                            }
                        });    
                    }
                });    
            }
        });    
    }
    else if (req.body.type === "info"){
        let sqlStr = `select * from INFO_LIKE WHERE INFO_ID = ${req.body.infoId} and USER_ID = ${req.body.userId}`;
        db.query(sqlStr, (err, results) => {
            if (err) {
                console.log(err);
                ens.code = 0;
                return res.json(ens);
            }
            else if(!results.length){
                ens.code = 1;
                ens.data = {isLike: 0};
                return res.json(ens);
            }
            else {
                ens.code = 1;
                ens.data = {isLike: 1};
                return res.json(ens);
            }
        });    
    }
}


/*
----------------------------------------------------------------------------------------------------------------
收藏部分
----------------------------------------------------------------------------------------------------------------
*/


//收藏帖子
exports.collectEssay = (req, res) => {
    let ens = Object.assign({}, entries); 
    sql = `insert into COLLECTION set ?`;
    db.query(sql, {
        USER_ID: req.body.userId,
        COLLECTION_ESSAY_ID: req.body.essayId
    } ,(err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            ens.msg = '收藏失败';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.msg = '收藏成功';
            return res.json(ens);
        }
    });
};

//取消收藏
exports.concelCollect = (req, res) => {
    let ens = Object.assign({}, entries); 

    sql = `DELETE FROM COLLECTION WHERE USER_ID = ${req.body.userId} and COLLECTION_ESSAY_ID = ${req.body.essayId}`;
    db.query(sql, (err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            ens.msg = '取消失败';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.msg = "取消成功";
            return res.json(ens);
        }
    });
};

//查询收藏的帖子
exports.searchCollectEssay = (req, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    let userId = Number(req.body.userId);
    let collectionId = Number(req.body.collectionId);
    if(collectionId === -1){
        sqlStr1 = `SELECT ESSAY.ESSAY_ID, ESSAY.ESSAY_TITLE, ESSAY.ESSAY_SUBTITLE, ESSAY.IMG_URL, ESSAY.CREATION_TIME, ESSAY.LIKE_NUMBER, COLLECTION.COLLECTION_ID
         FROM ESSAY, COLLECTION where ESSAY.ESSAY_ID = COLLECTION.COLLECTION_ESSAY_ID AND COLLECTION.USER_ID = ${userId}
          order by COLLECTION.COLLECTION_ID DESC limit 0,8`;
    }
    else{
        sqlStr1 = `SELECT ESSAY.ESSAY_ID, ESSAY.ESSAY_TITLE, ESSAY.ESSAY_SUBTITLE, ESSAY.IMG_URL, ESSAY.CREATION_TIME, ESSAY.LIKE_NUMBER, COLLECTION. COLLECTION_ID 
        FROM ESSAY, COLLECTION where COLLECTION.COLLECTION_ID < ${collectionId} AND ESSAY.ESSAY_ID = COLLECTION.COLLECTION_ESSAY_ID AND COLLECTION.USER_ID = ${userId}  
        order by COLLECTION.COLLECTION_ID DESC limit 0,8`;
    }
    sqlStr2 = `select count(*) FROM COLLECTION WHERE USER_ID = ${userId}`
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let essayTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "essayTotalNum"))[0].essayTotalNum;  
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {essayTotalNum: essayTotalNum, list: formatCreationTime(results)};
                    return res.json(ens);
                }
            });    
        
        }
    });    
};




/*
----------------------------------------------------------------------------------------------------------------
关注部分
----------------------------------------------------------------------------------------------------------------
*/

//关注用户
exports.concernedUser = (req, res) => {
    let ens = Object.assign({}, entries); 
    sql = `insert into CONCERNED set ?`;
    db.query(sql, {
        USER_ID: req.body.userId,
        CONCERNED_PERSON_ID: req.body.concernedPersonId
    } ,(err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            ens.msg = '关注失败';
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.msg = '关注成功';
            return res.json(ens);
        }
    });
};

//取消关注
exports.concelConcern = (req, res) => {
    let ens = Object.assign({}, entries); 

    sql = `DELETE FROM CONCERNED WHERE USER_ID = ${req.body.userId} and CONCERNED_PERSON_ID = ${req.body.concernedPersonId}`;
    db.query(sql, (err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            ens.msg = '取消失败';
            return res.json(ens);
        }
        else {
            if(results.affectedRows===0){
                ens.code = 2;
                ens.msg = '已取消关注';
                return res.json(ens);
            }
            ens.code = 1;
            ens.msg = "取消成功";
            return res.json(ens);
        }
    });
};

//查询关注的用户
exports.searchConcernedPerson = (req, res) => {
    let ens = Object.assign({}, entries); 
    let sqlStr1, sqlStr2;
    let userId = Number(req.body.userId);
    let concernedId = Number(req.body.concernedId);
    if(concernedId === -1){
        sqlStr1 = `SELECT USER.USER_ID, USER.USER_NAME, USER.USER_SIGNATURE, USER.USER_IMG, CONCERNED.CONCERNED_ID FROM CONCERNED, USER 
        WHERE CONCERNED.USER_ID = ${userId} AND CONCERNED.CONCERNED_PERSON_ID = USER.USER_ID order by CONCERNED.CONCERNED_ID DESC limit 0,12`;
    }
    else{
        sqlStr1 = `SELECT USER.USER_ID, USER.USER_NAME, USER.USER_SIGNATURE, USER.USER_IMG, CONCERNED.CONCERNED_ID FROM CONCERNED, USER 
        WHERE CONCERNED.USER_ID = ${userId} AND CONCERNED.CONCERNED_PERSON_ID = USER.USER_ID AND CONCERNED.CONCERNED_ID < ${concernedId} 
        order by CONCERNED.CONCERNED_ID DESC limit 0,12`;
    }
    sqlStr2 = `select count(*) FROM  CONCERNED where USER_ID = ${userId}`
    db.query(sqlStr2, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            let userTotalNum = JSON.parse(JSON.stringify(results).replace("count(*)", "userTotalNum"))[0].userTotalNum; 
            db.query(sqlStr1, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    ens.code = 1;
                    ens.data = {userTotalNum: userTotalNum, list: results};
                    return res.json(ens);
                }
            });    
        
        }
    });    
};


//获取关注数量
exports.getConcernedNum = (req, res)=>{
    let ens = Object.assign({}, entries); 

    sql = `select count(*) from CONCERNED WHERE CONCERNED_PERSON_ID = ${req.body.concernedPersonId}`;
    db.query(sql, (err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.data = JSON.parse(JSON.stringify(results).replace("count(*)", "concernedNum"))[0].concernedNum;
            return res.json(ens);
        }
    });
}


/*
----------------------------------------------------------------------------------------------------------------
文件部分
----------------------------------------------------------------------------------------------------------------
*/

exports.getFileInfo = (req, res) =>{
    let ens = Object.assign({}, entries); 

    sql = `select * from FILE`;
    db.query(sql, (err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.data = results;
            return res.json(ens);
        }
    });
}



/*
----------------------------------------------------------------------------------------------------------------
评论部分
----------------------------------------------------------------------------------------------------------------
*/

exports.getCommentsInfo = (req, res)=>{
    let ens = Object.assign({}, entries); 
    sql = `select USER.USER_IMG, USER.USER_NAME, COMMENT.COMMENT_CONTENT, COMMENT.CREATION_TIME FROM USER, COMMENT WHERE
    USER.USER_ID = COMMENT.USER_ID AND COMMENT.TARGET_ESSAY_ID = ${req.body.essayId}`
    db.query(sql, (err, results)=>{
        if (err){
            console.log(err);
            ens.code = 0;
            return res.json(ens);
        }
        else {
            ens.code = 1;
            ens.data = formatCreationTime(results);
            return res.json(ens);
        }
    });
}

exports.addComment = (req, res) =>{
    let ens = Object.assign({}, entries); 
    sql = `insert into COMMENT set ?`;
    db.query(sql, {
        TARGET_ESSAY_ID: req.body.essayId,
        COMMENT_CONTENT: req.body.commentContent,
        USER_ID: req.body.userId
    } ,(err, results)=>{
        if (err){
            ens.code = 0;
            return res.json(ens);
        }
        else {
            ens.code = 1;
            return res.json(ens);
        }
    });
}