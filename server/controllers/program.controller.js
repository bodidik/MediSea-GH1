// FILE: server/controllers/program.controller.js
import Program from "../models/Program.js";
import ProgramEnrollment from "../models/ProgramEnrollment.js";

// helper
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// GET /api/programs?track=YDUS
export const list = async (req, res) => {
  try {
    const track = String(req.query.track || "").toUpperCase();
    const q = { isActive: true };
    if (["TUS", "YDUS", "USMLE"].includes(track)) q.track = track;

    const rows = await Program.find(q)
      .select("-syllabus")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ok: true, programs: rows });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// GET /api/programs/:slug
export const detail = async (req, res) => {
  try {
    const slug = String(req.params.slug || "");
    const doc = await Program.findOne({ slug, isActive: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, program: doc });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// POST /api/programs/:slug/enroll?externalId=mk_xxx   (requirePlan("premium"))
export const enroll = async (req, res) => {
  try {
    const slug = String(req.params.slug || "");
    const externalId = String(
      req.query.externalId || req.query.userId || req.externalId || ""
    ).trim();
    if (!externalId)
      return res.json({ ok: false, error: "externalId required" });

    const prog = await Program.findOne({ slug, isActive: true }).lean();
    if (!prog)
      return res.status(404).json({ ok: false, error: "program_not_found" });

    const now = new Date();
    const ends = addDays(now, prog.durationDays);

    const enr = await ProgramEnrollment.findOneAndUpdate(
      { externalId, programId: prog._id },
      {
        $setOnInsert: {
          startedAt: now,
          endsAt: ends,
          status: "active",
          progress: { currentDay: 1, doneUnits: 0, lastTickAt: now },
        },
      },
      { new: true, upsert: true }
    );

    res.json({ ok: true, enrollment: enr, program: prog });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// GET /api/programs/:slug/progress?externalId=mk_xxx   (requirePlan("premium"))
export const progress = async (req, res) => {
  try {
    const slug = String(req.params.slug || "");
    const externalId = String(
      req.query.externalId || req.query.userId || req.externalId || ""
    ).trim();
    if (!externalId)
      return res.json({ ok: false, error: "externalId required" });

    const prog = await Program.findOne({ slug, isActive: true }).lean();
    if (!prog)
      return res.status(404).json({ ok: false, error: "program_not_found" });

    const enr = await ProgramEnrollment.findOne({
      externalId,
      programId: prog._id,
    }).lean();
    if (!enr) return res.json({ ok: true, enrolled: false, program: prog });

    const pct = Math.min(
      100,
      Math.round(((enr.progress.currentDay || 1) - 1) / prog.durationDays * 100)
    );

    res.json({
      ok: true,
      enrolled: true,
      progress: enr.progress,
      status: enr.status,
      endsAt: enr.endsAt,
      percent: pct,
      program: {
        slug: prog.slug,
        title: prog.title,
        durationDays: prog.durationDays,
      },
    });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// POST /api/programs/:slug/progress/tick
// body: { doneUnits?:number, advanceDay?:boolean }
export const tick = async (req, res) => {
  try {
    const slug = String(req.params.slug || "");
    const externalId = String(
      req.query.externalId || req.query.userId || req.externalId || ""
    ).trim();
    if (!externalId)
      return res.json({ ok: false, error: "externalId required" });

    const body = req.body || {};
    const addUnits = Number(body.doneUnits || 0);
    const advance = !!body.advanceDay;

    const prog = await Program.findOne({ slug, isActive: true }).lean();
    if (!prog)
      return res.status(404).json({ ok: false, error: "program_not_found" });

    const enr = await ProgramEnrollment.findOne({
      externalId,
      programId: prog._id,
    });
    if (!enr) return res.status(400).json({ ok: false, error: "not_enrolled" });

    if (advance) {
      enr.progress.currentDay = Math.min(
        prog.durationDays,
        (enr.progress.currentDay || 1) + 1
      );
    }
    if (addUnits > 0) {
      enr.progress.doneUnits = (enr.progress.doneUnits || 0) + addUnits;
    }
    enr.progress.lastTickAt = new Date();

    if (enr.progress.currentDay >= prog.durationDays)
      enr.status = "completed";

    await enr.save();

    const pct = Math.min(
      100,
      Math.round(((enr.progress.currentDay || 1) - 1) / prog.durationDays * 100)
    );

    res.json({
      ok: true,
      progress: enr.progress,
      status: enr.status,
      percent: pct,
    });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};
