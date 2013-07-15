var mysql = require('mysql');
/* If the node mysql module is not found on your system, you may
 * need to do an "sudo npm install -g mysql". */

/* You'll need to fill the following out with your mysql username and password.
 * database: "chat" specifies that we're using the database called
 * "chat", which we created by running schema.sql.*/
var dbConnection = mysql.createConnection({
  user: "haoliu",
  password: "haoliu",
  database: "chat"
});

// dbConnection.connect();


// dbConnection.end();

exports.dbConnection = dbConnection;
