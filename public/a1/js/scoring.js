function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function answersMatch(given, accepted) {
  const g = normalize(given);
  if (!g) return false;
  const denied = /\b(nicht|kein|keine|ohne)\b/.test(g);
  return (accepted || []).some((item) => {
    const a = normalize(item);
    if (!a) return false;
    if (g === a || g.replace(/\s/g, "") === a.replace(/\s/g, "")) return true;
    const gTokens = g.split(" ").filter(Boolean);
    const aTokens = a.split(" ").filter(Boolean);
    if (aTokens.length === 1 && gTokens.includes(aTokens[0]) && !denied) return true;
    if (aTokens.length > 1 && aTokens.every((token) => gTokens.includes(token))) return true;
    return false;
  });
}

function scoreObjective(exam, answers) {
  const details = [];
  const push = (section, teil, id, correct, given, explanation, transcript) => {
    const ok = String(given || "") === String(correct);
    details.push({ section, teil, id, correct, given: given || "—", ok, explanation, transcript });
    return ok ? 1 : 0;
  };

  let hoeren = 0;
  exam.hoeren.teil1.items.forEach((item) => {
    hoeren += push("hoeren", 1, item.id, item.answer, answers.hoeren[item.id], item.explanation, item.transcript);
  });
  exam.hoeren.teil2.items.forEach((item) => {
    hoeren += push("hoeren", 2, item.id, item.answer, answers.hoeren[item.id], item.explanation, item.transcript);
  });
  exam.hoeren.teil3.items.forEach((item) => {
    hoeren += push("hoeren", 3, item.id, item.answer, answers.hoeren[item.id], item.explanation, item.transcript);
  });

  let lesen = 0;
  exam.lesen.teil1.items.forEach((item) => {
    lesen += push("lesen", 1, item.id, item.answer, answers.lesen[item.id], item.explanation, item.textRef);
  });
  exam.lesen.teil2.items.forEach((item) => {
    lesen += push("lesen", 2, item.id, item.answer, answers.lesen[item.id], item.explanation, null);
  });
  exam.lesen.teil3.items.forEach((item) => {
    lesen += push("lesen", 3, item.id, item.answer, answers.lesen[item.id], item.explanation, item.textRef);
  });

  let form = 0;
  const formDetails = exam.schreiben.teil1.fields.filter((field) => !field.prefill).map((field) => {
    const given = answers.schreiben.form[field.id] || "";
    const ok = answersMatch(given, field.accepted);
    if (ok) form += 1;
    return { id: field.id, label: field.label, given: given || "—", accepted: field.accepted, ok };
  });

  return { hoeren, lesen, form, details, formDetails };
}

function schreibenHints(exam, text) {
  const body = String(text || "");
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const low = normalize(body);
  const greeting = /(liebe[r]?|hallo|sehr geehrte[r]?|guten tag)/.test(low);
  const closing = /(viele gruesse|liebe gruesse|mit freundlichen gruesse|bis bald|tschuss|dankeschon|danke)/.test(low);
  const points = exam.schreiben.teil2.points.map((point) => ({
    label: point.label,
    ok: (point.keywords || []).some((word) => low.includes(normalize(word))),
  }));
  return { words, greeting, closing, points };
}

function gradeLabel(score, max) {
  const ratio = score / max;
  if (ratio >= 0.9) return "sehr gut";
  if (ratio >= 0.8) return "gut";
  if (ratio >= 0.7) return "befriedigend";
  if (ratio >= 0.6) return "ausreichend";
  return "nicht bestanden";
}
