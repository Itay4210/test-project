const express = require("express");
const { getGameState } = require("../controllers/gameController"); 

const router = express.Router();


router.get("/:gameId", getGameState);

module.exports = router;
