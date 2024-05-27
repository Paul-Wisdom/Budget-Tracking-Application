const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();

const User = require('../models/user')
const config = require('../config/auth.config');
const Verification = require("../models/userVerification");
const NewPassword = require("../models/newPassword");

console.log(process.env.AUTH_PASS);
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    },
    authMethod: 'PLAIN'
})

transporter.verify((error, success) => {
    if(error){
        console.log(error)
    }
    else{
        console.log(success);
        console.log("transporter is working")
    }
})

const sendVerificationMail= ({id, email}, res, type) => {
    const currentUrl = "http://localhost:3001/";
    const uniqueString = uuidv4() + id;
    let body;
    let url;

    if (type == 0)
        {
            url = currentUrl + "api/verify/signup/" + id +  '/' + uniqueString;
            body = `<p>Verify your email address to complete registration process <a href="${currentUrl + "api/verify/" + id +  '/' + uniqueString } >here</a></p>
            <p>Expires in <b>6 hours</b></p>`
        }
        else{
            url= currentUrl + "api/verify/chpwd/" + id +  '/' + uniqueString;
                body = `<p>Verify your email address to change password <a href="${currentUrl + "api/verify/" + id +  '/' + uniqueString} >here</a></p>
                    <p>Expires in <b>6 hours</b></p>`
        }
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "verify your email",
        html: body
    }
    console.log(url);
    bcrypt.hash(uniqueString, 12).then(hashedstr => {
       return Verification.create({userId: id, string: hashedstr, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)});
    }).then(result => {
        console.log(result);
        return transporter.sendMail(mailOptions);
    }).then(result => {
        console.log(result);
        res.json({message: "Email has been sent", error: false});
    }).catch(err => {
        console.log(err);
    })
}

const getAccountVerification = (req, res, next) => {
    const id = req.params.id;
    const uniqueString = req.params.uniqueString;

    console.log(id, uniqueString)
    let v2;
    let msg = ["Account does not exist or has been verified","Link has expired. SignUp again", "Email verified"];
  
    Verification.findOne({where : {userId : id}}).then(verif => {
        if(!verif)
            {
                res.status(401).send({messge: msg[0], error: true})
            }
        if(Date.now > verif.expiresAt)
            {
                verif.destroy().then(result => {
                    return User.findOne({where: {id: id}})
                }).then(user =>{
                    return user.destroy();
                }).then(result => {
                    res.status(401).send({message: msg[1], error: true});
                }).catch(err => {
                    console.log(err);
                })
            }
            v2 = verif;
        return bcrypt.compare(uniqueString, verif.string);
    }).then(match => {
        console.log("unique match?", match)
        if(match)
            {
                User.findOne({where: {id: id}}).then(user => {
                    return user.set({verified: true});
                }).then(result => {
                    result.save();
                    v2.destroy().then(result => {
                        res.json({message: msg[2], error: false})
                    })
                }).catch(err => {
                    console.log(err);
                    res.json({message: "Error verifing email", error: true})
                })
            }
            else{
                return res.json({message: "Invalid link", error: true});
            }

    }).catch(err => {
        console.log(err);
        return res.json({message: "Error verifing email", error: true})
    })
}
const postSignUp = (req, res, next) => {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    console.log(name, email, typeof(password));

    User.findOne({where: {username: name}}).then(user => {
        if(user)
        {
           return res.status(403).send({message: "username already in use", error: true});
        }
        return User.findOne({where: {email: email}})
        
    }).then(user => {
        if(user)
        {
           return res.status(403).send({message: "Email already in use", error: true});
        }
        console.log("good to go");
        return  bcrypt.hash(password, 12);
    }).then(hashedPwd => {
            return User.create({username: name, email: email, password: hashedPwd, verified: false})
        }).then(result => {
            console.log(result);
            //send verification mail
            let type = 0 //0 for account creation 1 for password change
            sendVerificationMail(result, res, type);
        //    return res.json({message: "sign  up successful"}); //redirect after successful sign up
        }).catch(err => {
            console.log(err);
    })
}

const postSignIn = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loggedUser;

    User.findOne({where: {email: email}}).then(user => {
        if(!user)
        {
            res.status(401).send({message: "wrong email or password", error: true});
        }

        loggedUser = user;

        return bcrypt.compare(password, user.password);
    }).then(match => {
        if(match)
        {   
            if(loggedUser.verified == false)
                {
                    res.status(401).send({message: "user not verified", error: true});
                }
            console.log('logged in');
            const token = jwt.sign({id: loggedUser.id, name: loggedUser.username}, config.secretKey, {algorithm: 'HS256', expiresIn: '1h'});
            let cookieOptions = {
                expires: new Date(
                    Date.now() + 1 * 24 * 60 * 60 * 1000 //a day in ms
                ),
                httpOnly: true
            }
            res.cookie("jwt", token, cookieOptions);
            // res.json(token);
            res.json({message: "cSign In successful, cookie has been sent to browser", error: false});
        }
        res.status(403).send({message: "wrong email or password", error: true});
    }).catch(err => {
        console.log(err);
    })

}

const protectedRoute = (req, res, next) => {
    const cookies = req.headers.cookie;
    let token;
    if(cookies){
        const cookieArray = cookies.split(';');
        const cookieMap = {};
        cookieArray.forEach(cookie => {
            const parts = cookie.split('=');
            const name = parts[0];
            const value = parts[1];
            cookieMap[name] = value;
        });
        token = cookieMap.jwt;
        // console.log("token", t);
    }
    // const token = req.headers['authorization'].split(' ')[1];
    console.log(token);
    if(!token)
    {
        res.status(401).send({message: "No token detected"});
    }
    jwt.verify(token, config.secretKey, (err, decoded) => {
        if(err){
            console.log(err);
            res.status(401).send({message: "Invalid token detected", error: true});
        }

        if(!err)
            {
                console.log(decoded);
                req.user_id = decoded.id;
                next();
            }
    })
}

const postSignOut = (req, res, next) => {
    res.cookie("jwt", "");
    res.json({message: "User signed out", error: false});
}

const postPasswordChange = (req, res, next) => {
    const user_id = req.user_id;
    const type = 1;
    const newPassword = req.body.newPassword;
    let Pwd;
    console.log("password ",newPassword);

    NewPassword.findOne({where: {userId: user_id}}).then(result => {
        if(result)
            {
                result.destroy().then(result => {
                    Verification.findOne({where: {userId: user_id}}).then(result => {
                        result.destroy();
                    })
                });
            }
            bcrypt.hash(newPassword, 12).then(hashedPwd => {
                Pwd = hashedPwd;
                return User.findOne({where : {id : user_id}})
            }).then(user => {
                console.log(user);
                if( user && user.verified === true)
                    {
                        NewPassword.create({password: Pwd, userId : user_id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)})
                        sendVerificationMail(user, res, type)
                    }
                else{
                    return res.json({message: "This user is not verified", error: true});
                }
            })
    })
}


//after clicking the link sent to email the user should enter his new password which is sent to the db for saving
const getPasswordVerification = (req, res, next) => {

    const id = req.params.id;
    const uniqueString = req.params.uniqueString;

    console.log(id, uniqueString)
    let v2;
    let n2;

    let msg = ["Account does not exist or password changed", "Link has expired, Click on forgot password again", "Password changed successfully"];
    Verification.findOne({where : {userId : id}}).then(verif => {
        if(!verif)
            {
                res.status(401).send({messge: msg[0], error: true})
            }
        if(Date.now > verif.expiresAt)
            {
                verif.destroy().then(result => {
                    res.status(401).send({message: msg[1], error: true});
                }).catch(err => {
                    console.log(err);
                })
            }
            v2 = verif;
        return bcrypt.compare(uniqueString, verif.string);
    }).then(match => {
        console.log("unique match?", match)
        if(match)
            {
                NewPassword.findOne({where: {userId : id}}).then(result => {
                if(!result)
                    {
                        res.status(401).send({messge: msg[0], error: true})
                    }
                if(Date.now > result.expiresAt)
                    {
                        result.destroy().then(result => {
                        res.status(401).send({message: msg[1], error: true});
                        }).catch(err => {
                        console.log(err); })
                    }
                    n2 = result;
                    return User.findOne({where: {id: id}})
                    }).then(user => {
                        return user.set({password: n2.password})
                    }).then(result => {
                        return result.save();
                    }).then(result=> {
                        return v2.destroy();
                    }).then(result=> {
                        return n2.destroy();
                    }).then(result=> {
                        res.json({message: msg[2], error: false});
                    }).catch(err => {
                        console.log(err);
                        res.json({message: "Error verifing email", error: true})
                    })

            }
            else{
                return res.json({message: "Invalid link", error: true});
            }

    }).catch(err => {
        console.log(err);
        return res.json({message: "Error verifing email", error: true})
    })
}


module.exports = {
    postSignUp,
    postSignIn,
    postSignOut,
    protectedRoute,
    getAccountVerification,
    postPasswordChange,
    getPasswordVerification
}