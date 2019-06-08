let express = require('express');
let router = express.Router();
let db = require('../db/mysql')

router.post('/', function(req, res){

    let userId = Number(req.body.userId);
    let essayId = Number(req.body.essayId);

    if(userId === -1){
        db.queryAllEssayInfo(essayId, res);
    }
    else {
        db.queryEssayInfoByUserId(userId, essayId, res);
    }

});

module.exports = router;