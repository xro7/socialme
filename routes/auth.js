//var crypto = require['crypto'];
var fs = require('fs');


exports.post_login = function(database) {
	return function(req,res){
		var email = req.body.email;
		var password = req.body.password;
		if (email && password) {
		//	password = crypto.createHash('md5').update(password).digest('hex');
			database.query('select * from user where email=? and password=?',[email,password],function(error,result){
				if (error) {
					console.log(error);
					return res.redirect('/');
				}

				if (result.length ==1) {
					req.session.user = result[0];
					
					return res.redirect('/home');
					//return res.render('home',{message:'',user : req.session.user});//my stuff here
				} else{
					return res.redirect('/');
				}

			});
		}else{
			return res.redirect('/');
		}
	}
}

exports.post_register = function(database){
	return function(req,res){
		var email = req.body.email;
		var name = req.body.name;
		var password = req.body.password;
		var rpassword = req.body.rpassword;
		if (email && name && password && rpassword){
			if(password == rpassword){
				database.query('select * from user where email=?',[email],function(error,result){
					if (error) {
						console.log(error);
						return res.redirect('/');
					}
					if (result.length >0) {
						return res.render('index',{message:'email exists'});
					}else{
						var date = new Date();
						var user = {
							email:email,
							username:name,
							password:password,
							created_at: date
						}
						database.query('insert into user set ?',user,function(error){
							if (error) {
								console.log(error);
								return res.redirect('/');
							}
						});

						database.query('select * from user where email=? and password=?',[email,password],function(error,result){
							if (error) {
								console.log(error);
								res.redirect('/');
							}
							if (result.length==1) {
								req.session.user = result[0];
								var userdir = 'uploads/'+req.session.user.username+req.session.user.id;
								fs.mkdir(userdir,function(error){
									if(error){
										console.log(error);
										res.redirect('/home');
									}
								});
								return res.redirect('/home');
							}else{
								return res.redirect('/');
							}
						});
					}
				});
			}else{
				return res.render('index',{message:'passwords dont match'});
			}
		}else {
			return res.render('index',{message: "Please type all fields"});
		}

	}
}

exports.get_logout = function(req,res) {
	req.session = null;
	return res.redirect('/');

}