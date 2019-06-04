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
        let imgName = fields.imgName[0];
        let clockContent = fields.clockContent[0];
        let imgUrl = `clockImg/${imgName}.png`;
        let userId = fields.userId[0];


        fs.writeFile(`public/clockImg/${imgName}.png`, dataBuffer, function(err){
            if(err){
                res.json({code:0, msg:"上传失败"});
            }else{
                db.addClock(userId, clockContent, imgUrl, res);
            }
        });

    });

});

module.exports = router;