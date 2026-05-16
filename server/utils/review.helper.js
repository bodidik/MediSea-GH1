// FILE: server/utils/review.helper.js
const ReviewCard = require("../models/ReviewCard");

/**
 * Belirtilen contentId ve type için ReviewCard oluşturur (varsa update etmez, sadece garanti eder)
 */
async function ensureReviewCard({ externalId, contentId, section, type }) {
  if (!contentId || !type) return;

  const existing = await ReviewCard.findOne({ contentId, type });
  if (existing) return existing;

  return ReviewCard.create({
    externalId,
    contentId,
    section,
    type,
    dueAt: new Date(),   // hemen bugün vadesi
    interval: 1,
    ease: 2.5,
    history: [],
  });
}

module.exports = { ensureReviewCard };
