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
  console.log("/main");
  res.render("pages/main", {
    my_title: "Music Space",
    dailyImg: dailyImg,
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
  console.log("login");
  res.render("pages/login", {
    my_title: "Music Space: Login",
    dailyImg: dailyImg,
    error: false,
  });
});

app.get("/register", function (req, res) {
  res.render("pages/register", {
    my_title: "Music Space: Register",
    dailyImg: dailyImg,
    tools: tools,
    error: false,
  });
});
app.get("/reviews", function (req, res) {
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
        dailyImg: dailyImg,
        songs: data[0],
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/reviews", {
        my_title: "Error",
        songs: [1, 2, 3, 4],
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
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/reviews", {
        my_title: "Cocktail",
        songs: [1, 2, 3, 4],
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


app.post("/reviews", function (req, res){
  console.log("posted");
  var review = req.body.review;
  var username = req.body.username;
  console.log(username);
  console.log(review);

  var reviewQuery = "select * FROM reviews WHERE username = 'TEDDY'"; //TODO get user input from search bar
  console.log(reviewQuery);
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
        error: false,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/main", {
        my_title: "main",
        items: "",
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
