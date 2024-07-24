'use strict'

import express from 'express';
import {Server} from "socket.io";
import http from 'http';
import hbs from "express-handlebars";
import os from 'os';
import connect from "./socket.js";
import { fileURLToPath } from 'url';
import {dirname} from "path";
import session from "express-session"
import flash from "connect-flash"
import passport from "passport"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import PassportConfig from "./config/passport.js";
import loginRoute from "./routes/login.js"
import User from "./model/User.js";
import bcrypt from "bcryptjs";
import isAuth from "./middleware/is_auth.js";

PassportConfig(passport);

const db = 'mongodb://localhost:27017/rearguard';

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


const app = express();
app.set('port', 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = http.createServer(app);
const router = express.Router();
const io = new Server(server);
const socket = () => connect(io, os);



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use('/', router);
app.use('/js', express.static(__dirname + '/js'));
app.engine('.hbs', hbs.engine({
    extname: '.hbs',
    defaultLayout: '',
    layoutsDir: ''
}));
app.set('view engine', '.hbs');






app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

let dataObject = {
    osType: (os.type().toLowerCase() === 'darwin') ? 'Mac OS X' : os.type(),
    osReleaseVersion: os.release(),
    osArch: os.arch(),
    osCPUs: os.cpus(),
    osHostname: os.hostname(),
    osTotalMemory: Number(os.totalmem() / 1073741824).toFixed(0)
};

async function initUser ()  {
    const user  = await User.findOne({id: 1})
    if(!user) {
        const newUser = new User({
            username: 'admin',
            password: 'admin',
            id: 1,
            name: 'admin'
        })

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(user => {
                       console.log('sucess')
                    })
                    .catch(err => console.log(err));
            });
        })
    }
}


initUser()

const indexRoute = (req, res) => {
    res.render(__dirname + '/index', { data: dataObject});
};
const topRoute = (req, res) => {
    res.render(__dirname + '/top');
}

router.route('/').get(isAuth, indexRoute);
router.route('/apps-monitor').get(topRoute);

app.use(loginRoute)

socket();

server.listen(3000, () => {
    console.log('Magic happens on port ' + app.get('port'));
});



