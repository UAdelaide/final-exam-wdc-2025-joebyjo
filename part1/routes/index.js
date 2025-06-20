var express = require('express');
var router = express.Router();
const db = require('../services/db');

router.get('/dogs', async function(req, res, next) {
    try {
        const [rows] = await db.query(
            `SELECT D.name AS dog_name, D.size, U.username AS owner_username
			FROM Dogs D
			 INNER JOIN Users U ON D.owner_id = U.user_id`
        );

        res.send(rows);
    } catch (err) {
        res.status(500).json({ msg: `Error retrieving: ${err}`});
    }
});


router.get('/walkrequests/open', async function(req, res, next) {
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
        res.status(500).json({ msg: `Error retrieving: ${err}`});
    }
});


module.exports = router;
