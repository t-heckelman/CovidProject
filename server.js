let express = require("express");
let app = express();
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//const server_port = 5050;
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
const musicKey = process.env.musixAPI;
const nasaKey = process.env.nasaAPI;
console.log(musicKey);
dbConfig = isProduction ? process.env.DATABASE_URL : dbConfig;
let db = pgp(dbConfig);
var user = "Login";
var trackPresent = false;
var tracks;
var snippet;
var track_id;
var favoriteArtist = "baby keem";
var globalUsername = "username";
favoriteArtist = favoriteArtist.replace(" ", "_");
var apiCall =
  "http://api.musixmatch.com/ws/1.1/track.search?q_artist=" +
  favoriteArtist +
  "&page_size=10&page=1&s_track_release_date=desc&apikey=" +
  musicKey;
// nasa api call
axios({
  url:
    "https://api.nasa.gov/planetary/apod?api_key=" + nasaKey,
  method: "GET",
  dataType: "json",
})
  .then((items) => {
    dailyImg = (items.data);
    // console.log("hi", data);
  })
  .catch((error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    }
  });
//api call for baby keem
console.log("fav api call " + apiCall);
axios({
  method: "GET",
  url: "http://api.musixmatch.com/ws/1.1/track.search?q_artist=baby_keem&page_size=10&page=1&s_track_release_date=desc&apikey=" + musicKey,
  dataType: "json",
})
  .then((track) => {
    console.log(track.data.message);
    // create array of all track_ids
    // console.log(track.data);
    // console.log(track.data.message);
    // console.log(track.data.message.header);
    // console.log(track.data.message.body);
    // console.log(track.data.message.body.track_list[0]);
    // console.log("then track");
    // console.log(track);
    // console.log(track.data.message.body);

    track_id = track.data.message.body.track_list[0].track.track_id;
    trackPresent = true;
    tracks = track.data.message.body;

    console.log("tracklist length: " + tracks.track_list.length);

    //console.log("tracks: " + tracks.track_list[0].track.track_name);
    console.log(track_id);
    // second api call for snippet
    axios({
      method: "GET",
      url:
        "http://api.musixmatch.com/ws/1.1/track.snippet.get?track_id=" +
        track_id + "&apikey=" + musicKey,
      dataType: "json",
    }).catch((error) => {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
      }
    });

    // console.log(track);
    // console.log("predata");
    // console.log(track.data.message.body.track_list[0].track);
    // console.log(track.data.message.body.track_list[track.data.message.body.track_list.length-1]);
    // console.log("postdata");
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
    tools: tools,

  });
});

app.get("/logout", function (req, res) {
  console.log("Logged out user: " + user);
  user = "Login";
  globalUsername = "username";
  res.render("pages/main", {
    my_title: "Music Space",
    dailyImg: dailyImg,
    user: user,
    error: false,
  });
});

app.get("/profile", function (req, res) {
  console.log(
    "Profile page loaded for user: " +
      globalUsername +
      "who's favorite artist is : " +
      favoriteArtist
  );

  var query1 =
    "select * from reviews WHERE username = '" +
    globalUsername +
    "'" +
    "ORDER BY review_date DESC;";

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
        favorite_artist: favoriteArtist,
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

app.get("/login", function (req, res) {
  console.log("Login page loaded");
  res.render("pages/login", {
    my_title: "Music Space: Login",
    dailyImg: dailyImg,
    user: user,
    error: false,
    tools: tools,
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
    usernameTaken: false,
    tools: tools,
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
        snippet: snippet,
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

app.get("/writeReview", function (req, res) {
  console.log("write review page loaded");

  apiCall =
    "http://api.musixmatch.com/ws/1.1/track.search?q_artist= " +
    favoriteArtist +
    "&page_size=10&page=1&s_track_release_date=desc&apikey=960f710bf56b66427c27a6349eb3ce0c";

  console.log(tracks);
  axios({
    method: "GET",
    url: apiCall,
    dataType: "json",
    parameter: {
      apikey: "960f710bf56b66427c27a6349eb3ce0c",
    },
  })
    .then((track) => {
      trackPresent = true;
      tracks = track.data.message.body;
      // console.log(tracks);
      console.log(track_id);
      res.render("pages/writeReview", {
        my_title: "Music Space: Review",
        dailyImg: dailyImg,
        tools: tools,
        user: user,
        tracks: tracks,
        snippet: snippet,
        trackPresent: trackPresent,
        error: false,
      });
    })
    .catch((err) => {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
      }
    });
});

app.post("/profile", function (req, res) {
  console.log("Profile post");
  favoriteArtist = req.body.favArtist;
  console.log(favoriteArtist);
  var query1 =
    "UPDATE users SET favorite_artist= '" +
    favoriteArtist +
    "' WHERE username = '" +
    globalUsername +
    "';";
  var query2 =
    "select * from reviews WHERE username = '" +
    globalUsername +
    "'" +
    "ORDER BY review_date DESC;";
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
    .then((data) => {
      db.task("get-everything", (task) => {
        return task.batch([task.any(query2)]);
      })
        .then((songs) => {
          res.render("pages/profile", {
            my_title: "Music Space: Profile",
            tools: tools,
            user: user,
            dailyImg: dailyImg,
            songs: songs[0],
            favorite_artist: favoriteArtist,
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



app.post("/login", function (req, res) {
  console.log("loginYes");
  var username = req.body.username;
  var psw = req.body.psw;
  var query1 =
    "SELECT * FROM users WHERE username = '" +
    username +
    "' AND password = '" +
    psw +
    "';";
  globalUsername = username;
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  }).then((info) => {
    if (info[0][0].name != null) {
      user = info[0][0].name;
      favoriteArtist = info[0][0].favorite_artist;
      console.log(user);
      console.log(favoriteArtist);
      res.render("pages/main", {
        my_title: "Music Space",
        user: user,
        dailyImg: dailyImg,
        success: true,
        error: false,
      });
    } else {
      res.render("pages/login", {
        my_title: "error",
        user: "login",
        dailyImg: dailyImg,
        message: "uh oh",
        error: true,
      });
    }
  });
});

// app.post("/register", function (req, res) {
//   console.log("have clicked register and entered function");
//   var email = req.body.email;
//   var name = req.body.name;
//   var username = req.body.username;
//   var psw = req.body.psw;
//   var checkUsername = false;
//   username = username.toUpperCase();
//   console.log("name " + name);
//   console.log("email " + email);
//   console.log("username " + username);
//   console.log("psw " + psw);

//   var query1 =
//     "INSERT INTO users(name, username, password, email) values('" +
//     name +
//     "', '" +
//     username +
//     "', '" +
//     psw +
//     "', '" +
//     email +
//     "');";
//   var query2 =  "SELECT * FROM users WHERE username = '" + username + "';";
//   console.log(query2);
//   console.log(query1);
//   db.task("get-everything", (task) => {
//     return task.batch([task.any(query2)]);
//   })
//     .then((check) => {
//       if(check[0][0].username == null){
//         db.task("get-everything", (task) => {
//           return task.batch([task.any(query1)]);
//         })
//         .then((insert) => {
//           console.log(user);
//           user = name;
//           globalUsername = username;
//           console.log("info" + info);
//           res.render("pages/main", {
//             my_title: "Music Space",
//             dailyImg: dailyImg,
//             user: user,
//             success: true,
//             error: false,
//             usernameTaken: checkUsername,
//         });
//       })
//         .catch((err) => {
//           console.log("error", err);
//           res.render("pages/register", {
//             my_title: "Errror",
//             dailyImg: dailyImg,
//             user: user,
//             success: false,
//             usernameTaken: checkUsername,
//             error: true,
//           });
//         });
//       }
//       else{
//         checkUsername = true;
//         console.log(checkUsername);
//         res.render("pages/register", {
//           my_title: "error",
//           dailyImg: dailyImg,
//           user: user,
//           success: false,
//           usernameTaken: checkUsername,
//           error: true,
//         });
//       }
//     })
//     .catch((err) => {
//       console.log("error!", err);
//       res.render("pages/main", {
//         my_title: "error",
//         dailyImg: dailyImg,
//         message: "uh oh",
//         user: user,
//         error: true,
//       });
//     });
// });

// app.post("/register", function (req, res) {
//   console.log("have clicked register and entered function");
//   var email = req.body.email;
//   var name = req.body.name;
//   var username = req.body.username;
//   var psw = req.body.psw;
//   var checkUsername = false;
//   username = username.toUpperCase();
//   console.log("name " + name);
//   console.log("email " + email);
//   console.log("username " + username);
//   console.log("psw " + psw);

//   var query1 =
//     "INSERT INTO users(name, username, password, email) values('" +
//     name +
//     "', '" +
//     username +
//     "', '" +
//     psw +
//     "', '" +
//     email +
//     "');";
//   var query2 = "SELECT * FROM users WHERE username = '" + username + "';";
//   console.log(query2);
//   console.log(query1);
//   db.task("get-everything", (task) => {
//     return task.batch([task.any(query2)]);
//   })
//     .then((check) => {
//       if (check[0][0].username == null) {
//         db.task("get-everything", (task) => {
//           return task.batch([task.any(query1)]);
//         })
//           .then((insert) => {
//             console.log(user);
//             user = name;
//             globalUsername = username;
//             console.log("info" + info);
//             res.render("pages/main", {
//               my_title: "Music Space",
//               dailyImg: dailyImg,
//               user: user,
//               success: true,
//               error: false,
//               usernameTaken: checkUsername,
//             });
//           })
//           .catch((err) => {
//             console.log("error", err);
//             res.render("pages/register", {
//               my_title: "Errror",
//               dailyImg: dailyImg,
//               user: user,
//               success: false,
//               usernameTaken: checkUsername,
//               error: true,
//             });
//           });
//       } else {
//         checkUsername = true;
//         console.log(checkUsername);
//         res.render("pages/register", {
//           my_title: "error",
//           dailyImg: dailyImg,
//           user: user,
//           success: false,
//           usernameTaken: checkUsername,
//           error: true,
//         });
//       }
//     })
//     .catch((err) => {
//       console.log("error!", err);
//       res.render("pages/main", {
//         my_title: "error",
//         dailyImg: dailyImg,
//         message: "uh oh",
//         user: user,
//         error: true,
//       });
//     });
// });

app.post("/register", function (req, res) {
  console.log("have clicked register and entered function");
  var email = req.body.email;
  var name = req.body.name;
  var username = req.body.username;
  var psw = req.body.psw;
  var checkUsername = false;
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
  var query2 =  "SELECT * FROM users WHERE username = '" + username + "';";
  console.log(query2);
  console.log(query1);
  db.task("get-everything", (task) => {
    return task.batch([task.any(query2)]);
  })
    .then((check) => {
      if(check[0] == null){
        db.task("get-everything", (task) => {
          return task.batch([task.any(query1)]);
        })
        .then((insert) => {
          console.log(user);
          user = name;
          globalUsername = username;
          console.log("info" + info);
          res.render("pages/main", {
            my_title: "Music Space",
            dailyImg: dailyImg,
            user: user,
            success: true,
            error: false,
            usernameTaken: checkUsername,
        });
      })
        .catch((err) => {
          console.log("error", err);
          res.render("pages/register", {
            my_title: "Errror",
            dailyImg: dailyImg,
            user: user,
            success: false,
            usernameTaken: checkUsername,
            error: true,
          });
        });
      }
      else{
        checkUsername = true;
        console.log(checkUsername);
        res.render("pages/register", {
          my_title: "error",
          dailyImg: dailyImg,
          user: user,
          success: false,
          usernameTaken: checkUsername,
          error: true,
        });
      }
    })
    .catch((err) => {
      console.log("error!", err);
      res.render("pages/main", {
        my_title: "error",
        dailyImg: dailyImg,
        message: "uh oh",
        user: user,
        error: true,
      });
    });
})


app.post("/reviews", function (req, res) {
  console.log("Reviews searchfilter(POST) loaded");
  var username = req.body.username;
  username = username.toUpperCase(); //REGSTER ALL AS UPPERCASE
  var reviewQuery = "SELECT * FROM reviews WHERE username = '" + username + "'";
  db.task("get-everything", (task) => {
    return task.batch([task.any(reviewQuery)]);
  })
    .then((data) => {
      console.log(data);
      res.render("pages/reviews", {
        my_title: "Reviews",
        songs: data[0],
        user: user,
        dailyImg: dailyImg,
        snippet: snippet,
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


  apiCall =
    "http://api.musixmatch.com/ws/1.1/track.search?q_artist= " +
    favoriteArtist +
    "&page_size=10&page=1&s_track_release_date=desc&apikey=" + musicKey;

  console.log(tracks);
  axios({
    method: "GET",
    url: apiCall,
    dataType: "json",
  })
    .then((track) => {
      trackPresent = true;
      tracks = track.data.message.body;
      // console.log(tracks);
      console.log(track_id);
      res.render("pages/writeReview", {
        my_title: "Music Space: Review",
        dailyImg: dailyImg,
        tools: tools,
        user: user,
        tracks: tracks,
        snippet: snippet,
        trackPresent: trackPresent,
        error: false,
      });
    })
    .catch((err) => {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
      }
    });
  });


app.post("/writeReview", function (req, res) {
  console.log("in body of write review!");
  /*Link/v1/filter/key*/
  //console.log(req);

  //console.log(res);
  // var song = req.body.renderSong;
  //var song = tracks.track_list[0].track.track_name;
  //song = song.replace(" ", "_");\
  var review;

  // for (var i = 0; i < tracks.track_list.length; i++) {
  //   console.log("body at i" + req.body.e + i);
  //   if (req.body.e + "" + i !== "undefined") {
  //     review = req.body.e + "" + i;
  //     console.log("for loop review: " + review);
  //   }
  // }

  var review0 = req.body.e0;
  console.log("review:" + review1);
  var review1 = req.body.e1;
  console.log("review:" + review1);
  var review2 = req.body.e2;
  console.log("review:" + review2);
  var review3 = req.body.e3;
  console.log("review:" + review3);
  var review4 = req.body.e4;
  console.log("review:" + review4);
  var review5 = req.body.e5;
  console.log("review:" + review5);
  var review6 = req.body.e6;
  console.log("review:" + review6);
  var review7 = req.body.e7;
  console.log("review:" + review7);
  var review8 = req.body.e8;
  console.log("review:" + review8);
  var review9 = req.body.e9;
  console.log("review:" + review9);

  if(review0 != "undefined"){
    console.log("console logged undefined!");
  }

  if (review0 != review1) {
    review = review0;
    song =
      tracks.track_list[0].track.track_name +
      " by " +
      tracks.track_list[0].track.artist_name;
  }
  if (review1 != review2) {
    review = review1;
    // song = tracks.track_list[1].track.track_name;
    song =
      tracks.track_list[1].track.track_name +
      " by " +
      tracks.track_list[1].track.artist_name;
  }
  if (review2 != review3) {
    review = review2;
    // song = tracks.track_list[2].track.track_name;
    song =
      tracks.track_list[2].track.track_name +
      " by " +
      tracks.track_list[2].track.artist_name;
  }
  if (review3 != review4) {
    review = review3;
    // song = tracks.track_list[3].track.track_name;
    song =
      tracks.track_list[3].track.track_name +
      " by " +
      tracks.track_list[3].track.artist_name;
  }
  if (review4 != review5) {
    review = review4;
    // song = tracks.track_list[4].track.track_name;
    song =
      tracks.track_list[4].track.track_name +
      " by " +
      tracks.track_list[4].track.artist_name;
  }
  if (review5 != review6) {
    review = review5;
    // song = tracks.track_list[5].track.track_name;
    song =
      tracks.track_list[5].track.track_name +
      " by " +
      tracks.track_list[5].track.artist_name;
  }
  if (review6 != review7) {
    review = review6;
    // song = tracks.track_list[6].track.track_name;
    song =
      tracks.track_list[6].track.track_name +
      " by " +
      tracks.track_list[6].track.artist_name;
  }
  if (review7 != review8) {
    review = review7;
    //song = tracks.track_list[7].track.track_name;
    song =
      tracks.track_list[7].track.track_name +
      " by " +
      tracks.track_list[7].track.artist_name;
  }
  if (review8 != review9) {
    review = review8;
    //song = tracks.track_list[8].track.track_name;
    song =
      tracks.track_list[8].track.track_name +
      " by " +
      tracks.track_list[8].track.artist_name;
  }
  // if (review9 != review0) {
  //   review = review9;
  //   // song = tracks.track_list[9].track.track_name;
  //   song =
  //     tracks.track_list[9].track.track_name +
  //     " by " +
  //     tracks.track_list[9].track.artist_name;
  // }
  //console.log(review);

  // console.log(tracks);

  var song;

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
  });

  var query2 = "select * from reviews ORDER BY review_date DESC;";
  db.task("get-everything", (task) => {
    return task.batch([task.any(query2)]);
  })
    .then((data) => {
      // res.render("pages/reviews", {
      //   my_title: "Music Space: Reviews",
      //   tools: tools,
      //   user: user,
      //   dailyImg: dailyImg,
      //   songs: data[0],
      //   snippet: snippet,
      // });
      res.redirect("/reviews");

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

//     .then((data) => {
//       console.log("database passed");
//       axios({
//         method: "GET",
//         url: apiCall,
//         dataType: "json",
//
//       })
//         .then((track) => {
//           trackPresent = true;
//           // console.log("predata");
//           // console.log(track.data.message.body.track_list[0].track);
//           // console.log(track.data.message.body.track_list[track.data.message.body.track_list.length-1]);
//           // console.log("postdata");
//           var tracks = track.data.message.body;
//           res.render("pages/reviews", {
//             my_title: "Music Space: Review",
//             dailyImg: dailyImg,
//             tools: tools,
//             tracks: tracks,
//             user: user,
//             trackPresent: trackPresent,
//             error: false,
//           });
//         })
//         .catch((error) => {
//           if (error.response) {
//             console.log(error.response.data);
//             console.log(error.response.status);
//           }
//         });
//     })
//     .catch((err) => {
//       console.log("error!", err);
//       res.render("pages/writeReview", {
//         my_title: "error",
//         dailyImg: dailyImg,
//         message: "uh oh",
//         user: user,
//         error: true,
//       });
//     });
// });

app.post("/searchSong", function (req, res) {
  var songTitle = req.body.songTitle;
  var artistName = req.body.artist;
  var searchApiCall;
  songTitle.replace(" ", "_");
  artistName.replace(" ", "_");
  console.log(
    "Search song button clicked with song: " +
      songTitle +
      " and artist name: " +
      artistName
  );

  searchApiCall =
    "http://api.musixmatch.com/ws/1.1/track.search?q_track=" +
    songTitle +
    "&q_artist=" +
    artistName +
    "&page_size=10&page=1&s_track_rating=desc&apikey=" +
    musicKey;

  console.log("api call: " + searchApiCall);

  axios({
    method: "GET",
    url: searchApiCall,
    dataType: "json",
  })
    .then((track) => {
      // console.log(track.data);
      // console.log(track.data.message);
      // console.log(track.data.message.header);
      // console.log(track.data.message.body);
      // console.log(track.data.message.body.track_list[0]);
      track_id = track.data.message.body.track_list[0].track.track_id;
      trackPresent = true;
      tracks = track.data.message.body;
      //searchTracks = track.data.message.body;
      // console.log(tracks.track_list);
      // console.log(track_id);

      res.render("pages/writeReview", {
        my_title: "Music Space: Review",
        dailyImg: dailyImg,
        tools: tools,
        //tracks: searchTracks,
        tracks: tracks,
        user: user,
        trackPresent: trackPresent,
        error: false,
        snippet: snippet,
      });
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
      }
    });
});

// console.log("Server is running at " + server_port);
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
// app.listen(server_port);
