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
  user: "teddyheckelman",
  password: "password",
};

const isProduction = process.env.NODE_ENV === "production";
dbConfig = isProduction ? process.env.DATABASE_URL : dbConfig;
let db = pgp(dbConfig);

var user = "Login";
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
  console.log("Main page loaded");
  res.render("pages/main", {
    my_title: "Music Space",
    dailyImg: dailyImg,
    user: user,
    error: false,
  });
  // axios({
  //   url:
  //     "https://api.nasa.gov/planetary/apod?api_key=p0oTvbRVafsxIYbUUg4vRhgBdFMqwKBIeayQVkvX",
  //   method: "GET",
  //   dataType: "json",
  // })
  //   .then((items) => {
  //     console.log("test");
  //     console.log("hi", items.data);
  //     res.render("pages/main", {
  //       my_title: "Music Space",
  //       items: items.data,
  //       error: false,
  //     });
  //   })
  //   .catch((error) => {
  //     console.log("test");
  //     if (error.response) {
  //       console.log(error.response.data);
  //       console.log(error.response.status);
  //     }
  //   });
});

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
app.get("/reviews", function (req, res) {
  console.log("Reviews page loaded");
  console.log("reviews");
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
app.post("/register", function (req, res) {
  var email = req.body.email;
  var name = req.body.name;
  var username = req.body.username;
  var psw = req.body.psw;
  console.log(review);
  console.log(name);
  // "select * from cocktails where upper(cocktail_name) = '" + name + "'"
  // var query1 = "INSERT INTO cocktails(cocktail_name, review, review_date) values(mojito, good, now())";
  // var query1 = "INSERT INTO cocktails(cocktail_name, id, review, review_date) values('" + drink_name + "', '"+ review + "', now());";
  var query1 =
    "INSERT INTO users(name, Username, password, email) values('" +
    name +
    "', '" +
    username +
    "', '" +
    password +
     "', '" +
    email +
    ");";
  console.log(query1);
  // var query1 = 'select * from cocktails'
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((info) => {
      console.log(info);
      res.render("pages/main", {
        my_title: "Music Space",
        items: "",
        dailyImg: dailyImg,
        user: user,
        success: true,
        error: false,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/register", {
        my_title: "error",
        items: "",
        dailyImg: dailyImg,
        message: "uh oh",
        user: user,
        error: true,
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
  var song = req.body.song;
  var review = req.body.review;
  console.log("write review page loaded");
  var query1 =
    "INSERT INTO reviews(username, song, review, review_date) values('" +
    user +
    "', '" +
    song +
    "', '" +
    review +
    "now());";
  console.log(query1);
  res.render("pages/writeReview", {
    my_title: "Music Space: Review",
    dailyImg: dailyImg,
    tools: tools,
    user: user,
    error: false,
  });
});
app.get("/reviews", function (req, res) {
  console.log("Reviews page loaded");
  console.log("reviews");
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
// app.get("/register", function (req, res) {
//   const api_key = "7c5b028ba8b743249e640caafb503d10";
//     .then((items) => {
//       console.log("test");
//       console.log("I refuse to believe this", items.data);
//       res.render("pages/register", {
//         my_title: "Music Space: Register",
//         dailyImg: dailyImg,
//         tools: tools,
//         error: false,
//       });
//     })
//     .catch((error) => {
//       console.log("test");
//       if (error.response) {
//         console.log(error.response.data);
//         console.log(error.response.status);
//       }
//     });
// });
// const dev_dbConfig = {
// 	host: 'localhost',
// 	port: 5432,
// 	database: process.env.POSTGRES_DB,
// 	user:  process.env.POSTGRES_USER,
// 	password: process.env.POSTGRES_PASSWORD
// };

// /** If we're running in production mode (on heroku), the we use DATABASE_URL
//  * to connect to Heroku Postgres.
//  */
// const isProduction = process.env.NODE_ENV === 'production';
// const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

//url: http://localhost:5050/

//}
// else {
//   console.log("error");
//   res.render('pages/main',{
//     my_title: "main",
//     items: '',
//     message: "Enter a name",
//     error: true
//   })
//

app.get("/reviews", function (req, res) {
  console.log("reviews was got");
  var query1 = "select * from reviews;";
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((data) => {
      res.render("pages/reviews", {
        my_title: "Cocktail",
        songs: data[0],
        user: user,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/reviews", {
        my_title: "Cocktail",
        songs: [1, 2, 3, 4],
        user: user,
      });
    });
});

// app.post("/reviews", function (req, res) {
//   var name = req.body.title;
//   console.log(name);
//   name = name.toUpperCase();
//   console.log(name);
//   if (name) {
//     var query1 = "select * from reviews where upper(username) = '" + name + "'";
//     db.task("get-everything", (task) => {
//       return task.batch([task.any(query1)]);
//     })
//       .then((data) => {
//         console.log(data[0]);
//         res.render("pages/reviews", {
//           my_title: "Cocktail",
//           cocktails: data[0],
//         });
//       })
//       .catch((err) => {
//         console.log("error", err);
//         res.render("pages/reviews", {
//           my_title: "Cocktail",
//           cocktails: [1, 2, 3, 4],
//         });
//       });
//   } else {
//     var query1 = "select * from cocktails;";
//     db.task("get-everything", (task) => {
//       return task.batch([task.any(query1)]);
//     })
//       .then((data) => {
//         res.render("pages/reviews", {
//           my_title: "Cocktail",
//           cocktails: data[0],
//         });
//       })
//       .catch((err) => {
//         console.log("error", err);
//         res.render("pages/reviews", {
//           my_title: "Cocktail",
//           cocktails: [1, 2, 3, 4],
//         });
//       });
//   }
// });

app.post("/reviews", function (req, res) {
  console.log("Reviews searchfilter loaded");
  var username = req.body.username;
  //username = username.toUpperCase(); //REGSTER ALL AS UPPERCASE

  var reviewQuery = "SELECT * FROM reviews WHERE username = '" + username + "'";
  ("");

  db.task("get-everything", (task) => {
    return task.batch([task.any(reviewQuery)]);
  })
    .then((data) => {
      res.render("pages/reviews", {
        my_title: "Cocktail",
        songs: data[0],
        user: user,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/reviews", {
        my_title: "Cocktail",
        songs: [1, 2, 3, 4],
        user: user,
      });
    });
});

app.post("/main/reviewHandle", function (req, res) {
  var review = req.body.review;
  var name = drink_name;
  id = Math.floor(Math.random() * 99999999);
  name = name.toUpperCase();
  console.log(review);
  console.log(name);
  // "select * from cocktails where upper(cocktail_name) = '" + name + "'"
  // var query1 = "INSERT INTO cocktails(cocktail_name, review, review_date) values(mojito, good, now())";
  // var query1 = "INSERT INTO cocktails(cocktail_name, id, review, review_date) values('" + drink_name + "', '"+ review + "', now());";
  var query1 =
    "INSERT INTO musics(song, id, review, users, review_date) values('" +
    drink_name +
    "', '" +
    id +
    "', '" +
    review +
    "', now());";
  console.log(query1);
  // var query1 = 'select * from cocktails'
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((info) => {
      res.render("pages/main", {
        my_title: "main",
        items: "",
        user: user,
        error: false,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/main", {
        my_title: "main",
        items: "",
        user: user,
        message: "uh oh",
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
