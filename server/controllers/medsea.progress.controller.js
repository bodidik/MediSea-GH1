// ESM - kullanıcı ilerleme aksiyonları (hafızada tutulur)
const _users = global._mkUsers || new Map();
global._mkUsers = _users;

function getUser(id) {
  const u = _users.get(id) || {
    plan: "free",
    solved: 0,
    accuracy: 0,
    streakDays: 0,
    rankPercentile: 100,
    todaySolved: 0,
    lastSolveDate: null
  };
  _users.set(id, u);
  return u;
}

export async function tickProgress(req, res) {
  try {
    const userId = req.query.userId || "guest";
    const correct = String(req.query.correct || "true") === "true";
    const u = getUser(userId);

    // streak kontrolü (tarihe göre)
    const todayKey = new Date().toDateString();
    if (u.lastSolveDate !== todayKey) {
      u.lastSolveDate = todayKey;
      u.streakDays = (u.streakDays || 0) + 1;
      u.todaySolved = 0;
    }

    u.todaySolved = (u.todaySolved || 0) + 1;
    u.solved = (u.solved || 0) + 1;

    // kaba accuracy (doğru/yanlış dağılımı tutulmuyor, tahmini)
    const prevAcc = u.accuracy || 0;
    const delta = correct ? 1 : 0;
    const accEst = Math.max(0, Math.min(100, Math.round((prevAcc * 0.9) + (delta * 100 * 0.1))));
    u.accuracy = accEst;

    res.json({ ok: true, user: u });
  } catch (e) {
    res.status(500).json({ error: e?.message || "tick failed" });
  }
}

export async function resetToday(req, res) {
  try {
    const userId = req.query.userId || "guest";
    const u = getUser(userId);
    u.todaySolved = 0;
    res.json({ ok: true, user: u });
  } catch (e) {
    res.status(500).json({ error: e?.message || "reset failed" });
  }
}

export async function setPlan(req, res) {
  try {
    const userId = req.query.userId || "guest";
    const plan = (req.query.plan || "free");
    const u = getUser(userId);
    u.plan = plan;
    res.json({ ok: true, plan: u.plan });
  } catch (e) {
    res.status(500).json({ error: e?.message || "set plan failed" });
  }
}
