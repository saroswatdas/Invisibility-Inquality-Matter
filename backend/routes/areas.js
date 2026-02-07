const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/areas.json");

function loadAreas() {
  const raw = fs.readFileSync(dataPath);
  return JSON.parse(raw);
}

// GET all areas
router.get("/areas", (req, res) => {
  const areas = loadAreas();
  res.json(areas);
});

// Compare two areas
router.get("/compare", (req, res) => {
  const { id1, id2 } = req.query;

  const areas = loadAreas();

  const area1 = areas.find((a) => String(a.id) === String(id1));
  const area2 = areas.find((a) => String(a.id) === String(id2));

  if (!area1 || !area2) {
    return res.status(404).json({ error: "One or both areas not found" });
  }

  res.json({ area1, area2 });
});

module.exports = router;
