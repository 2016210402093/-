let express = require('express');
let router = express.Router();
let db = require('../db/mysql')

router.post('/', function(req, res){
    
    db.searchCollectEssay(req, res);

});

module.exports = router;