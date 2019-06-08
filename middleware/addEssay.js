let express = require('express');
let router = express.Router();
let multiparty = require('multiparty');
let fs = require('fs');
let db = require('../db/mysql')

router.post('/', function(req, res){

    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files){
        //将前台传来的base64数据去掉前缀

        console.log(fields);
        console.log(fields.imgData[0]);

        let imgData = fields.imgData[0].replace(/^data:image\/\w+;base64,/, '');

        let dataBuffer = new Buffer.from(imgData, 'base64');
        //写入文件
        let imgName = fields.imgName[0];
        let essayContent = fields.essayContent[0];
        let imgUrl = `essayImg/${imgName}.png`;
        let userId = fields.userId[0];
        let essayTitle = fields.essayTitle[0];
        let essaySubTitle = fields.essaySubTitle[0];

        fs.writeFile(`public/essayImg/${imgName}.png`, dataBuffer, function(err){
            if(err){
                res.json({code:0, msg:"上传失败"});
            }else{
                db.addEssay(userId, essayTitle, essaySubTitle, essayContent, imgUrl, res);
            }
        });

    });

});

module.exports = router;