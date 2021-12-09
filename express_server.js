const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const { getUserByEmail, urlForUser, randomStr } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: [ "key1", "key2"]
}));

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
    password: bcrypt.hashSync("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk")
  }
};


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
    user_id: req.session.user_id,
  };

  if (!templateVars.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


// PAGE FOR A SHORTURL INSTANCE
app.get("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const userID = req.session.user_id;

  if (!urlDatabase[urlID]) {
    res.redirect("/urls");
  } else if (!urlForUser(userID, urlID, urlDatabase)) {
    res.status(400).send(`<h1>You cannot edit this url.</h1>\n<h2>Click <a href=\"/u/${urlID}\">here<\a> to access the designated url`);
  } else {
    const templateVars = {
      users,
      shortURL: urlID,
      user_id: req.session.user_id,
      longURL: urlDatabase[urlID].longURL,
    };
    res.render("urls_show", templateVars);
  }
});


// PAGE FOR URL INDEX
app.get("/urls", (req, res) => {
  const templateVars = {
    users,
    user_id: req.session.user_id,
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});


// GET REQUEST FOR REGISTER
app.get("/register", (req, res) => {
  const templateVars = {
    users,
    user_id: req.session.user_id,
    urls: urlDatabase
  };
  res.render("urls_reg",templateVars);
});


// GET REQUEST FOR LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    users,
    user_id: req.session.user_id,
    urls: urlDatabase
  };

  res.render("urls_login", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;

  if (urlDatabase[urlID]) {
    const longURL = urlDatabase[urlID].longURL;
    res.redirect(longURL);
  } else {
    res.status(400).send(`<h1>Link for ${urlID} does not exist. Click <a href=\"/urls\">here</a> to return to the main page.</h1>`)
  }
});

// === POST REQUESTS ===

// POST FOR UPDATING EXISTING SHORTURL
app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const userID = req.session.user_id;

  if (urlForUser(userID, urlID, urlDatabase)) {
    urlDatabase[urlID].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(400).send("<h1>Illegal command. Click <a href=\"/urls\">here</a> to return to the main page.</h1>");
  }
});


// POST FOR ADDING NEW SHORT LINK
app.post("/urls", (req, res) => {

  console.log(req.body);
  const shorten = randomStr();
  urlDatabase[shorten] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shorten}`);
});


// POST FOR DELETING EXISTING SHORT LINK
app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  if (urlForUser(req.session.user_id, urlID, urlDatabase)) {
    delete urlDatabase[urlID];
    res.redirect("/urls");
  } else {
    res.status(400).send("<h1>Illegal command. Click <a href=\"/urls\">here</a> to return to the main page.</h1>");
  }
});


// POST FOR USER LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);

  console.log(userID, users);

  if (userID) { // check email
    if (bcrypt.hashSync(password, users[userID].password)) { //check password
      req.session.user_id = userID;
    } else {
      res.status(403).send("<h1>Incorrect email/password Click <a href=\"/login\">here</a> to return to the login page.</h1>");
    }
  } else { // no email match
    res.status(403).send("<h1>Incorrect email/password Click <a href=\"/login\">here</a> to return to the login page.</h1>");
  }

  res.redirect("/urls");
});


// POST FOR USER LOGOUT
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});


// POST FOR REGISTERING NEW ACCOUNT
app.post("/register", (req, res) => {
  // generate new id
  const id = randomStr();

  const password = req.body.password;
  const email = req.body.email;

  if (!password || !email) {
    res.status(400).send("<h1>Bad Request Click <a href=\"/register\">here</a> to return to the registration page.</h1>");
  }

  if (getUserByEmail(email)) {
    res.status(400).send("<h1>Account Already Exists Click <a href=\"/register\">here</a> to return to the registration page.</h1>");
  }

  // create new user
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password)
  };
  console.log(users);

  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
