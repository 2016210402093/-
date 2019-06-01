let express = require('express');
let bodyParser = require('body-parser');
let config = require("./config");
let app = express();

const port = config.port;

const sendMail = require('./middleware/sendMail');
const register = require('./middleware/register');
const login = require('./middleware/login');
const searchEmail = require('./middleware/searchEmail');
const verifyEmailCode = require('./middleware/verifyEmailCode');
const updatePassword = require('./middleware/updatePassword');
const updateEmail = require('./middleware/updateEmail');



app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") {
      res.send(200);/*让options请求快速返回*/
    } else{
      next();
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/sendMail', sendMail);
app.use('/register', register);
app.use('/login', login);
app.use('/searchEmail', searchEmail);
app.use('/verifyEmailCode', verifyEmailCode);
app.use('/updatePassword', updatePassword);
app.use('/updateEmail', updateEmail);



app.get('/test', function(request, response){
    response.send({data:"test"});
});


app.listen(config.port, function(){
    console.log('Server running on http://localhost:9900');
});