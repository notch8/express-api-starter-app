var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors')
var app = express();
var User = require('./models').User

app.use(express.static('public'))
app.use(bodyParser.json())

const corsOptions = {
  origin: 'http://localhost:3000'
}
app.use(cors())

const authorization = function(request, response, next){
  const token = request.query.authToken || request.body.authToken
  if(token){
    User.findOne({
      where: {authToken: token}
    }).then((user)=>{
      if(user){
        request.currentUser = user
        next()
      }else{
        response.status(401)
        response.json({message:'Authorization Token Invalid'})
      }
    })
  }else{
    response.status(401)
    response.json({message: 'Authorization Token Required'})
  }
}

app.get('/', function (request, response) {
  response.json({message: 'API Example App'})
});

app.post('/login', function(request, response){
  User.findOne({
    where: {email: request.body.email}
  }).then((user)=>{
    if(user && user.verifyPassword(request.body.password)){
      response.json({
        message: 'Success!',
        user: user
      })
    }else{
      response.status(404)
      response.json({message: 'Invalid Credentials'})
    }
  })
})

app.get('/user', 
authorization,
function(request, response){
  response.json({user: request.currentUser}) 
})

app.post('/users', function(request, response){
  console.log('params', request.body)
  User.create(
    {
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password
    }
  ).then((user)=>{
    response.json({
      message: 'success',
      user: user
    })
  }).catch((error)=>{
    response.status(400)
    response.json({
      message: "Unable to create User",
      errors: error.errors
    })
  })
})

app.listen(4000, function () {
 console.log('Todo Server listening on port 4000!');
});
