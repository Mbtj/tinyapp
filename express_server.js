const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const randomStr = function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let shortLink = '';
  const charLength = 6;
  const index = () => Math.floor(Math.random() * characters.length);

  for (let i = 0; i < charLength; i++) {
    shortLink += characters[index()];
  }
  
  return shortLink;
}


// ROOT PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});


// JSON PAGE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});



app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// REQUIRES DIFFERENT USES
// adds new tinyurl
app.post("/urls", (req, res) => {

  console.log(req.body);
  const shorten = randomStr();
  urlDatabase[shorten] = req.body.longURL;
  res.redirect(`/urls/${shorten}`);
});

app.post("/urls/:shortURL/delete", (req, res) => { 
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };

  res.cookie("username", req.body.username);
  //res.render("urls_index", templateVars);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
