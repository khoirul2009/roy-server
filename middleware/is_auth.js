export default function isAuth (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please login to view that resource')
    res.redirect('/login');
}
