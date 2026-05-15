import UserStat from "../models/UserStat";

export async function getUserStats(req, res) {
  const { userId } = req.params;
  try {
    const stats = await UserStat.findOne({ userId });
    if (!stats) return res.status(404).json({ error: "User stats not found" });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
