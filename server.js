let express = require("express");
let app = express();
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//const server_port = 5050;
const axios = require("axios");
const qs = require("axios");

require('dotenv').config()

var Filter = require('bad-words'),
    filter = new Filter();
let pgp = require("pg-promise")();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/"));
const tools = require("./resources/js/script");

// This line is necessary for us to use relative paths and access our resources directory
//put this stuff in env file
var dailyImg;
let dbConfig = {
  host: "127.0.0.1",
  port: 5432,
  database: "postgres",
  user: "teddyheckelman",
  password: "password",
};

// env variables
const musicKey = process.env.MUSIX_API;
const nasaKey = process.env.NASA_API;
var secret = process.env.key;
const isProduction = process.env.NODE_ENV === "production";

//instantiating sha256 encryptor
var str = "test";
const crypt = require("crypto");
const algorithm = 'aes-256-cbc';
var fakeKey = crypt.randomBytes(32);
const name = crypt.randomBytes(16); //initialization vector - Usernamne
console.log(name);
var test2 = "test";
console.log(test2);

function encrypt(text, iv) {
   let cipher = crypt.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
   let iv = Buffer.from(text.iv, 'hex');
   let encryptedText = Buffer.from(text.encryptedData, 'hex');
   let decipher = crypt.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}
// testing
test2 = encrypt(test2, name);
console.log(test2);
test2 = decrypt(test2);
console.log(test2);

//config db
dbConfig = isProduction ? process.env.DATABASE_URL : dbConfig;
let db = pgp(dbConfig);

//userVariables
var user = "Login";
var trackPresent = false;
var tracks;
var snippet;
var track_id;
var favoriteArtist = "baby keem";
var globalUsername = "username";
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
  })
  .catch((error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    }
  });

axios({
  method: "GET",
  url: "http://api.musixmatch.com/ws/1.1/track.search?q_artist=baby_keem&page_size=10&page=1&s_track_release_date=desc&apikey=" + musicKey,
  dataType: "json",
})
  .then((track) => {
    track_id = track.data.message.body.track_list[0].track.track_id;
    trackPresent = true;
    tracks = track.data.message.body;
    console.log(track_id);
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
    console.log(info[0][0]);
    if (info[0][0] != null) {
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
app.post("/register", function (req, res) {
  console.log("have clicked register and entered function");
  var email = req.body.email;
  var name = req.body.name;
  var username = req.body.username;
  var psw = req.body.psw;
  var checkUsername = false;
  username = username.toUpperCase();
  globalUsername = username;
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
      console.log(filter.clean(username));
      console.log(check[0]);
      console.log(username);
      if((check[0] == null) && (username == filter.clean(username))){
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
      else if(username == filter.clean(username)){
        user = name;
        globalUsername = username;
        console.log(checkUsername);
        res.redirect("/");
      }
      else{
        res.redirect("/register")
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

app.get("/writeReview", function (req, res) {
  console.log("write review page loaded");

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
  //there has got to be a better way of doing this
  var review;
  var review0 = req.body.e0;
  console.log("review:" + review0);
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
  var song;
  if (review0 != null) {
    review = review0;
    song =
      tracks.track_list[0].track.track_name +
      " by " +
      tracks.track_list[0].track.artist_name;
  }
  if (review1 != null) {
    review = review1;
    song =
      tracks.track_list[1].track.track_name +
      " by " +
      tracks.track_list[1].track.artist_name;
  }
  if (review2 != null) {
    review = review2;
    song =
      tracks.track_list[2].track.track_name +
      " by " +
      tracks.track_list[2].track.artist_name;
  }
  if (review3 != null) {
    review = review3;
    song =
      tracks.track_list[3].track.track_name +
      " by " +
      tracks.track_list[3].track.artist_name;
  }
  if (review4 != null) {
    review = review4;
    song =
      tracks.track_list[4].track.track_name +
      " by " +
      tracks.track_list[4].track.artist_name;
  }
  if (review5 != null) {
    review = review5;
    song =
      tracks.track_list[5].track.track_name +
      " by " +
      tracks.track_list[5].track.artist_name;
  }
  if (review6 != null) {
    review = review6;
    song =
      tracks.track_list[6].track.track_name +
      " by " +
      tracks.track_list[6].track.artist_name;
  }
  if (review7 != null) {
    review = review7;
    song =
      tracks.track_list[7].track.track_name +
      " by " +
      tracks.track_list[7].track.artist_name;
  }
  if (review8 != null) {
    review = review8;
    song =
      tracks.track_list[8].track.track_name +
      " by " +
      tracks.track_list[8].track.artist_name;
  }
  if (review9 != null) {
    review = review9;
    song =
      tracks.track_list[9].track.track_name +
      " by " +
      tracks.track_list[9].track.artist_name;
  }
  console.log("review: " + review);
  console.log("filtered review" + filter.clean(review));
  review = filter.clean(review);
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
      track_id = track.data.message.body.track_list[0].track.track_id;
      trackPresent = true;
      tracks = track.data.message.body;
      res.render("pages/writeReview", {
        my_title: "Music Space: Review",
        dailyImg: dailyImg,
        tools: tools,
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
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Express running ??? PORT ${server.address().port}`);
});
