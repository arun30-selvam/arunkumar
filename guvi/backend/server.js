const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Router = express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express()
const port = 3001
const  RegisterModel = require('./register');
const saltRounds = 10;

//DB connection
mongoose.connect('mongodb://localhost/data',function(err,res){
 if(err){
     console.log('-=-=-=-=err===-==',err);
 }else{
     console.log('----- db connected sucessfully');
 }
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
//
app.post('/register', (req, res) => {
   let name=req.body.name;
   let email=req.body.email;
   let pass=req.body.pass;
   let re_pass=req.body.re_pass
   let phone=req.body.phone
   let country=req.body.country
   
   if (!name) {
    res.send({ status: 0, msg: 'Name is required' })
} else {
    if (name.length < 3) {
        res.send({ status: 0, msg: 'name length atleast 3 characters' })
    }
}   
if (!email) {
    res.send({ status: 0, msg: 'Email is Required' })
}  else{
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
    }else{
        res.send({ status: 0, msg: 'Invaild Email' })
    }
}
if (!pass) {
    res.send({ status: 0, msg: 'Password is Required' })
}
 if (pass == re_pass) {
} else{
    res.send({ status: 0, msg: 'Password Does Not Match' })
}  
   if(name) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.pass, salt);
    var newRegister = new RegisterModel(
        {
            name:name,
            email:email,
            pass:hash,
            phone:phone,
            country:country,
        }
    );
    newRegister.save(function(err,data)
    {
        if(err){
            res.send(err);
        }else{
            jwt.sign({ email: email, type: 'user' }, 'guvi',{ expiresIn: "120s" } , (err, token) => {
                if (token) {
                  res.statusMessage = "Registered in successfully";
                  let formData = {token:token}
                  return res.status(200).json(formData);
                }
              });
        }
    });}
})


app.post('/signin', (req, res) => {
    let email = req.body.your_name;
    let your_pass = req.body.your_pass;
    RegisterModel.findOne({ email:email }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            if (data == null) {
                res.send({ status: 0, msg: 'invalid email' })
            } else {
              
                let hashedPwd = data.pass;
                let resultPwd = bcrypt.compareSync(your_pass, hashedPwd);
                if (resultPwd) {
                   jwt.sign({ email: email, type: 'user' }, 'guvi',{ expiresIn: "1h" } , (err, token) => {
                        if (token) {
                          res.statusMessage = "login in successfully";
                        res.send({token:token})
                          return res.status(200).json(formData);
                        }else {
                            res.json({message:err})
                        }
                      });
                } else {
                    res.send({ status: 0, msg: 'invalid password' })
                }
            }
        }
    });
})
app.post('/getuser', (req, res) => {
    let Token = req.body.Token;
    console.log("===Token=====",Token);
    var decoded = jwt.decode(Token);
    console.log("===decoded==",decoded);
    var decoded_email=decoded.email
    console.log("===decoded=email===",decoded_email);
   /* jwt.verify(token, 'guvi', (err, data) => {
        RegisterModel.findOne({ email:data.email }, function (err, result) {
            if (err) {
                res.send(err)
            } else {
                return res.status(200).json(result);
            }
        });
    });*/
    RegisterModel.findOne({ email:decoded_email }, function (err, data) {
        if (err) {
            res.send(err);
            console.log("=======1=");
        } else {
            if (data) {
                console.log("=======2=");
                res.send(data)
                
            } 
        }
    });
})
module.exports = Router;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })