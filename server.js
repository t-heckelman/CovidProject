let express = require("express");
let app = express();
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server_port = 5050;
const axios = require("axios");
const qs = require("axios");
let pgp = require("pg-promise")();

app.set("view engine", "ejs");
// app.set('views', './demo');
app.use(express.static(__dirname + "/"));
const tools = require("./resources/js/script");

// This line is necessary for us to use relative paths and access our resources directory -- ignore this for now
var dailyImg;
let dbConfig = {
  host: "127.0.0.1",
  port: 5432,
  database: "postgres",
  user: "malcolmholman",
  password: "password",
};

const isProduction = process.env.NODE_ENV === "production";
dbConfig = isProduction ? process.env.DATABASE_URL : dbConfig;
let db = pgp(dbConfig);

var user = "Login";
var globalUsername = "username"
axios({
  url:
    "https://api.nasa.gov/planetary/apod?api_key=p0oTvbRVafsxIYbUUg4vRhgBdFMqwKBIeayQVkvX",
  method: "GET",
  dataType: "json",
})
  .then((items) => {
    dailyImg = items.data;
    console.log("hi", data);
  })
  .catch((error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    }
  });

app.get("/", function (req, res) {
  console.log("Main page loaded, user: " + user);
  res.render("pages/main", {
    my_title: "Music Space",
    dailyImg: dailyImg,
    user: user,
    error: false,
  });
});

app.get("/logout", function(req,res) {
  console.log("Logged out user: " + user);
  user = "Login"
  globalUsername = "username"
  res.render("pages/main", {
    my_title: "Music Space",
    dailyImg: dailyImg,
    user: user,
    error: false,
  });
});



app.get("/profile", function (req, res){
  console.log("Profile page loaded");

  var query1 = "select * from reviews WHERE username = '" + globalUsername + "'" + "ORDER BY review_date DESC;"

  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((data) => {
      res.render("pages/profile", {
        my_title: "Music Space: Reviews",
        tools: tools,
        user: user,
        dailyImg: dailyImg,
        songs: data[0],
        globalUsername: globalUsername,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/profile", {
        my_title: "Error",
        songs: [1, 2, 3, 4],
        user: user,
        tools: tools,
      });
    });
});

  // kanye west api key https://www.programmableweb.com/api/kanyerest-rest-api-v100

app.get("/login", function (req, res) {
  console.log("Login page loaded");
  res.render("pages/login", {
    my_title: "Music Space: Login",
    dailyImg: dailyImg,
    user: user,
    error: false,
  });
});

app.post("/login", function (req, res) {
  console.log("loginYes");
  var username = req.body.username;
  var psw = req.body.psw;
  var query1 = "SELECT name FROM users WHERE username = '" + username + "' AND password = '" + psw + "';";
  globalUsername = username; 
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
  .then((info) => {
    if(info[0][0].name != null){
      user = info[0][0].name;
      console.log(user);
      res.render("pages/main", {
        my_title: "Music Space",
        user: user,
        dailyImg: dailyImg,
        success: true,
        error: false,
      });
    }
    else{
      res.render("pages/login", {
        my_title: "Music Space",
        user: user,
        dailyImg: dailyImg,
        success: true,
        error: false,
      });
    }
  })
  .catch((err) => {
    console.log("error", err);
    res.render("pages/login", {
      my_title: "error",
      user: "login",
      dailyImg: dailyImg,
      message: "uh oh",
      error: true,
    });
  });

});
app.get("/register", function (req, res) {
  console.log("Register page loaded");
  res.render("pages/register", {
    my_title: "Music Space: Register",
    dailyImg: dailyImg,
    tools: tools,
    user: user,
    error: false,
  });
});

app.post("/register", function (req, res) {
  console.log("have clicked register and entered function")
  var email = req.body.email;
  var name = req.body.name;
  var username = req.body.username;
  var psw = req.body.psw;
  username = username.toUpperCase();
  console.log("name " + name);
  console.log("email " + email);
  console.log("username " + username);
  console.log("psw " + psw);

  var query1 =
    "INSERT INTO users(name, username, password, email) values('" +
    name +
    "', '" +
    username +
    "', '" +
    psw +
     "', '" +
    email +
    "');";
  console.log(query1);
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((info) => {
      user = name;
      globalUsername = username;
      console.log("info" + info);
      res.render("pages/main", {
        my_title: "Music Space",
        dailyImg: dailyImg,
        user: user,
        success: true,
        error: false,
      });
    })
    .catch((err) => {
      console.log("error!", err);
      res.render("pages/register", {
        my_title: "error",
        dailyImg: dailyImg,
        message: "uh oh",
        user: user,
        error: true,
      });
    });
});

app.get("/reviews", function (req, res) {
  console.log("Reviews page loaded");
  // api needs to be added to this
  var query1 = "select * from reviews ORDER BY review_date DESC;";
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((data) => {
      res.render("pages/reviews", {
        my_title: "Music Space: Reviews",
        tools: tools,
        user: user,
        dailyImg: dailyImg,
        songs: data[0],
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/reviews", {
        my_title: "Error",
        songs: [1, 2, 3, 4],
        user: user,
        tools: tools,
      });
    });
});

app.post("/reviews", function (req, res) {
  console.log("Reviews searchfilter(POST) loaded");
  var username = req.body.username;
  username = username.toUpperCase(); //REGSTER ALL AS UPPERCASE

  var reviewQuery = "SELECT * FROM reviews WHERE username = '" + username + "'";


  db.task("get-everything", (task) => {
    return task.batch([task.any(reviewQuery)]);
  })
    .then((data) => {
      res.render("pages/reviews", {
        my_title: "Reviews",
        songs: data[0],
        user: user,
        dailyImg: dailyImg,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/reviews", {
        my_title: "Reviews",
        songs: [1, 2, 3, 4],
        user: user,
      });
    });
});


app.get("/writeReview", function (req, res) {
  console.log("write review page loaded");
  res.render("pages/writeReview", {
    my_title: "Music Space: Review",
    dailyImg: dailyImg,
    tools: tools,
    user: user,
    error: false,
  });
});
app.post("/writeReview", function (req, res) {
  /*Link/v1/filter/key*/
  var song = req.body.song;
  var review = req.body.review;
  console.log("Write post function called with review: \n" + review + "\n");
  var query1 =
    "INSERT INTO reviews(username, song, review, review_date) values('" +
    globalUsername +
    "', '" +
    song +
    "', '" +
    review +
    "', 'now()');";

   db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
   })
  .then((data) =>{
    console.log("data: " + data);
    res.render("pages/main", {
      my_title: "Music Space: Review",
      dailyImg: dailyImg,
      tools: tools,
      user: user,
      error: false,
    });
  })
    .catch((err) => {
      console.log("error!", err);
      res.render("pages/writeReview", {
        my_title: "error",
        dailyImg: dailyImg,
        message: "uh oh",
        user: user,
        error: true,
      });
  });
});

// console.log("Server is running at " + server_port);
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
// app.listen(server_port);
