const express = require('express');
const router = express.Router();
const db = require('../models/db');

// added route to get all registered dogs
router.get('/', async function (req, res, next) {
    try {
        // getting dogs from db
        const [rows] = await db.query(
            `SELECT D.dog_id, D.name AS dog_name, D.size, D.owner_id
            FROM Dogs D`
        );

        res.send(rows);
    } catch (err) {
        res.status(500).json({ msg: `Error retrieving: ${err}` });
    }
});




module.exports = router;