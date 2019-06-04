let express = require('express');
let router = express.Router();
let db = require('../db/mysql')

router.post('/', function(req, res){
    let column = req.body.column;
    let updateInfo = req.body.updateInfo;
    let userName = req.body.userName;
    db.updateUserInfo(column, updateInfo, userName, res);

});

module.exports = router;