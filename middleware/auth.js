const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            return res.redirect('/dashboard');
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = { isLogin, isLogout };
