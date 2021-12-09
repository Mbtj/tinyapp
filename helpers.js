// CHECK EMAIL
const getUserByEmail = function GetUserFromUserDatabaseByEmail(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return null;
}

// BOOLEAN FOR OWNERSHIP OVER URL
const urlForUser = function urlOwnedByUser(userID, urlID, urlDatabase) {
  return  urlDatabase && 
    urlDatabase[urlID] &&
    urlDatabase[urlID].userID === userID;
}

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


module.exports = {
  getUserByEmail,
  urlForUser,
  randomStr
};