import express from "express";
import passport from "passport";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import isAuth from "../middleware/is_auth.js";

const router = express.Router();


router.get('/login', (req, res) => res.render('login.hbs'))
router.post('/login',  (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
})
router.get('/logout', isAuth ,(req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

router.post('/reset-password', async (req, res) => {

    const {password, confirm_password, userId} = req.body;
    if(password !== confirm_password) {
        req.flash('error_msg', 'Password dan Konfirmasi Password tidak cocok')
        return res.redirect('/config')
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.findOneAndUpdate({id: userId}, {
        password: hashed
    });

    req.flash('success_msg', 'Password berhasil diubah');

    return res.redirect('/config');
})

export  default  router;
