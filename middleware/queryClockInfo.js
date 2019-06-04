let express = require('express');
let router = express.Router();
let db = require('../db/mysql')

router.post('/', function(req, res){

    if(req.body.type === "all"){
        db.queryAllClockInfo(-req.body.userId, res);
    }
    else {
        db.queryClockInfoByUserId(req.body.userId, res);
    }

});

module.exports = router;