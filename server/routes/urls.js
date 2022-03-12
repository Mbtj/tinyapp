const router = require('express').Router();
import { randomStr } from '../../helpers';


module.exports = (db) => {
  // JSON PAGE
  router.get(".json", (req, res) => {
    res.json(urlDatabase);
  });

  // POST FOR ADDING NEW SHORT LINK
  app.post("/", (req, res) => {
    const shorten = randomStr(); // Create new url ID
    const queryStr = "INSERT INTO urls (id, longurl, user_id) VALUES ($1, $2, $3);";

    // urlDatabase[shorten] = {
    //   longURL: req.body.longURL,
    //   userID: req.session.user_id
    // };
    db
      .query(queryStr,[shorten, req.body.longURL, req.session.user_id])
      .then(() => {
        res.redirect(`/urls/${shorten}`);
      })
      .catch((err) => console.log(err));
  
  });


  // POST FOR UPDATING EXISTING SHORTURL
  router.post("/:id", (req, res) => {
    const urlID = req.params.id;
    const userID = req.session.user_id;

    if (urlForUser(userID, urlID, urlDatabase)) {
      urlDatabase[urlID].longURL = req.body.longURL;
      res.redirect(`/urls/${req.params.id}`);
    } else {
      res.status(400).send("<h1>Illegal command. Click <a href=\"/urls\">here</a> to return to the main page.</h1>");
    }

    // POST FOR DELETING EXISTING SHORT LINK
    router.post("/:id/delete", (req, res) => {
      const urlID = req.params.id;

      if (urlForUser(req.session.user_id, urlID, urlDatabase)) {
        delete urlDatabase[urlID];
        res.redirect("/urls");
      } else {
        res.status(400).send("<h1>Illegal command. Click <a href=\"/urls\">here</a> to return to the main page.</h1>");
      }

      return router;
    });
  });



}