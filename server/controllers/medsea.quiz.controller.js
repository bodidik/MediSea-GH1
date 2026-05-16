// FILE: server/controllers/medsea.quiz.controller.js
// ESM uyumlu. Premium quiz: next & submit.

import QuizAttempt from "../models/QuizAttempt.js";

// Basit dummy soru üretici (gerçekte DB'den çekersin)
function makeDummyQuestions(n = 10) {
  const opts = ["A", "B", "C", "D", "E"];
  return Array.from({ length: n }).map((_, i) => {
    const id = `q_${i + 1}`;
    const answer = opts[Math.floor(Math.random() * opts.length)];
    return {
      id,
      stem: `Soru ${i + 1} kökü (dummy)`,
      options: opts,
      answer, // demo: client'ta da bulunuyor
      section: ["Nephrology", "Cardiology", "Endocrinology"][i % 3],
      type: "board",
    };
  });
}

export async function nextQuiz(req, res) {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit || "10", 10), 50));
  const items = makeDummyQuestions(limit);
  res.json({ ok: true, source: "daily-quiz", items });
}

export async function submitQuiz(req, res) {
  try {
    const externalId =
      req.query.userId ||
      req.query.externalId ||
      req.headers["x-user-id"] ||
      (req.headers.cookie || "").match(/(?:^|; )mk_uid=([^;]+)/)?.[1] ||
      "guest";

    const { source = "daily-quiz", items = [] } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "items boş olamaz" });
    }

    const total = items.length;
    const correct = items.filter((x) => x.selected && x.selected === x.correctAnswer).length;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    await QuizAttempt.create({
      userId: externalId,
      source,
      total,
      correct,
      wrong,
      accuracy,
      payload: items,
    });

    res.json({ ok: true, message: "Quiz submitted", total, correct, wrong, accuracy });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

export default { nextQuiz, submitQuiz };
