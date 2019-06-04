let express = require('express');
let router = express.Router();
let multiparty = require('multiparty');
let fs = require('fs');
let db = require('../db/mysql')

router.post('/', function(req, res){

    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files){
        //将前台传来的base64数据去掉前缀
        let imgData = fields.imgData[0].replace(/^data:image\/\w+;base64,/, '');

        let dataBuffer = new Buffer.from(imgData, 'base64');
        //写入文件
        let fileName = fields.imgName[0];
        let column = fields.column[0];
        let updateInfo = fields.updateInfo[0];
        let userName = fields.userName[0];

        fs.writeFile(`public/userImg/${fileName}.png`, dataBuffer, function(err){
            if(err){
                console.log(1111111111,err)
                res.json({code:0, msg:"上传失败"});
            }else{
                console.log(fileName, column, updateInfo, userName);
                db.updateUserInfo(column, updateInfo, userName, res);
            }
        });

    });

});

module.exports = router;