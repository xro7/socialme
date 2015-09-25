var site = require('./routes/site');
var auth = require('./routes/auth');

module.exports = function(app,database){
	/*app.get('*',function(req,res,next) {
		if (req.session.user) {
			res.locals.user = req.session.user || null;
		}
		next();
	});*/
	
	app.post('/login',auth.post_login(database));	
	app.post('/register',auth.post_register(database));
	app.post('/tweet',site.post_tweet(database));
	app.get('/',site.index);
	app.get('/home',site.home(database));

	app.get('/user/:user',site.get_user(database));
	app.get('/logout',auth.get_logout);
	app.get('/follow/:id',site.get_follow(database));
	app.get('/unfollow/:id',site.get_unfollow(database));
	app.get('/settings',site.settings(database));
	app.get('/users',site.users(database));
	app.post('/upload',site.upload(database));
};