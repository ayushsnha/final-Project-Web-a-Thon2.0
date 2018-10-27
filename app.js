var  express      =require("express"),

	 mongoose     =require("mongoose"),
	 passport     =require("passport"),
	 bodyParser   =require("body-parser"),
	 methodOverride= require('method-override'),
     expressSanitizer = require('express-sanitizer'),
	 User 		  =require("./models/user"),
	 LocalStrategy=require("passport-local"),
	 passportLocalMongoose=require("passport-local-mongoose");


mongoose.connect("mongodb://localhost/homeCareManagement");

var pid;
var app=express();
app.use(require("express-session")({

	secret:"ayush",
	resave:false,
	saveUninitialized:false
}));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//database schema
	var patientSchema = new mongoose.Schema({
		name:String,
		image:{type:String,default:"https://image.freepik.com/free-icon/user-image-with-black-background_318-34564.jpg"},
		systolic:String,//{type:String,default:"image.jpg"}
		diastolic:String,
		body:String,
		created:{type:Date, default:Date.now}
	});

	var Patient = mongoose.model('Patient',patientSchema);


//ROUTES

app.get("/",function(req,res){

	res.render("home");
});

app.get("/confirm",function(req,res){

	res.render("confirm");
});
//NEW ROUTE
	app.get('/patients/new',function(req,res){
		res.render('new');
	});

	//CREATE ROUTE
	app.post('/patients',function(req,res){
		req.body.patient.body=req.sanitize(req.body.patient.body)
		Patient.create(req.body.patient,function(err,newPatient){
			if(err){
				res.render('new');
			}else{
				pid=newPatient._id;
				res.render('confirm',{pid:pid});
				
			}
		});
	});



app.get('/patients',isLoggedIn,function(req,res){
		Patient.find({},function(err,patients){ 
			if(err){
				console.log('ERROR!!');
			}else{ 
					res.render('index',{patients:patients});
			     }
		});
		
	});

	

	//SHOW ROUTE
	app.get('/patients/:id',isLoggedIn,function(req,res){
		Patient.findById(req.params.id,function(err,foundPatient){
			if(err){
				res.redirect('/patients');
			}else{
				res.render('show',{patient:foundPatient});
			}
		})
	})

	

	//Delete
	app.delete('/patients/:id',isLoggedIn,function(req,res){
		Patient.findByIdAndRemove(req.params.id,function(err){
			if(err){
				res.redirect('/patients');
			}else{
				res.redirect('/patients');
			}
		})
	});




//AUTH routes
//form
app.get("/signup",function(req,res){
	res.render("signup");
});

//handling user signup
app.post("/register",function(req,res){
	req.body.username
	req.body.password
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){

		if(err){
			console.log(err);
			return res.render("signup");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/patients");
		});
	});
});

//LOGIN ROUTES
app.get("/login",function(req,res){
	res.render("login");
});

app.post("/login",passport.authenticate("local",{

	successRedirect:"/patients",
	failureRedirect:"/login",
}),function(req,res){

});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});
//MIDDLEWARE

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000,function(){

	console.log("server has started");
});
