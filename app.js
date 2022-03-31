require("dotenv").config();
require("./config/database").connect();
const bcrypt = require("bcryptjs/dist/bcrypt");
const express = require("express");
const User = require("./model/user");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

// Logic goes here


// Register
app.post("/register", async (req, res) => {
  // Register logic goes here
  try {
    // Get the user input
    const { first_name, last_name, email, password } = req.body;
  

  // Validate user input
  if(!(email && password && first_name && last_name)) {
    res.status(404).send("All input is required");
  }

  // Check if the user already exists
  // validate if the user exists in the database

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    res.status(409).send("User already exists, please log in");
  }

  // encrypt user password
  encryptedPassword = await bcrypt.hash(password, 10);

  // Create user in the database

  const user = await User.create({
    first_name,
    last_name,
    email: email.toLowerCase(),
    password: encryptedPassword,
  });

  // Create token
  const token = jwt.sign(
    { user_id: user._id, email },
    process.env.TOKEN_KEY,
    { 
      expiresIn: "2h",
    }
  );

  // Save user token
  user.token = token;

  // return new user
  res.status(201).json(user);
   
  } catch (err) {
    console.log(err);
  }
});

// Login
app.post("/login", async (req, res) => {
  // Login logic goes here

  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if(!(email && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exists in our database
    const user = await User.findOne({ email });

    if(user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }

    res.status(400).send("Invalid credentials");

  } catch (err) {
    console.log(err);
  }

});

module.exports = app;