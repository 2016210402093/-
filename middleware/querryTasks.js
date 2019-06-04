let express = require('express');
let router = express.Router();
let db = require('../db/mysql');
let calculateDate = require('./calculateDate');

router.post('/', function(req, res){

    db.querryTasks(req, res, calculateDate.getTodayStartAndEnd(), calculateDate.getWeekStartAndEnd(0), calculateDate.getMonthStartAndEnd(0));

});

module.exports = router;