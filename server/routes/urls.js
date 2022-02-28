const router = require('express').Router();

module.exports = (db) => {
  // JSON PAGE
  router.get(".json", (req, res) => {
    res.json(urlDatabase);
  });

  // POST FOR ADDING NEW SHORT LINK
  app.post("/", (req, res) => {
    const shorten = randomStr(); // Create new url ID

    urlDatabase[shorten] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shorten}`);
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
    router.post("/urls/:id/delete", (req, res) => {
      const urlID = req.params.id;

      if (urlForUser(req.session.user_id, urlID, urlDatabase)) {
        delete urlDatabase[urlID];
        res.redirect("/urls");
      } else {
        res.status(400).send("<h1>Illegal command. Click <a href=\"/urls\">here</a> to return to the main page.</h1>");
      }
    });
  });



}