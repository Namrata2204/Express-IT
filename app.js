require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const startcontent = " Welcome to the blog website.";
const aboutContent = "I am Namrata Chaudhari. I am persuing bachelors of technology in information technology.";
const contactContent = " For more information contact 9657597406.";

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "Annyonghi gaseyo",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);
const postSchema = new mongoose.Schema({
  username: String,
  password: String,
  field: String,
  title: String,
  content: String
});

postSchema.plugin(passportLocalMongoose);
const Post = mongoose.model("Post", postSchema);

passport.use(Post.createStrategy());
passport.serializeUser(Post.serializeUser());
passport.deserializeUser(Post.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/homepage", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("homepage");
  } else {
    res.redirect("/");
  }
});

app.get("/compose", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.redirect("/");
  }
});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    contactContent: contactContent
  });
});
app.post("/compose", function(req, res) {
  const post = new Post({
    field: req.body.postFeild,
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err) {
    if (!err) {
      res.redirect("/homepage");
    }
  });
});

app.get("/field/:fieldName", function(req, res) {
  if (req.isAuthenticated()) {
    const reqfieldName = req.params.fieldName;
    Post.find({
      field: reqfieldName
    }, function(err, posts) {
      res.render("field.ejs", {
        posts: posts
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/posts/:postId", function(req, res) {
  if (req.isAuthenticated()) {
    const reqpostId = req.params.postId;
    Post.findOne({
      _id: reqpostId
    }, function(err, post) {
      res.render("post.ejs", {
        title: post.title,
        content: post.content
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  Post.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/homepage");
      });
    }
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  const post = new Post({
    username: req.body.username,
    password: req.body.password
  });

  req.login(post, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/homepage");
      })
    }

  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server is hosted on port 3000");
})
