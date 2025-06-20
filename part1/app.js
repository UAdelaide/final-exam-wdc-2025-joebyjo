var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const db = require('./services/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// console.log(await db.query('select * from Users'));


// (async () => {
//   try {
//     console.log(await db.query('select * from Users'))
//   } catch (err) {
//     console.error('not working', err);
//   }
// })();


(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // create table and insert if it doesn't exist
    await db.execute(`
      CREATE TABLE Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('owner', 'walker') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Dogs (
        dog_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES Users(user_id)
    );

    CREATE TABLE WalkRequests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        dog_id INT NOT NULL,
        requested_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
    );

    CREATE TABLE WalkApplications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        CONSTRAINT unique_application UNIQUE (request_id, walker_id)
    );

    CREATE TABLE WalkRatings (
        rating_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        owner_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comments TEXT,
        rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        FOREIGN KEY (owner_id) REFERENCES Users(user_id),
        CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
    );


    INSERT INTO Users (username, email, password_hash, role)
    VALUES
    ('alice123', 'alice@example.com', 'hashed123', 'owner'),
    ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
    ('carol123', 'carol@example.com', 'hashed789', 'owner'),
    ('joe', 'joe@example.com', 'hashed69', 'owner'),
    ('messi', 'messi@example.com', 'hashed10', 'owner');


    INSERT INTO Dogs (owner_id, name, size)
    VALUES
    ((SELECT user_id FROM Users WHERE username = 'alice123'), 'max', 'medium'),
    ((SELECT user_id FROM Users WHERE username = 'carol123'), 'bella', 'small'),
    ((SELECT user_id FROM Users WHERE username = 'joe'), 'abc', 'large'),
    ((SELECT user_id FROM Users WHERE username = 'joe'), 'xyz', 'medium'),
    ((SELECT user_id FROM Users WHERE username = 'messi'), 'ghi', 'small');

    INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
    VALUES
    ((SELECT dog_id FROM Dogs WHERE name = 'max'),'2025-06-10 08:00:00', 30, 'parklands', 'open'),
    ((SELECT dog_id FROM Dogs WHERE name = 'bella'),'2025-06-10 09:30:00', 45, 'beachside Ave', 'accepted'),
    ((SELECT dog_id FROM Dogs WHERE name = 'abc'),'2025-06-10 09:30:00', 45, 'beachside Ave', 'accepted'),
    ((SELECT dog_id FROM Dogs WHERE name = 'xyz'),'2025-06-10 09:30:00', 45, 'beachside Ave', 'accepted'),
    ((SELECT dog_id FROM Dogs WHERE name = 'ghi'),'2025-06-10 09:30:00', 45, 'beachside Ave', 'accepted');
    `);

  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
