const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// enable ejs
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


// === HELPER FUNCTIONS ===

// GENERATE NEW SERIES OF RANDOM CHARACTERS
const randomStr = function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let newStr = '';
  const charLength = 6;

  // function gets random index
  const index = () => Math.floor(Math.random() * characters.length);

  // build string
  for (let i = 0; i < charLength; i++) {
    newStr += characters[index()];
  }
  
  return newStr;
}


// CHECK EMAIL
const emailLookup = function IsAlreadyExistingEmail(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return null;
}

// === GET REQUESTS ===
// ROOT PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});


// JSON PAGE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// PAGE FOR NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
  }

  if (!templateVars.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


// PAGE FOR A SHORTURL INSTANCE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});


// PAGE FOR URL INDEX
app.get("/urls", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});


// GET REQUEST FOR REGISTER
app.get("/register", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("urls_reg",templateVars);
});


// GET REQUEST FOR LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };

  res.render("urls_login", templateVars);
});

// === POST REQUESTS ===

// POST FOR UPDATING EXISTING SHORTURL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});


// POST FOR ADDING NEW SHORT LINK
app.post("/urls", (req, res) => {

  console.log(req.body);
  const shorten = randomStr();
  urlDatabase[shorten] ={
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/${shorten}`);
});


// POST FOR DELETING EXISTING SHORT LINK
app.post("/urls/:shortURL/delete", (req, res) => { 
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// POST FOR USER LOGIN
app.post("/login", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  const userID = emailLookup(req.body.email);
  console.log(userID, users);

  if (userID) { // check email
    if (users[userID].password === req.body.password) { //check password
      res.cookie("user_id", userID);
    } else {
      res.status(403).send("Incorrect email/password");
    }
  } else { // no email match
    res.status(403).send("Incorrect email/password");
  }

  //res.render("urls_index", templateVars);
  res.redirect("/urls");
});


// POST FOR USER LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  // generate new id
  const userID = randomStr();

  if (!req.body.password || !req.body.email) {
    res.status(400).send("Bad Request");
  }
  if (emailLookup(req.body.email)) {
    res.status(400).send("Email Already Exists");
  }

  // create new user
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  console.log(users);

  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
