var express = require('express');
path = require('path');
var app = express();
var multer = require('multer');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var Blog = require('./models/blog');
var Comment = require("./models/comment");
var User = require("./models/user");
var methodOverride = require('method-override');
const passportLocalMongoose = require('passport-local-mongoose');
var PORT = process.env.PORT || 3000;

//==========db config==============
var uri = 'mongodb://localhost:27017/zfinalproject';

mongoose.connect(uri, { useNewUrlParser: true });
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//  console.log("done!");
 
// });





// config multer //////////////////////


var upload = multer({storage: multer.diskStorage({

	destination: function (req, file, callback){ callback(null, './public/uploads');},
	filename: function (req, file, callback){ callback(null, file.fieldname +'-' + Date.now()+path.extname(file.originalname));}
  
  }),
  
  fileFilter: function(req, file, callback) {
	var ext = path.extname(file.originalname)
	if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
	  return callback(null, false)
	}
	callback(null, true)
  }
  });





//==========APP config==============
app.use(bodyParser.urlencoded({extended:true}));
//===serving directories
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//==

//Passport configuration
app.use(require("express-session")({
	secret: "I love you!",
	resave: true,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride("_method"));








//==middleware for currentUser to work on every route
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


	



// //======================RESTFUL ROUTES====================================
app.get("/", function(req, res){
	// res.send("This is the blog page!");
	res.redirect("/blogs");
});

//===== INDEX ROUTE
app.get("/blogs", function(req, res){
	console.log(req.header);
	
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("blogs/index", {blogsVar: blogs});
		}
	});
});

//===== NEW ROUTE
app.get("/blogs/new", isLoggedIn, function(req, res){
;


	res.render("blogs/new");
});

// ===== CREATE ROUTE
app.post("/blogs", isLoggedIn, function(req, res){
	//create blog

	

	let data = req.body.blog
	Blog.create(data, function(err, newBlog){
		if(err){
			res.render("blogs/new");
		} else {
			//redirect tot he index
			res.redirect("/blogs");
		}
	});
});

//===== SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
		if(err){
			console.log(err);
		} else {
			res.render("blogs/show", {blogInfo: foundBlog});
		}
	});
});






//======================api avatar= ===============================================//

app.get('/avatar',  isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err,data){
	  if(err){
		console.log(err);
	  }else{
		res.render('avatar',{useravatar:data});
	  }
	})
  
  });

  app.post('/api/avatar', upload.single("upl"), function(req,res){


	console.log(req.file); //form files
  
	if(!req.body && !req.file){
	  res.json({success: false});
	} else {

	  console.log("body request:"+req.session.passport.user);
	  console.log("path:"+req.file.path);
	  console.log("user deteal:"+req.user);
	  User.findByIdAndUpdate(req.user._id,{avatar :"/uploads/"+ req.file.filename},function(err,data){

	
		res.redirect('/avatar');
	  })
  
	}
  });





//=======api avatar end ==========================================================//









app.get("/editprofile", isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, foundUser){
		if(err){
			console.log("nashod!");
			
		} else {
			res.render("editprofile", {userInfo: foundUser});
			// console.log("founduser!"+foundUser);


		}
	});

// console.log("user!"+req.user);


});

//===== UPDATE ROUTE
app.put("/editprofile", isLoggedIn, function(req, res){
	console.log("1: " +req.body);
	console.log("2: " +req.body.user);
	
	console.log("req.user: " +req.user);
	console.log("req.user: " +req.user.name);
	console.log("req.session.passport.user: "+req.session.passport.user);
    const c = req.body.password;
    console.log(c);


	// const user = new DefaultUser({username: a});
	// await user.setPassword(c);
	// await user.save();
	// const { user } = await DefaultUser.authenticate()(a, c);


	//  (req, res) => {
	// 	const user =  User.findOneAndUpdate({
	// 	  username: req.session.passport.user
	//   });
	//    user.setPassword(req.body.password);
	//   		  user.username = req.body.username;
	// 		  user.name = req.body.name;
	// 		  user.lastname = req.body.lastname;
	// 		  user.gender = req.body.gender;
	// 		  user.phone = req.body.phone;
	 
	  
	//    res.redirect('/login')
	//   }



	// const user = 	User.findOneAndUpdate({ username: req.session.passport.user },function(err, req,res){
	// 	console.log(user);
		
	// 	user.setpassword(req.body.password, function(err) {
	// 		if (err) console.log(err);
	// 		user.save(function(err) {
	// 			if (err){
	// 				console.log("password not set");
					
	// 			}
			  
	// 		});
	// 	});
	
	// 	if(err){
	// 		console.log("bazam nashod!");
			
	// 		// res.redirect("/blogs");
	// 	} else {
	// 		user.username = req.body.username;
	// 		user.name = req.body.name;
	// 		user.lastname = req.body.lastname;
	// 		user.gender = req.body.gender;
	// 		user.phone = req.body.phone;
		
			
	// 		res.redirect("/login" );
		
	// 		// console.log(req.user._id);
			
	// 	}
	// });
	










});














//==== EDIT ROUTE
app.get("/blogs/:id/edit", isLoggedIn, function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("blogs/edit", {blogInfo: foundBlog});
		}
	});
});

//===== UPDATE ROUTE
app.put("/blogs/:id", isLoggedIn, function(req, res){
	
	let id = req.params.id;
	Blog.findByIdAndUpdate(id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + id);
		
			console.log(req.params.id);
			
		}
	});
});

//===== DELETE ROUTE
app.delete("/blogs/:id", isLoggedIn, function(req, res){
	// res.send("the delete route!"); to test
	//delete the blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			//redirect somewhere
			res.redirect("/blogs");
		}
	});
});


//=== New COMMENTS
app.get("/blogs/:id/comments/new", isLoggedIn, function(req, res){
	// res.send("This will be the comment form!");
	// find blog by id
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {blogComt: blog});
		}
	});
});


//==Create route
app.post("/blogs/:id/comments", isLoggedIn, function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		} else{
			// console.log(req.body.comment); to see whats on the comment object
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {

					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					console.log("New " + req.user.username);


					//save comment
					comment.save();
					blog.comments.push(comment);
					blog.save();
					console.log(comment);
					res.redirect("/blogs/" + blog._id);
				}
			})
		}
	})
});


// //===============Auth ROUTES for users
// //===Show Register Form
app.get("/register", function(req, res){
	res.render("register");
});

//handle register sign up 
app.post("/register", function(req, res){
	var newUser = new User({
        username: req.body.username,
        name:req.body.name,
        lastname:req.body.lastname,
        gender:req.body.gender,
        phone:req.body.phone
    
    
	});
	if (req.body.admincode === "secretcode123") {
			newUser.isadmin = true;
		}

	console.log("This is the username:" + newUser);
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register")
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/blogs");
		});
	});
});

//===Show Login Form
app.get("/login", function(req, res){
	res.render("login");
});

//handle login logic

app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/blogs",
		failureRedirect: "/login"
	}), function(req, res){
	
});



// app.post('/login', function(req, res, next) {
// 	passport.authenticate('local', function(err, user, info) {
// 	    if (err) { return next(err); }
// 	    if (!user) { return res.redirect('/login'); }
// 		if (user) {return res.redirect('/blogs');}
	
// 	});
	
//   });
  














//===Logout 
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/blogs");
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

//====== To delete all the blogs and comments
// function deleteDB(){
// 	//Remove all blogs
// 	Blog.remove({}, function(err){
// 		if(err){
// 			console.log(err);
// 		}
// 		console.log("removed all blogs!");
// 		Comment.remove({}, function(err) {
// 			if(err){
// 				console.log(err);
// 			}
// 			console.log("removed comments!");
// 		});
// 	});
// };




// ADMIN CONTROLL////////////////////
////////////////////////////////////
///////////////////////////////////





app.get('/showusers', isLoggedIn, function(req, res, next) {	
	
	User.find({},function(err, result) {
		//if (err) return console.log(err)
	
		
		if (err) {
			
			res.render('list', {
				title: 'User List', 
				data: ''
			})
		} else {
			
			res.render('list', {
				title: 'User List', 
				data: result
			})
		}
	})
})



app.delete('/showusers/delete/(:id)', isLoggedIn, async(req, res, next)=> {	

	console.log(req.params.id);

	try {
			User.findByIdAndRemove( req.params.id, function(err, result) {
		if (err) {
		console.log("user delete false");
	
		}
		else{

			res.redirect("/showusers");
		}
	})
	} catch (error) {
		next(error) 
	}
})



app.get('/showcomments', isLoggedIn, function(req, res, next) {	
	
	Comment.find({},function(err, result) {
		//if (err) return console.log(err)
	
		
		if (err) {
			
			res.render('listco', {
				title: 'Comment List', 
				data: ''
			})
		} else {
			
			res.render('listco', {
				title: 'Comment List', 
				data: result
			})
		}
	})
})



app.delete('/showcomments/delete/(:id)', isLoggedIn, async(req, res, next)=> {	

	console.log(req.params.a);

	try {
		Comment.findByIdAndDelete( req.params.id, function(err, result) {
		if (err) {
		console.log("user delete false");
	
		}
		else{

			res.redirect("/showcomments");
		}
	})
	} catch (error) {
		next(error) 
	}
})





app.get('/showposts', isLoggedIn, function(req, res, next) {	
	
	Blog.find({},function(err, result) {
		//if (err) return console.log(err)
	
		
		if (err) {
			
			res.render('listu', {
				title: 'Comment List', 
				data: ''
			})
		} else {
			
			res.render('listu', {
				title: 'Comment List', 
				data: result
			})
		}
	})
})



app.delete('/showposts/delete/(:id)', isLoggedIn, async(req, res, next)=> {	

	console.log(req.params.a);

	try {
		Blog.findByIdAndDelete( req.params.id, function(err, result) {
		if (err) {
		console.log("post delete false");
	
		}
		else{

			res.redirect("/showposts");
		}
	})
	} catch (error) {
		next(error) 
	}
})























// ADMIN CONTROLL////////////////////
////////////////////////////////////
///////////////////////////////////

// function requireAdmin() {
// 	return function(req, res, next) {
// 	  User.findOne(req.body.username, function(err, user) {
// 		if (err) { return next(err); }
// 			console.log("err 1 admin func");
			
// 		if (!user) { 
// 			console.log("err 2 admin func");
// 		}
  
// 		if (!user.admin) { 
// 			console.log("err 3 admin func");
// 		}
  
// 		// Hand over control to passport
// 		next();
// 	  });
// 	}
//   }



app.listen(PORT, function() {console.log("Listening on: " + PORT )});