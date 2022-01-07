console.log("connected to client-side server");
function passwVal() {
  var myInput = document.getElementById("psw");
  var confirmMyInput = document.getElementById("cpsw");
  var letter = document.getElementById("letter");
  var capital = document.getElementById("capital");
  var number = document.getElementById("number");
  var length = document.getElementById("length");
  var match = document.getElementById("match");
  var validEmail = document.getElementById("validEmail");

  myInput.onkeyup = function () {
    console.log("key pressed?");
    var lowerCaseLetters = /[a-z]/g;
    var upperCaseLetters = /[A-Z]/g;
    var numbers = /[0-9]/g;
    var minLength = 8;

    //console.log(letter.classList);

    if (myInput.value.match(lowerCaseLetters)) {
      letter.classList.remove("invalid");
      letter.classList.add("valid");
    } else {
      letter.classList.remove("valid");
      letter.classList.add("invalid");
    }

    if (myInput.value.match(upperCaseLetters)) {
      capital.classList.remove("invalid");
      capital.classList.add("valid");
    } else {
      capital.classList.remove("valid");
      capital.classList.add("invalid");
    }

    if (myInput.value.match(numbers)) {
      number.classList.remove("invalid");
      number.classList.add("valid");
    } else {
      number.classList.remove("valid");
      number.classList.add("invalid");
    }

    if (myInput.value.length >= minLength) {
      length.classList.remove("invalid");
      length.classList.add("valid");
    } else {
      length.classList.remove("valid");
      length.classList.add("invalid");
    }
    enableButton(letter, capital, number, length, match, validEmail);
  };
  confirmMyInput.onkeyup = function () {
    var passEqualsConfPass = myInput.value == confirmMyInput.value; // TODO: Change this to the condition that needs to be checked so that the text entered in password equals the text in confirm password
    console.log(passEqualsConfPass);
    if (passEqualsConfPass) {
      match.classList.remove("invalid");
      match.classList.add("valid");
    } else {
      match.classList.remove("valid");
      match.classList.add("invalid");
    }
    enableButton(letter, capital, number, length, match, validEmail);
  };
}

function clicked() {
  console.log("Ouch");
}

function emailVal() {
  var email = document.getElementById("email");
  var letter = document.getElementById("letter");
  var capital = document.getElementById("capital");
  var number = document.getElementById("number");
  var length = document.getElementById("length");
  var match = document.getElementById("match");
  var validEmail = document.getElementById("validEmail");

  console.log(email);
  var re = /\S+@\S+\.\S+/;
  var valid = re.test(email.value);
  console.log("valid email?", valid);

  if (valid) {
    validEmail.classList.remove("invalid");
    validEmail.classList.add("valid");
  }

  enableButton(letter, capital, number, length, match, validEmail);
}

function enableButton(letter, capital, number, length, match, email) {
  var button = document.getElementById("my_submit_button");
  var condition =
    letter.classList.contains("valid") &&
    capital.classList.contains("valid") &&
    number.classList.contains("valid") &&
    length.classList.contains("valid") &&
    match.classList.contains("valid") &&
    email.classList.contains("valid"); // TODO: Replace false with the correct condition

  if (condition) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

function reviewButton (){
  var button = document.getElementById("button");
  var song = document.getElementById("song");
  var review = document.getElementById("review");
  var artist = document.getElementById("artist");

  // var condition = (review.value != "" && song.value != "" && artist.value !="");
  var condition = (song.value != "" || artist.value !="");

  if(condition){
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

function enableWriteButton(){
  var reviewButton = document.getElementById("review-button");
  var reviewText = document.getElementById("review-text")

  console.log("reviewtext:" + reviewText.value);

  if(reviewText.value == ""){
    reviewButton.disabled = true;
  } else{
    reviewButton.disabled = false;
  }
}
