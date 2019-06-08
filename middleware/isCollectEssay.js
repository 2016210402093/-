let express = require('express');
let router = express.Router();
let db = require('../db/mysql')

router.post('/', function(req, res){
    
    if(req.body.type === "add"){
        db.collectEssay(req, res);
    } 
    if(req.body.type === "remove"){
        db.concelCollect(req, res);
    }
});

module.exports = router;