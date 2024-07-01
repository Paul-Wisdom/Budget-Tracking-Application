const supertest = require('supertest');
const createServer = require('../utils/createServer');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');
const Verification = require('../models/userVerification')
const transporter = require('../utils/nodemailer-transporter');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const NewPassword = require('../models/newPassword');

jest.mock('../models/newPassword', () => {
    const NewPassword = jest.fn();
    NewPassword.findOne= jest.fn();
    NewPassword.destroy = jest.fn();
    NewPassword.create = jest.fn()

    return NewPassword;
})
jest.mock('../models/userVerification', () => {
    const Verification = jest.fn();
    Verification.create = jest.fn();
    Verification.findOne = jest.fn();
    Verification.destroy =  jest.fn();

    return Verification;
});
jest.mock('../utils/nodemailer-transporter', () => {
    const transporter = jest.fn();
    transporter.sendMail = jest.fn();
    transporter.verify = jest.fn();

    return transporter;
})
jest.mock('bcryptjs', () => {
    const bcrypt = jest.fn();
    bcrypt.hash = jest.fn().mockImplementation(async (param, salt) => {
        return (`hashed${param}`);
    });
    bcrypt.compare = jest.fn().mockImplementation(async (password, hashedPassword) => {
        return hashedPassword === `hashed${password}`;
    })

    return bcrypt;
});
jest.mock('../models/user', () => {
    
    const User = jest.fn();
    User.hasMany = jest.fn();
    User.findOne = jest.fn();
    User.create = jest.fn();

    return User// : {
        //     findOne: jest.fn()
        // }
});

const app = createServer();

describe('Testing Users', () => {
    describe('Signing up', () => {
        it('without password should return 400 error', async () => {
           const response = await supertest(app).post('/api/signup').send({name: "john", email:"test@test.com"});
            expect(response.status).toBe(400);
            expect(User.findOne).not.toHaveBeenCalled();
        });
        it('without email should return 400 error', async () => {
            const response = await supertest(app).post('/api/signup').send({name: "john", password:"password"});
            expect(response.status).toBe(400);
            expect(User.findOne).not.toHaveBeenCalled();
        });
        it('without username should return 400 error', async () => {
            const response = await supertest(app).post('/api/signup').send({password: "password", email:"test@test.com"});
            expect(response.status).toBe(400);
            expect(User.findOne).not.toHaveBeenCalled();
        });
        it('with existing email should return 409', async () => {
            const input = {name: "james", email: "test@test.com", password: "password"};
            const mockUser = {username: "john", email: "test@test.com", id: 1, password: "password"};
            console.log(User);
            User.findOne.mockResolvedValue(mockUser);
            // User.hasMany.mockResolvedValue(mockUser);
            const response = await supertest(app).post('/api/signup').send(input);
            expect(response.status).toBe(409);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.create).not.toHaveBeenCalled();
        });
        it('with existing username should return 409', async () => {
            const input = {name: "john", email: "jest@test.com", password: "password"};
            const mockUser = {username: "john", email: "test@test.com", id: 1, password: "password"};
            console.log(User);
            // User.findOne.mockResolvedValue(mockUser);
            // User.hasMany.mockResolvedValue(mockUser);
            User.findOne.mockImplementation(async (query) => {
                if(query.where.email)
                    {
                        return Promise.resolve(null);
                    }
                else{
                    return Promise.resolve(mockUser);
                }
            })
            const response = await supertest(app).post('/api/signup').send(input);
            expect(response.status).toBe(409);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.create).not.toHaveBeenCalled();
        });
        it('with valid credentials should return 200 status', async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password"};
            const mockVerification = {userId: 1, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}
            console.log(User);
            User.findOne.mockResolvedValue(null);
            // bcrypt.hash.mockResolvedValue("hashedpassword");
            const hashedPwd = await bcrypt.hash("password", 12);
            User.create.mockResolvedValue({... mockUser, password: hashedPwd, verified: false});
            const hashedstring = await bcrypt.hash("string", 12);
            Verification.create.mockResolvedValue({...mockVerification, string: hashedstring});
            transporter.sendMail.mockResolvedValue("mail sent");
            transporter.verify.mockResolvedValue("success");
            // User.hasMany.mockResolvedValue(mockUser);
            const response = await supertest(app).post('/api/signup').send(mockUser);
            expect(response.status).toBe(200);
            expect(User.findOne).toHaveBeenCalledTimes(2);
            expect(User.create).toHaveBeenCalledTimes(1);
        })
    })
    describe("Signing in", () => {
        it("with an unregistered mail should return 400", async () => {
            const input = {email: "test@test.com", password: "password"};
            User.findOne.mockResolvedValue(null);
            const response = await supertest(app).post('/api/signin').send(input);

            expect(response.status).toBe(401);
        });
        it("with registerd email and correct password but unverified acct should return 403", async () => {
            const input = {email: "test@test.com", password: "password"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "hashedpassword", verified: false};
            User.findOne.mockResolvedValue(mockUser);
            const match = await bcrypt.compare(input.password, mockUser.password)
            const response = await supertest(app).post('/api/signin').send(input);

            expect(match).toBe(true);
            expect(response.status).toBe(403);
        });
        it("with verifed acct and wrong password should return 400", async () => {
            const input = {email: "test@test.com", password: "wrongpassword"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "hashedpassword", verified: false};
            User.findOne.mockResolvedValue(mockUser);
            const match = await bcrypt.compare(input.password, mockUser.password)
            const response = await supertest(app).post('/api/signin').send(input);

            expect(match).toBe(false);
            expect(response.status).toBe(401);
        });
        it("with verified acct and correct password should return 200", async () => {
            const input = {email: "test@test.com", password: "password"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "hashedpassword", verified: true};
            User.findOne.mockResolvedValue(mockUser);
            const match = await bcrypt.compare(input.password, mockUser.password)
            const response = await supertest(app).post('/api/signin').send(input);

            expect(match).toBe(true);
            expect(response.status).toBe(200);
        })
    })
    describe("signing out", () => {
        let token;
        it("without token should return 401", async() => {
            // token = jwt.sign({id: 1}, 'key', {expiresIn: '1h'});
            // jwt.verify.mockRejectedValue(new Error ("invalid token"));
            const response = (await supertest(app).post('/api/signout'));
            console.log(response.text["message"]);
            expect(response.status).toBe(401);
            // expect(response.text).toBe({message: "No token detected"});
        })

        it("with invalid token should return 401", async() => {
            token = jwt.sign({id: 1}, 'key', {expiresIn: '1h'});
            // jwt.verify.mockRejectedValue(new Error ("invalid token"));
            const response = (await supertest(app).post('/api/signout').set('Cookie', `jwt=${token}`));

            expect(response.status).toBe(401);
        })

        it("with valid token returns 200", async() => {
            token = jwt.sign({id: 1},config.secretKey , {expiresIn: '1h'});
            // jwt.verify.mockRejectedValue(new Error ("invalid token"));
            const response = (await supertest(app).post('/api/signout').set('Cookie', `jwt=${token}`));
            // console.log(response.headers);
            expect(response.status).toBe(200);
            // expect(response.res.Cookie['jwt']).toBe("");
        })
    })
    describe("changing passwords", () => {
        it("without New password should return 400",async () => {
            const input = {email: "test@test.com"};
            const response = await supertest(app).post('/api/change-password').send(input);

            expect(response.status).toBe(400);
        });

        it("without email should return 400", async () => {
            const input = {newPassword: "newPassword"};
            const response = await supertest(app).post('/api/change-password').send(input);

            expect(response.status).toBe(400);

        });

        it("without registered mail should return 401", async () => {
            const input = {email: "test@test.com", newPassword: "newPassword"};
            User.findOne.mockResolvedValue(null);
            const response = await supertest(app).post('/api/change-password').send(input);

            expect(response.status).toBe(404);
        });

        it("when unverified should return 403", async () => {
            const input = {email: "test@test.com", newPassword: "newPassword"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: false};
            const mockVerification = {userId: mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            const mockNewPassword = {password: "pass", userId : mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}
            User.findOne.mockResolvedValue(mockUser);
            NewPassword.findOne.mockResolvedValue(mockNewPassword);
            const newPasswordMock = await NewPassword.findOne();
            newPasswordMock.destroy = jest.fn().mockResolvedValue("success");
            Verification.findOne.mockResolvedValue(mockVerification);
            const verificationMock = await Verification.findOne();
            verificationMock.destroy = jest.fn().mockResolvedValue("success");
            // const pass = await bcrypt.hash(input.newPassword,12);
            const response = await supertest(app).post('/api/change-password').send(input);

            expect(response.status).toBe(403);
        })

        it("when verified should work even if prior attempt has been made and return 200", async () => {
            const input = {email: "test@test.com", newPassword: "newPassword"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockVerification = {userId: mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            const mockNewPassword = {password: "pass", userId : mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}
            User.findOne.mockResolvedValue(mockUser);
            NewPassword.findOne.mockResolvedValue(mockNewPassword);
            const newPasswordMock = await NewPassword.findOne();
            newPasswordMock.destroy = jest.fn().mockResolvedValue("success");
            Verification.findOne.mockResolvedValue(mockVerification);
            const verificationMock = await Verification.findOne();
            verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const pass = await bcrypt.hash(input.newPassword,12);
            NewPassword.create({...mockNewPassword, password: pass});
            const uniqueString = uuidv4() + mockUser.id;
            const str = await bcrypt.hash(uniqueString, 12);
            Verification.create.mockResolvedValue({...mockVerification, string: str});

            transporter.sendMail.mockResolvedValue("mail sent");
            transporter.verify.mockResolvedValue("success");
            const response = await supertest(app).post('/api/change-password').send(input);

            expect(response.status).toBe(200);
        });

        it("without prior attempts to do so should work and return 200", async () => {
            const input = {email: "test@test.com", newPassword: "newPassword"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockVerification = {userId: mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            const mockNewPassword = {password: "pass", userId : mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}
            User.findOne.mockResolvedValue(mockUser);
            NewPassword.findOne.mockResolvedValue(null);
            // const newPasswordMock = await NewPassword.findOne();
            // newPasswordMock.destroy = jest.fn().mockResolvedValue("success");
            // Verification.findOne.mockResolvedValue(mockVerification);
            // const verificationMock = await Verification.findOne();
            // verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const pass = await bcrypt.hash(input.newPassword,12);
            NewPassword.create({...mockNewPassword, password: pass});
            const uniqueString = uuidv4() + mockUser.id;
            const str = await bcrypt.hash(uniqueString, 12);
            Verification.create.mockResolvedValue({...mockVerification, string: str});

            transporter.sendMail.mockResolvedValue("mail sent");
            transporter.verify.mockResolvedValue("success");
            const response = await supertest(app).post('/api/change-password').send(input);

            expect(response.status).toBe(200);
        });

    });
    describe("verifying password change", () => {
        it("when user data does not exist on the verfication db should return 404", async () => {
            Verification.findOne.mockResolvedValue(null);
            const response = await supertest(app).get('/api/verify/chpwd/1/uniqueString');

            expect(response.status).toBe(404)

        });

        it("when user data  exists on the verfication db but has expired should return 403", async () => {
            const mockVerification = {userId: 1, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() - (7 * 60 * 60 * 1000)}; //expires 7hrs ago
            Verification.findOne.mockResolvedValue(mockVerification);
            verificationMock = await Verification.findOne();
            verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).get('/api/verify/chpwd/1/uniqueString');

            expect(response.status).toBe(403)
        });
        it("when user data  exist on the verfication db and is not expired but the unique string does not match should return 401", async () => {
            const data = {id: 1, string: "fakeString"}
            const mockVerification = {userId: data.id, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            Verification.findOne.mockResolvedValue(mockVerification);
            // verificationMock = await Verification.findOne();
            // verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const match = await bcrypt.compare(data.string, mockVerification.string)
            const response = await supertest(app).get(`/api/verify/chpwd/1/${data.string}`)

            expect(response.status).toBe(401);
            expect(match).toBe(false);
        });
        it("when user data  exist on the verfication db, is not expired and the unique string matches but no newPassword is associated with the user should return 404", async () => {
            const data ={id: 1, string: 'uniqueString'};
            const mockVerification = {userId: data.id, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            Verification.findOne.mockResolvedValue(mockVerification);
            // verificationMock = await Verification.findOne();
            // verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const match = await bcrypt.compare(data.string, mockVerification.string);
            NewPassword.findOne.mockResolvedValue(null);
            const response = await supertest(app).get(`/api/verify/chpwd/1/${data.string}`);

            expect(response.status).toBe(404);
            expect(match).toBe(true);
        });
        it("when user data  exist on the verfication db, is not expired and the unique string matches,  newPassword is associated with the user but has expired should return 403", async () => {
            const data ={id: 1, string: 'uniqueString'};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockVerification = {userId: data.id, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            const mockNewPassword = {password: "pass", userId : mockUser.id, createdAt: Date.now(), expiresAt: Date.now() - (7 * 60 * 60 * 1000)}
            Verification.findOne.mockResolvedValue(mockVerification);
            // verificationMock = await Verification.findOne();
            // verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const match = await bcrypt.compare(data.string, mockVerification.string);
            NewPassword.findOne.mockResolvedValue(mockNewPassword);
            const newPasswordMock = await NewPassword.findOne();
            newPasswordMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).get(`/api/verify/chpwd/1/${data.string}`);

            expect(response.status).toBe(403);
            expect(match).toBe(true);
        });
        it("when user data  exist on the verfication db, is not expired and the unique string matches,  newPassword is associated with the user, is not expired and the server does not encounter issues changing password should return 200", async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const data ={id: 1, string: 'uniqueString'};
            const mockVerification = {userId: data.id, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)};
            const mockNewPassword = {password: "pass", userId : mockUser.id, createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}
            Verification.findOne.mockResolvedValue(mockVerification);
            const match = await bcrypt.compare(data.string, mockVerification.string);
            NewPassword.findOne.mockResolvedValue(mockNewPassword);
            User.findOne.mockResolvedValue(mockUser);
            const userMock = await User.findOne();
            userMock.set = jest.fn().mockResolvedValue({...mockUser, password: mockNewPassword.password});
            const userSave = await userMock.set();
            userSave.save = jest.fn().mockResolvedValue("success");
            const newPasswordMock = await NewPassword.findOne();
            newPasswordMock.destroy = jest.fn().mockResolvedValue("success");
            verificationMock = await Verification.findOne();
            verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).get(`/api/verify/chpwd/1/${data.string}`);

            expect(response.status).toBe(200);
            expect(match).toBe(true);
        });
        // it("when user data  exist on the verfication db, is not expired and the unique string matches,  newPassword is associated with the user, is not expired but the server  encounters issues changing password should return 500", async () => {

        // });
    
    });
    describe("verifying account", () => {
        it("when user verification data does not exist on db should return 404", async () => {
            const data = {id: 1, string: "uniqueString"};
            Verification.findOne.mockResolvedValue(null);
            const response = await supertest(app).get(`/api/verify/signup/1/${data.string}`);

            expect(response.status).toBe(404) 
        });

        it("when user verification data exists on db but is expired should return 403", async () => {
            const data = {id: 1, string: "uniqueString"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: false};
            const mockVerification = {userId: 1, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() - (7 * 60 * 60 * 1000)}; //expires 7hrs ago
            Verification.findOne.mockResolvedValue(mockVerification);
            const verificationMock = await Verification.findOne();
            verificationMock.destroy = jest.fn().mockResolvedValue("success");
            User.findOne.mockResolvedValue(mockUser);
            const userMock = await User.findOne();
            userMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).get(`/api/verify/signup/1/${data.string}`);

            expect(response.status).toBe(403) 
        });

        it("when user verification data exists on db, is not expired but unique string does not match should return 401", async () => {
            const data = {id: 1, string: "fakeuniqueString"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: false};
            const mockVerification = {userId: 1, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}; //expires 7hrs ago
            Verification.findOne.mockResolvedValue(mockVerification);
            const match = await bcrypt.compare(data.string, mockVerification.string);
            // const verificationMock = await Verification.findOne();
            // verificationMock.destroy = jest.fn().mockResolvedValue("success");
            // User.findOne.mockResolvedValue(mockUser);
            // const userMock = await User.findOne();
            // userMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).get(`/api/verify/signup/1/${data.string}`);

            expect(response.status).toBe(401) 
            expect(match).toBe(false);
        });

        it("when user verification data exists on db, is not expired and unique string matches should return 200", async () => {
            const data = {id: 1, string: "uniqueString"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: false};
            const mockVerification = {userId: 1, string:"hasheduniqueString", createdAt: Date.now(), expiresAt: Date.now() + (6 * 60 * 60 * 1000)}; //expires 7hrs ago
            Verification.findOne.mockResolvedValue(mockVerification);
            const match = await bcrypt.compare(data.string, mockVerification.string);
            User.findOne.mockResolvedValue(mockUser);
            const userMock = await User.findOne();
            userMock.set = jest.fn().mockResolvedValue({...mockUser, verified: true});
            const userSave = await userMock.set();
            userSave.save = jest.fn().mockResolvedValue("success");
            const verificationMock = await Verification.findOne();
            verificationMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).get(`/api/verify/signup/1/${data.string}`);

            expect(response.status).toBe(200) 
            expect(match).toBe(true);
        });
    })
})