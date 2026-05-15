// FILE: server/scripts/seedReviewCards.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Topic = require("../models/Topic");
const Board = require("../models/Board");
const CaseModel = require("../models/Case");
const Video = require("../models/Video");
const Note = require("../models/Note");
const { ensureReviewCard } = require("../utils/review.helper");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo bağlandı");

  let created = 0;

  async function processModel(Model, type) {
    const docs = await Model.find({});
    for (const d of docs) {
      await ensureReviewCard({
        externalId: "seed",
        contentId: String(d._id),
        section: d.section || "",
        type,
      });
      created++;
    }
    console.log(`${type}: ${docs.length} kayıt işlendi`);
  }

  await processModel(Topic, "topic");
  await processModel(Board, "board");
  await processModel(CaseModel, "case");
  await processModel(Video, "video");
  await processModel(Note, "note");

  console.log(`Toplam ${created} ReviewCard işlendi`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
