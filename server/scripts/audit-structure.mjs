// FILE: server/scripts/audit-structure.mjs
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, ".."); // server/ kökü

// Beklenen dosyalar (yapını bozmuyoruz; mevcut mimariye göre)
const mustHave = [
  "server.js",
  "models/topic.js",
  "models/Guideline.js",
  "models/QuizAttempt.js",
  "models/Program.js",
  "models/ProgramEnrollment.js",
  "controllers/question.controller.js",
  "controllers/exams.controller.js",
  "controllers/medsea.compat.controller.js",
  "controllers/medsea.quiz.controller.js",
  "controllers/review.controller.js",
  "controllers/guidelines.controller.js",
  "controllers/topic.controller.js",
  "controllers/program.controller.js",
  "routes/questions.js",
  "routes/exams.js",
  "routes/medsea.compat.routes.js",
  "routes/protected.routes.js",
  "routes/case.routes.js",
  "routes/sections.js",
  "routes/sectionsCounts.js",
  "routes/topic.routes.js",
  "routes/guidelines.routes.js",
  "routes/topic.admin.routes.js",
];

function existsExact(p) {
  const full = path.join(ROOT, p);
  if (!fs.existsSync(full)) return { ok: false, reason: "missing" };

  // Büyük/küçük harf kontrolü (Windows case-insensitive, biz strict kontrol yapıyoruz)
  const dir = path.dirname(full);
  const base = path.basename(full);
  const names = fs.readdirSync(dir);
  const exact = names.find(n => n === base);
  if (!exact) return { ok: false, reason: "case-mismatch" };
  return { ok: true };
}

function checkImports() {
  const issues = [];

  // topic.controller.js → ../models/topic.js
  const topicCtrl = path.join(ROOT, "controllers/topic.controller.js");
  if (fs.existsSync(topicCtrl)) {
    const txt = fs.readFileSync(topicCtrl, "utf8");
    const need = `from "../models/topic.js"`;
    if (!txt.includes(need)) {
      issues.push({
        file: "controllers/topic.controller.js",
        expect: need,
        msg: "Import yolunu doğrulayın (../models/topic.js).",
      });
    }
  }

  // guidelines.controller.js → ../models/Guideline.js
  const gCtrl = path.join(ROOT, "controllers/guidelines.controller.js");
  if (fs.existsSync(gCtrl)) {
    const txt = fs.readFileSync(gCtrl, "utf8");
    const need = `from "../models/Guideline.js"`;
    if (!txt.includes(need)) {
      issues.push({
        file: "controllers/guidelines.controller.js",
        expect: need,
        msg: "Import yolunu doğrulayın (../models/Guideline.js).",
      });
    }
  }

  // medsea.compat.routes.js içindeki importlar ESM ve dosya uzantılarıyla mı?
  const compatRoutes = path.join(ROOT, "routes/medsea.compat.routes.js");
  if (fs.existsSync(compatRoutes)) {
    const txt = fs.readFileSync(compatRoutes, "utf8");
    const patterns = [
      `from "../controllers/medsea.compat.controller.js"`,
      `from "../controllers/medsea.quiz.controller.js"`,
      `from "../controllers/review.controller.js"`,
    ];
    patterns.forEach(need => {
      if (!txt.includes(need)) {
        issues.push({
          file: "routes/medsea.compat.routes.js",
          expect: need,
          msg: "ESM import ve .js uzantılarını doğrulayın.",
        });
      }
    });
  }

  return issues;
}

function main() {
  console.log("== Medknowledge Server Yapı Denetimi ==");
  let missing = 0, caseMismatch = 0;

  mustHave.forEach(rel => {
    const r = existsExact(rel);
    if (!r.ok) {
      if (r.reason === "missing") { missing++; }
      if (r.reason === "case-mismatch") { caseMismatch++; }
      console.log(`✗ ${rel}  (${r.reason})`);
    } else {
      console.log(`✓ ${rel}`);
    }
  });

  const impIssues = checkImports();
  if (impIssues.length) {
    console.log("\n== Import Kontrol Uyarıları ==");
    impIssues.forEach(it => {
      console.log(`• ${it.file} → beklenen: ${it.expect}\n  ${it.msg}\n`);
    });
  }

  console.log("\n== Özet ==");
  console.log(`Eksik: ${missing}, Harf eşleşmesi hatası: ${caseMismatch}, Import uyarıları: ${impIssues.length}`);

  if (missing === 0 && caseMismatch === 0 && impIssues.length === 0) {
    console.log("Her şey temiz görünüyor. Docker build için hazırsınız.");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
