var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var busboy = require('connect-busboy');

exports.index = function(req,res){
	res.render('index',{message:''});
}
exports.home = function(database){
	return function(req,res) {
		if (typeof req.session.user!='undefined'){

			var all_tweets ='select \
								id,	\
								follow_user_id, \
								username, \
								image, \
								comment, \
								created_at \
							from \
							(select \
									user.id, \
									null follow_user_id, \
									user.username, \
									user.image, \
									post.comment,  \
									post.created_at \
								from post \
									inner join user on \
										post.user_id = user.id where post.user_id=? UNION ALL \
								select \
									US.id, \
									follow.follow_user_id, \
									US.username, \
									US.image, \
									post.comment, \
									post.created_at \
									from user \
									inner join follow on \
									 follow.user_id = user.id \
									 inner join post on \
									 	post.user_id = follow.follow_user_id \
									 inner join user US on \
									 	US.id = follow.follow_user_id \
									 where user.id=?) SE \
									 order by created_at desc';

			//console.log(req.session.user);
			database.query(all_tweets,[req.session.user.id,req.session.user.id],function(error,result){
				if (error){
					console.log(error);
					return res.redirect('/home');
				}

				var tweets,followers,follows = 0;
				database.query('select * from post where user_id=?',[req.session.user.id],function(error,res1){
					if (error){
						console.log(error);
						return res.redirect('/home');
					}
					tweets = res1.length;
					database.query('select * from follow where user_id=?',[req.session.user.id],function(error,res2){
						if (error){
							console.log(error);
							return res.redirect('/home');
						}
						follows = res2.length;
						database.query('select * from follow where follow_user_id=?',[req.session.user.id],function(error,res3){
							if (error){
								console.log(error);
								return res.redirect('/home');
							}
							followers = res3.length;
							//console.log(result);
							res.render('home',{user:req.session.user,posts:result,message:'',tweets:tweets,follows:follows,followers:followers })
						});
					});
				});			
			});
		}else{
			return res.redirect('/');
		}

		



	}	
}
exports.post_tweet = function(database) {
	return function (req,res){
		
		//console.log(req.session.user);
		
		var text = req.body.tweet;
		var date = new Date();
		var post ={
			user_id : req.session.user.id,
			comment: text,
			created_at: date
		}
		if (text){
			database.query('insert into post set ?',post,function(error){
				if (error) {
					console.log(error);
					return res.redirect('/');
				}
				return res.redirect('/home');
			});
		}else{

			return res.render('home',{user:req.session.user,message:'tweet empty'});
			
		}
	}
}

exports.get_user =function(database){
	return function(req,res){
		var user = req.params.user;
		database.query('select * from user where id=?',[user],function(error,result){
			if (error){
				cosole.log(error)
				return res.redirect('home');
			}
			if (result.length == 1 ){
							var all_tweets ='select \
								id,	\
								username, \
								image,\
								comment, \
								created_at \
							from \
							(select \
									user.id, \
									user.username, \
									user.image, \
									post.comment,  \
									post.created_at \
								from post \
									inner join user on \
										post.user_id = user.id where post.user_id=? UNION ALL \
								select \
									US.id, \
									US.username, \
									US.image,  \
									post.comment, \
									post.created_at \
									from user \
									inner join follow on \
									 follow.user_id = user.id \
									 inner join post on \
									 	post.user_id = follow.follow_user_id \
									 inner join user US on \
									 	US.id = follow.follow_user_id \
									 where user.id=?) SE \
									 order by created_at desc';
				database.query(all_tweets,[user,user],function(error,posts){
					if (error){
						console.log(error)
						return res.redirect('home');
					}
 					database.query('select * from follow where user_id=? and follow_user_id=?',[req.session.user.id,user],function(error,result2){
 						if(error){
 							console.log(error);
 							return res.redirect('/home');
 						}
 						var follow = false;
 						if(result2.length>0){
 							follow = true;
 						}else{
 							follow =false;
 						}
 						//console.log(posts);
 						res.render('user',{user:req.session.user,posts:posts,spec_user:result[0],follow:follow});

 					});

					

				});
			}else{
				return res.redirect('/home');
			}
			
		});

	}
}

exports.get_follow = function(database){
	return function(req,res){
		var followuser_id = req.params.id;
		var follow = {
			user_id:req.session.user.id,
			follow_user_id:followuser_id
		}
		database.query('insert into follow set ?',follow,function(error,result){
			if (error){
				console.log(error);
				return res.redirect('/user/'+followuser_id);
			}
			return res.redirect('/home');

		});



	}
}

exports.get_unfollow = function(database){
	return function(req,res){
		var followuser_id = req.params.id;

		database.query('delete from follow where user_id=? and follow_user_id=?',[req.session.user.id,followuser_id],function(error,result){
			if (error){
				console.log(error);
				return res.redirect('/user/'+followuser_id);
			}
			return res.redirect('/home');

		});



	}
}

exports.settings = function(database){
	return function(req,res){
		database.query('select image from user where id=?',[req.session.user.id],function(error,result){
			if (error){
				console.log(error);
				res.redirect('/settings');
			}

			if(result.length >0){
				
				var image_path = req.session.user.username+req.session.user.id+'/'+result[0].image;
				req.session.user.image = result[0].image; //update session variable so that when you redirect to home you can see new prof pic
				if(result[0].image!=null){
			//		console.log(image_path);
					res.render('settings',{image:image_path,message:''});
				}
				else{
			//		console.log('default');
					res.render('settings',{image:'default.png',message:''});
				}
			}
		});
	}
}

exports.upload = function(database){
	return function(req,res){
		var random_id = crypto.randomBytes(20).toString('hex');
		var filepath = './uploads/'+req.session.user.username+req.session.user.id+'/'+ random_id+'.png';
		var database_filepath = random_id + '.png';

		//req.files.profpic.path;
		var targetPath = path.resolve(filepath);

		 if (req.busboy) {
		    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		   /* 	console.log(file);
		    	console.log(filename);
		    	console.log(encoding);
		    	console.log(mimetype);
		    	if (encoding != 'image/png'){
		    		console.log('no file');
		    		res.redirect('/settings');
		    	}else{*/

					file.pipe(fs.createWriteStream(targetPath));
					database.query('update user set image=? where id=?',[database_filepath,req.session.user.id],function(error){
						if(error){
							console.log(error);
							res.redirect('/settings');
						}
						res.redirect('/settings');
					});		
			//	}	
						
		    });
		    req.pipe(req.busboy);
		 
		 }
	}
}

exports.users = function(database){
	return function(req,res){

		database.query('select * from user',function(error,result){
			if (error) {
				console.log(error);
				res.redirect('/home');
			}
			res.render('users',{users:result});
		});


	}
}