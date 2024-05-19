// Get the client
const mysql = require("mysql2");

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Utube",
  dateStrings: true,
});

// // A simple SELECT query
// connection.query("SELECT * FROM `owners`", function (err, results, fields) {
//   //   console.log(results[0].id);
//   //   console.log(results[0].umail);
//   //   console.log(results[0].ownerName);

//   var { id, umail, ownerName, createdAt } = results[0];
//   console.log(id);
//   console.log(umail);
//   console.log(ownerName);
//   console.log(createdAt);
// });

module.exports = connection;
