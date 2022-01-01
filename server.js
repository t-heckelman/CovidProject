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
var trackPresent = false;
//var apiCall = 'http://api.musixmatch.com/ws/1.1/track.search?q_song=blackbird&page_size=3&page=1&s_track_rating=desc&apikey=d3effb2990c26720f4799b07e4f1af2b';
var tracks;
var snippet;
var track_id;
var favoriteArtist = 'baby keem';
var globalUsername = "username";
var apiCall = 'http://api.musixmatch.com/ws/1.1/track.search?q_artist= ' + favoriteArtist + '&page_size=3&page=1&s_track_release_date=desc&apikey=d3effb2990c26720f4799b07e4f1af2b';
// nasa api call
axios({
  url:
    "https://api.nasa.gov/planetary/apod?api_key=p0oTvbRVafsxIYbUUg4vRhgBdFMqwKBIeayQVkvX",
  method: "GET",
  dataType: "json",
})
  .then((items) => {
    dailyImg = items.data;
    // console.log("hi", data);
  })
  .catch((error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    }
  });
  var songKey = "d3effb2990c26720f4799b07e4f1af2b";

  //api call for baby keem
  axios({
    method: 'GET',
    url: apiCall,
    dataType: "json",
    parameter: {
      apikey: 'd3effb2990c26720f4799b07e4f1af2b',
    }
  })
    .then((track) => {
      // create array of all track_ids
      // console.log(track.data);
      // console.log(track.data.message);
      // console.log(track.data.message.header);
      // console.log(track.data.message.body);
      // console.log(track.data.message.body.track_list[0]);
      track_id = track.data.message.body.track_list[0].track.track_id;
      trackPresent = true;
      tracks = track.data.message.body;
      // console.log(tracks);
      console.log(track_id);
      // second api call for snippet
      axios({
        method: 'GET',
        url: 'http://api.musixmatch.com/ws/1.1/track.snippet.get?track_id=' + track_id + '&apikey=d3effb2990c26720f4799b07e4f1af2b' ,
        dataType: "json",
        parameter: {
          apikey: 'd3effb2990c26720f4799b07e4f1af2b',
        }
      })
        .then((snipp) => {
          snippet = snipp.data.message.body;
          // console.log(snippet);
          // console.log(snippet.data.message);
          console.log(snippet);
          // console.log(track.data.message.body.track_list[track.data.message.body.track_list.length-1]);
          // console.log(tracks);

        })
        .catch((error) => {
          if(error.response){
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
      if(error.response){
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
app.post("/profile", function (req, res){
  console.log("Profile post");
  var favoriteArtist = req.body.favArtist;
  console.log(favoriteArtist);
  var query1 =
    "UPDATE users SET favorite_artist= '" +
    favoriteArtist +
    "' WHERE username = '" +
    globalUsername +
    "';";
    console.log(query1);
    var query2 = "select * from reviews WHERE username = '" + globalUsername + "'" + "ORDER BY review_date DESC;"
    console.log(query2);
  db.task("get-everything" ,(task) => {
    return task.batch([task.any(query1)]);
  })
  .then((data) => {
    db.task("get-everything" ,(task) => {
      return task.batch([task.any(query2)]);
    })
    .then((songs) => {
      console.log(songs);
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
      songs: [1,2,3,4],
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
  var query1 = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + psw + "';";
  globalUsername = username;
  db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
  })
  .then((info) => {
    if(info[0][0].name != null){
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
  console.log(tracks);
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
});
app.post("/writeReview", function (req, res) {

  /*Link/v1/filter/key*/
  var song = req.body.song;
  song = song.replace(' ', '_');
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
  var apiCall = 'http://api.musixmatch.com/ws/1.1/track.search?q_song=' + song + '&q_artist=the_eagles&apikey=d3effb2990c26720f4799b07e4f1af2b';
  console.log(apiCall);
   db.task("get-everything", (task) => {
    return task.batch([task.any(query1)]);
   })
  .then((data) =>{
    console.log("database passed");
    axios({
      method: 'GET',
      url: apiCall,
      dataType: "json",
      parameter: {
        apikey: 'd3effb2990c26720f4799b07e4f1af2b',
      }
    })
      .then((track) => {
        trackPresent = true;
        // console.log("predata");
        // console.log(track.data.message.body.track_list[0].track);
        // console.log(track.data.message.body.track_list[track.data.message.body.track_list.length-1]);
        // console.log("postdata");
        var tracks = track.data.message.body
        res.render("pages/writeReview", {
          my_title: "Music Space: Review",
          dailyImg: dailyImg,
          tools: tools,
          tracks: tracks,
          user: user,
          trackPresent: trackPresent,
          error: false,
        })
      })
      .catch((error) => {
        if(error.response){
          console.log(error.response.data);
          console.log(error.response.status);
        }
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

app.post("/searchSong", function(req, res){
  var songTitle = req.body.songTitle;
  var artistName = req.body.artist;
  songTitle.replace(" ", "_");
  artistName.replace(" ", "_");
  console.log("Search sogng button clicked with song: "+  songTitle + " and artist name: " + artistName);



  apiCall = 'http://api.musixmatch.com/ws/1.1/track.search?q_track=' + songTitle + '&q_artist=' + artistName+ '&page_size=10&page=1&s_track_rating=desc&apikey=d3effb2990c26720f4799b07e4f1af2b'

  console.log("api call: " + apiCall);

  axios({
    method: 'GET',
    url: apiCall,
    dataType: "json",
    parameter: {
      apikey: 'd3effb2990c26720f4799b07e4f1af2b',
    }
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
      console.log(tracks);
      console.log(track_id);

      res.render("pages/writeReview",{
        my_title: "Music Space: Review",
          dailyImg: dailyImg,
          tools: tools,
          tracks: tracks,
          user: user,
          trackPresent: trackPresent,
          error: false,
          snippet: snippet,
      })
    })
      .catch((error) => {
        if(error.response){
          console.log(error.response.data);
          console.log(error.response.status);
        }
      });



  })

// console.log("Server is running at " + server_port);
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
// app.listen(server_port);
