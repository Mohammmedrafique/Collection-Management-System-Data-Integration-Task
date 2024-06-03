// const express = require("express");
// const { google } = require("googleapis");
// const mongoose = require("mongoose");
// const Case = require("./models/Case"); // Import the model
// const cron = require("node-cron");
// require('dotenv').config()
// const app = express();

// app.use(express.json());

// const authentication = async () => {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: "steam-outlet-425108-e3-4ba5c228ca42.json",
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });
//   const client = await auth.getClient();
//   const sheets = google.sheets({ version: "v4", auth: client });
//   return { sheets };
// };

// const id = `1ficKwe-cHK8EJa4lWTNI_obseOUDta-Uh0E3P6LCgZc`;

// // MongoDB connection details
// const uri = process.env.mongo

// mongoose
//   .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.log("Failed to connect to MongoDB", err));

// const fetchDataAndUpdateDB = async () => {
//   try {
//     const { sheets } = await authentication();
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: id,
//       range: "Sheet1!A1:E10",
//     });

//     const rows = response.data.values;
//     if (!rows || rows.length === 0) {
//       console.log("No data found in the spreadsheet.");
//       return;
//     }

//     const headers = rows[0];
//     const data = rows.slice(1).map((row) => {
//       let rowObject = {};
//       headers.forEach((header, index) => {
//         rowObject[header.replace(" ", "").toLowerCase()] = row[index];
//       });
//       return {
//         bankName: rowObject.bankname,
//         propertyName: rowObject.propertyname,
//         city: rowObject.city,
//         borrowerName: rowObject.borrowername,
//         createdAt: rowObject.createdat,
//       };
//     });

//     // Insert or update data in MongoDB
//     for (const entry of data) {
//       await Case.findOneAndUpdate(
//         { bankName: entry.bankName, propertyName: entry.propertyName }, // Query to find the existing document
//         entry, // Data to update
//         { upsert: true, new: true } // Options: upsert to create if it doesn't exist, new to return the updated document
//       );
//     }

//     console.log("Data successfully stored/updated in MongoDB");
//   } catch (e) {
//     console.log(e);
//   }
// };

// app.get("/add", async (req, res) => {
//   try {
//     await fetchDataAndUpdateDB();
//     res.send("Data successfully stored/updated in MongoDB");
//   } catch (e) {
//     console.log(e);
//     res.status(500).send();
//   }
// });

// // Schedule tasks to run at 10 AM and 5 PM IST daily
// cron.schedule("0 0 10 * * *", fetchDataAndUpdateDB, {
//   timezone: "Asia/Kolkata",
// });

// cron.schedule("0 25 15 * * *", fetchDataAndUpdateDB, {
//   timezone: "Asia/Kolkata",
// });

// app.listen(process.env.PORT, () => {
//   console.log("server is running");
// });
const express = require("express");
const { google } = require("googleapis");
const mongoose = require("mongoose");
const Case = require("./models/Case"); // Import the model
const cron = require("node-cron");
require("dotenv").config();
const app = express();

app.use(express.json());

const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "steam-outlet-425108-e3-4ba5c228ca42.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  return { sheets };
};

const id = `1ficKwe-cHK8EJa4lWTNI_obseOUDta-Uh0E3P6LCgZc`;

// // MongoDB connection details
// const uri = process.env.MONGO_URI;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

const fetchDataAndUpdateDB = async () => {
  try {
    const { sheets } = await authentication();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: "Sheet1!A1:E10",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in the spreadsheet.");
      return;
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      let rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header.replace(" ", "").toLowerCase()] = row[index];
      });
      return {
        bankName: rowObject.bankname,
        propertyName: rowObject.propertyname,
        city: rowObject.city,
        borrowerName: rowObject.borrowername,
        createdAt: rowObject.createdat,
      };
    });

    // Insert or update data in MongoDB
    for (const entry of data) {
      await Case.findOneAndUpdate(
        { bankName: entry.bankName, propertyName: entry.propertyName }, // Query to find the existing document
        entry, // Data to update
        { upsert: true, new: true } // Options: upsert to create if it doesn't exist, new to return the updated document
      );
    }

    console.log("Data successfully stored/updated in MongoDB");
  } catch (e) {
    console.error("Error fetching data and updating DB:", e);
  }
};

app.get("/add", async (req, res) => {
  try {
    await fetchDataAndUpdateDB();
    res.send("Data successfully stored/updated in MongoDB");
  } catch (e) {
    console.error("Error handling /add request:", e);
    res.status(500).send("Internal Server Error");
  }
});

// Schedule tasks to run at 10 AM and 5 PM IST daily
cron.schedule("0 10 * * *", fetchDataAndUpdateDB, {
  timezone: "Asia/Kolkata",
});

cron.schedule("0 17 * * *", fetchDataAndUpdateDB, {
  timezone: "Asia/Kolkata",
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
