var express = require('express');
var router = express.Router();
const db = require('../services/db');
const path = require('path');


router.get('/', async function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});



router.get('/dogs', async function (req, res, next) {
    try {
        const [rows] = await db.query(
            `SELECT D.name AS dog_name, D.size, U.username AS owner_username
            FROM Dogs D
            INNER JOIN Users U ON D.owner_id = U.user_id`
        );

        res.send(rows);
    } catch (err) {
        res.status(500).json({ msg: `Error retrieving: ${err}` });
    }
});


router.get('/walkrequests/open', async function (req, res, next) {
    try {
        const [rows] = await db.query(
            `SELECT WR.request_id, D.name AS dog_name, WR.requested_time, WR.duration_minutes, WR.location, U.username AS owner_username
            FROM WalkRequests WR
            INNER JOIN Dogs D ON WR.dog_id = D.dog_id
            INNER JOIN  Users U ON D.owner_id = U.user_id
            WHERE WR.status = "open"`
        );

        res.send(rows);
    } catch (err) {
        res.status(500).json({ msg: `Error retrieving: ${err}` });
    }
});


router.get('/walkers/summary', async function (req, res, next) {
    try {
        const [completedWalks] = await db.query(
            `SELECT U.username AS walker_username, COUNT(WalkRatings.rating_id) AS total_ratings, ROUND(AVG(WalkRatings.rating),1) AS average_rating,
            (SELECT COUNT(*) FROM WalkRequests WRQ JOIN WalkApplications WA ON WA.request_id = WRQ.request_id WHERE WalkRequests.status = 'completed' AND WA.walker_id = U.user_id) AS completed_walks
            From Users U
            LEFT JOIN WalkRatings  WRT ON WRT.walker_id = U.user_id
            WHERE U.role = 'walker'
            GROUP BY U.user_id;
            `
        );

        res.send(rows);
    } catch (err) {
        res.status(500).json({ msg: `Error retrieving: ${err}` });
    }
});





module.exports = router;
