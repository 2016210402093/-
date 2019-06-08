let express = require('express');
let bodyParser = require('body-parser');
let config = require("./config");
let app = express();
let server = require('http').Server(app)
let io = require('socket.io')(server)

const port = config.port;


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


const sendMail = require('./middleware/sendMail');
const register = require('./middleware/register');
const login = require('./middleware/login');
const searchEmail = require('./middleware/searchEmail');
const verifyEmailCode = require('./middleware/verifyEmailCode');
const updatePassword = require('./middleware/updatePassword');
const updateEmail = require('./middleware/updateEmail');
const getUserInfo = require('./middleware/getUserInfo');
const updateUserInfo = require('./middleware/updateUserInfo');
const updateUserImg = require('./middleware/updateUserImg');
const querryTasks = require('./middleware/querryTasks');
const addTask = require('./middleware/addTask');
const completeTask = require('./middleware/completeTask');
const addClock = require('./middleware/addClock');
const queryClockInfo = require('./middleware/queryClockInfo');
const addEssay = require('./middleware/addEssay');
const queryEssayInfo = require('./middleware/queryEssayInfo');
const querySchoolInfo = require('./middleware/querySchoolInfo');
const searchEssay = require('./middleware/searchEssay');
const isLike = require('./middleware/isLike');
const searchConcernedPerson = require('./middleware/searchConcernedPerson');
const searchCollectEssay = require('./middleware/searchCollectEssay');
const isConcernedUser = require('./middleware/isConcernedUser');
const isCollectEssay = require('./middleware/isCollectEssay');
const deleteEssay = require('./middleware/deleteEssay');
const getEssayDetail = require('./middleware/getEssayDetail');
const getOtherEssayDetail = require('./middleware/getOtherEssayDetail');
const getConcernedNum = require('./middleware/getConcernedNum');
const getFileInfo = require('./middleware/getFileInfo');
const addComment = require('./middleware/addComment');
const getCommentInfo = require('./middleware/getCommentInfo');


app.use(express.static('public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/sendMail', sendMail);
app.use('/register', register);
app.use('/login', login);
app.use('/searchEmail', searchEmail);
app.use('/verifyEmailCode', verifyEmailCode);
app.use('/updatePassword', updatePassword);
app.use('/updateEmail', updateEmail);
app.use('/getUserInfo', getUserInfo);
app.use('/updateUserInfo', updateUserInfo);
app.use('/updateUserImg', updateUserImg);
app.use('/querryTasks', querryTasks);
app.use('/addTask', addTask);
app.use('/completeTask', completeTask);
app.use('/addClock', addClock);
app.use('/queryClockInfo', queryClockInfo);
app.use('/addEssay', addEssay);
app.use('/queryEssayInfo', queryEssayInfo);
app.use('/querySchoolInfo', querySchoolInfo);
app.use('/searchEssay', searchEssay);
app.use('/isLike', isLike);
app.use('/searchConcernedPerson', searchConcernedPerson);
app.use('/searchCollectEssay', searchCollectEssay);
app.use('/isConcernedUser', isConcernedUser);
app.use('/isCollectEssay', isCollectEssay);
app.use('/deleteEssay', deleteEssay);
app.use('/getEssayDetail', getEssayDetail);
app.use('/getOtherEssayDetail', getOtherEssayDetail);
app.use('/getConcernedNum', getConcernedNum);
app.use('/getFileInfo', getFileInfo);
app.use('/addComment', addComment);
app.use('/getCommentInfo', getCommentInfo);


server.listen(5000);
io.on('connection', (socket) => {
  console.log('和客户端建立连接'+socket.id)
  socket.on('message', (data) => {
      console.log(data)
      io.emit('server-message', data) // 服务器给客户端发送数据 在线聊天室
  })
})


app.listen(config.port, function(){
    console.log('Server running on http://localhost:9900');
});