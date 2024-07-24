import passport from "passport-local"
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import User from "../model/User.js"

const LocalStrategy = passport.Strategy;


export default function PassportConfig (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            // Match user
            User.findOne({username})
                .then(user => {
                    if (!user) {
                        console.log('asu')
                        return done(null, false, { message: 'That username is not found' });
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {

                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {

                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                })
                .catch(err => console.error(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findOne({ id: id });  // Use the custom id field
            if (user) {
                done(null, user);
            } else {
                done(new Error('User not found'));
            }
        } catch (err) {
            done(err);
        }
    });
};
