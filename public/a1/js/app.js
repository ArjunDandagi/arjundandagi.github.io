const EXAM_META = {
  1: { theme: "Alltag in der Stadt", topics: "Einkaufen · Café · Bahnhof · Wetter", city: "Leipzig" },
  2: { theme: "Familie und Wohnen", topics: "Wohnung · Schule · Kinder · Arzt", city: "Hamburg" },
  3: { theme: "Reise und Freizeit", topics: "Hotel · Museum · Zug · Kino", city: "Köln" },
  4: { theme: "Arbeit und Termine", topics: "Büro · Post · Sport · Apotheke", city: "Berlin" },
};

const state = {
  exams: {},
  examId: null,
  answers: emptyAnswers(),
  ledger: new PlayLedger(),
  timers: {},
  tick: null,
  tape: { text: "", tone: "" },
  running: false,
};

function emptyAnswers() {
  return { hoeren: {}, lesen: {}, schreiben: { form: {}, text: "", selfScore: "" } };
}

function resetExam() {
  state.answers = emptyAnswers();
  state.ledger = new PlayLedger();
  state.timers = {};
  state.tape = { text: "", tone: "" };
  state.running = false;
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nl2br = (s) => esc(s).replace(/\n/g, "<br>");

async function loadExam(id) {
  if (!state.exams[id]) {
    const res = await fetch(`data/exam-${id}.json`);
    if (!res.ok) throw new Error(`Prüfung ${id} konnte nicht geladen werden (HTTP ${res.status}).`);
    state.exams[id] = await res.json();
  }
  return state.exams[id];
}

function route() {
  const h = location.hash.replace(/^#/, "") || "/";
  let m;
  if ((m = h.match(/^\/pruefung\/([1-4])$/))) return { page: "intro", id: +m[1] };
  if ((m = h.match(/^\/pruefung\/([1-4])\/(hoeren|lesen-schreiben|sprechen|ergebnis)$/))) {
    return { page: m[2], id: +m[1] };
  }
  if (h === "/format") return { page: "format" };
  return { page: "home" };
}

/* ============================ shell ============================ */

function topbar(right = "") {
  return `<header class="topbar"><div class="topbar-in">
    <a class="brand" href="#/">
      <span class="brand-mark">A1</span>
      <span class="brand-txt"><small>telc Deutsch · Start Deutsch 1</small><strong>Übungsprüfungen</strong></span>
    </a>
    <div class="topbar-actions">${right}</div>
  </div></header>`;
}

/* ============================ pages ============================ */

function pageHome() {
  const cards = [1, 2, 3, 4].map((id) => {
    const m = EXAM_META[id];
    return `<a class="exam-card" href="#/pruefung/${id}">
      <div class="no">Prüfung ${id}</div>
      <h3>${m.theme}</h3>
      <div class="topics">${m.topics}</div>
      <div class="meta"><span><b>65</b> Min schriftlich</span><span><b>30</b> Aufgaben</span><span>${m.city}</span></div>
    </a>`;
  }).join("");

  return topbar(`<a class="btn secondary small" href="#/format">Prüfungsformat</a>`) + `<div class="wrap">
    <section class="hero">
      <span class="eyebrow">Nur Niveau A1</span>
      <h1>Vier vollständige telc-A1-Prüfungen.</h1>
      <p class="lead">Hören, Lesen und Schreiben genau im Ablauf der echten Prüfung — mit Tonaufnahme, Uhr und Antwortbogen. Danach prüfst du jede Lösung selbst.</p>
      <div class="facts">
        <span class="fact">Hören 20 Min · 15 Aufgaben</span>
        <span class="fact">Lesen + Schreiben 45 Min</span>
        <span class="fact">Tonaufnahme mit Sprechpausen</span>
        <span class="fact">Lösungen mit Hörtext</span>
      </div>
    </section>
    <div class="section-head"><h2>Prüfungssätze</h2><p>Jeder Satz ist neu — gleiche Struktur, andere Aufgaben.</p></div>
    <div class="exam-grid">${cards}</div>
  </div>`;
}

function pageFormat() {
  return topbar(`<a class="btn secondary small" href="#/">Prüfungen</a>`) + `<div class="wrap wrap-narrow">
    <div class="card">
      <h2>So läuft telc Deutsch A1 wirklich ab</h2>
      <p>Start Deutsch 1 ist die gemeinsame A1-Prüfung von telc und Goethe-Institut. Beide Zertifikate prüfen dasselbe Papier. Diese Seite übt den schriftlichen Teil in genau dieser Reihenfolge.</p>
      <table class="dl">
        <tr><th>Prüfungsteil</th><th>Zeit</th><th>Aufgaben</th><th>Punkte</th><th>Aufgabentyp</th></tr>
        <tr><td><b>Hören</b> Teil 1</td><td class="num" rowspan="3">ca. 20 Min</td><td class="num">1–6</td><td class="num" rowspan="3">15</td><td>Gespräche · Bild a/b/c · <b>zweimal</b> hören</td></tr>
        <tr><td><b>Hören</b> Teil 2</td><td class="num">7–10</td><td>Durchsagen · richtig/falsch · <b>einmal</b> hören</td></tr>
        <tr><td><b>Hören</b> Teil 3</td><td class="num">11–15</td><td>Ansagen am Telefon · a/b/c · <b>zweimal</b> hören</td></tr>
        <tr><td><b>Lesen</b> Teil 1</td><td class="num" rowspan="3">ca. 25 Min</td><td class="num">1–5</td><td class="num" rowspan="3">15</td><td>E-Mails, Notizen · richtig/falsch</td></tr>
        <tr><td><b>Lesen</b> Teil 2</td><td class="num">6–10</td><td>Anzeigen · a oder b</td></tr>
        <tr><td><b>Lesen</b> Teil 3</td><td class="num">11–15</td><td>Schilder, Hinweise · richtig/falsch</td></tr>
        <tr><td><b>Schreiben</b> Teil 1</td><td class="num" rowspan="2">ca. 20 Min</td><td class="num">5 Felder</td><td class="num">5</td><td>Formular ausfüllen</td></tr>
        <tr><td><b>Schreiben</b> Teil 2</td><td class="num">3 Punkte</td><td class="num">10</td><td>Kurze Mitteilung, ca. 30 Wörter</td></tr>
        <tr><td><b>Sprechen</b></td><td class="num">ca. 15 Min</td><td class="num">3 Teile</td><td class="num">15</td><td>Gruppenprüfung mit anderen Teilnehmenden</td></tr>
      </table>
      <h3>Wichtige Regeln</h3>
      <ul>
        <li><b>Lesen und Schreiben sind ein Block.</b> 45 Minuten zusammen, ohne Pause nach dem Hören. Du teilst dir die Zeit selbst ein.</li>
        <li><b>Die Tonaufnahme läuft durch.</b> Teil 1 und 3 hörst du zweimal, Teil 2 nur einmal. Du kannst nicht zurückspulen.</li>
        <li><b>Keine Hilfsmittel.</b> Kein Wörterbuch, kein Handy.</li>
        <li><b>Bestanden ab 60 %.</b> Schriftlich 45 Punkte, mündlich 15 Punkte, zusammen 60. Du brauchst 36.</li>
      </ul>
      <div class="note">
        <strong>Zu dieser Übungsseite.</strong> Struktur, Zeiten und Aufgabentypen folgen dem offiziellen Format.
        Alle Texte, Aufnahmen und Bilder sind neu geschrieben — es sind keine Kopien der telc-Materialien.
        Den kostenlosen offiziellen Übungstest bekommst du direkt bei
        <a href="https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/start-deutsch-1-/-telc-deutsch-a1/" target="_blank" rel="noopener">telc.net</a>.
      </div>
    </div>
  </div>`;
}

function pageIntro(exam) {
  const m = EXAM_META[exam.id];
  return topbar(`<a class="btn quiet small" href="#/">Abbrechen</a>`) + `<div class="wrap wrap-narrow">
    <div class="booklet">
      <div class="booklet-head">
        <div><div class="sub">telc Deutsch A1 · Start Deutsch 1</div><h1>Prüfung ${exam.id} — ${m.theme}</h1></div>
        <div class="dur"><b>65 Min</b>schriftliche Prüfung</div>
      </div>
      <div class="booklet-body">
        <div class="rubric">
          <p><b>Aufgabenheft.</b> Diese Prüfung hat drei schriftliche Teile: Hören, Lesen und Schreiben.
          Danach folgt in der echten Prüfung noch das Sprechen in der Gruppe.</p>
          <p style="margin:0">Hilfsmittel wie Wörterbücher sind nicht erlaubt.</p>
        </div>
        <h3 style="margin-top:0">Bevor du beginnst</h3>
        <ul>
          <li><b>Hören, ca. 20 Minuten.</b> Starte die Tonaufnahme und lass sie durchlaufen. Teil 1 und Teil 3 hörst du zweimal, Teil 2 nur einmal. Danach ist der Text weg.</li>
          <li><b>Lesen und Schreiben, 45 Minuten.</b> Ein Block, ohne Pause. Plane etwa 25 Minuten für Lesen und 20 für Schreiben.</li>
          <li><b>Auswertung.</b> Am Ende siehst du zu jeder Aufgabe die Lösung, eine Erklärung und den Hörtext.</li>
        </ul>
        <div class="note warn">
          <strong>Setz dich hin wie in der Prüfung.</strong> Kopfhörer auf, Handy weg, Uhr läuft.
          Eine Aufnahme, die du einmal gehört hast, kannst du in diesem Durchgang nicht noch einmal starten.
        </div>
        <div class="nav">
          <a class="btn secondary" href="#/">Zurück</a>
          <a class="btn" href="#/pruefung/${exam.id}/hoeren">Prüfung starten — Hören</a>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- shared bits ---------- */

function optionGrid(item, group, chosen, live = true) {
  const two = item.options.length === 2 ? " two" : "";
  return `<div class="opts${two}">${item.options.map((o) => {
    const on = chosen === o.id ? "1" : "0";
    const vis = renderOptionVisual(o);
    return `<button type="button" class="opt" data-on="${on}"
      ${live ? `data-pick="${group}" data-id="${item.id}" data-val="${o.id}"` : "disabled"}>
      <span class="ltr">${o.id}</span>
      ${vis ? `<figure>${vis}</figure>` : ""}
      <span class="cap">${esc(o.label || o.value || "")}</span>
    </button>`;
  }).join("")}</div>`;
}

function adPair(options) {
  return `<div class="ads">${options.map((o) => `<div class="ad">
    <div class="ad-bar"><span class="ad-dot"></span><span>${esc(o.id)}</span></div>
    <div class="ad-in"><h4>${esc(o.title)}</h4><div>${nl2br(o.body)}</div></div>
  </div>`).join("")}</div>`;
}

function rfGrid(item, group, chosen) {
  const opt = (val, mark, label) => `<button type="button" data-on="${chosen === val ? "1" : "0"}"
    data-pick="${group}" data-id="${item.id}" data-val="${val}">
    <span class="mark">${mark}</span>${label}</button>`;
  return `<div class="rf">${opt("+", "+", "richtig")}${opt("-", "–", "falsch")}</div>`;
}

function playPips(item, ledger) {
  const total = item.plays || 1;
  const left = ledger.remaining(item);
  const pips = Array.from({ length: total }, (_, i) =>
    `<span class="pip${i < left ? "" : " spent"}"></span>`).join("");
  const word = total === 2 ? "zweimal" : "einmal";
  const txt = left === 0 ? "verbraucht" : `noch ${left}× von ${total}`;
  return `<span class="plays" title="Sie hören diesen Text ${word}.">${pips}<span>${txt}</span></span>`;
}

const KIND_LABEL = { dialog: "Gespräch", durchsage: "Durchsage", telefon: "Am Telefon" };

function audioRow(item, ledger) {
  const spent = ledger.spent(item);
  const kind = item.style || "dialog";
  return `<div class="q-audio">
    <button type="button" class="btn secondary small" data-play="${item.id}" ${spent ? "disabled" : ""}>
      ${spent ? "Nicht mehr verfügbar" : "▶ Text hören"}
    </button>
    <span class="kind ${kind}">${KIND_LABEL[kind] || "Gespräch"}</span>
    ${playPips(item, ledger)}
  </div>`;
}

function allHoeren(exam) {
  return [...exam.hoeren.teil1.items, ...exam.hoeren.teil2.items, ...exam.hoeren.teil3.items];
}
function allLesen(exam) {
  return [...exam.lesen.teil1.items, ...exam.lesen.teil2.items, ...exam.lesen.teil3.items];
}

/* ---------- Hören ---------- */

function pageHoeren(exam) {
  const led = state.ledger;
  const a = state.answers.hoeren;
  const t1 = exam.hoeren.teil1;
  const t2 = exam.hoeren.teil2;
  const t3 = exam.hoeren.teil3;

  const body = `
    <div class="rubric">
      <p><b>Dieser Test hat drei Teile.</b> Sie hören kurze Gespräche, Durchsagen und Ansagen am Telefon.
      Zu jedem Text gibt es eine Aufgabe. Lesen Sie zuerst die Aufgabe, hören Sie dann den Text.</p>
      <p style="margin:0">Teil 1 und Teil 3 hören Sie <b>zweimal</b>, Teil 2 nur <b>einmal</b>.</p>
    </div>

    <div class="tape">
      <div class="tape-top">
        <span class="tape-title">Tonaufnahme</span>
        <button type="button" class="btn small" id="tape-run">▶ Aufnahme starten</button>
        <button type="button" class="btn quiet small" id="tape-stop">Stopp</button>
        <span class="tape-status ${state.tape.tone}" id="tape-status">${esc(state.tape.text
          || "Startet die komplette Aufnahme wie in der Prüfung: mit Pausen zum Lesen und Ankreuzen.")}</span>
      </div>
    </div>

    <div class="teil-head"><h2>Hören, Teil 1</h2><span class="items">Aufgaben 1–6 · Sie hören jeden Text zweimal</span></div>
    <p class="teil-instruction">Kreuzen Sie an: a, b oder c.</p>
    <div class="example">
      <div class="tag">Beispiel</div>
      <div class="q-text" style="margin-bottom:11px">${esc(t1.example.question)}</div>
      ${optionGrid(t1.example, "ex", t1.example.answer, false)}
    </div>
    ${t1.items.map((it) => `<section class="q">
      <div class="q-head"><span class="q-no">${it.id}</span><span class="q-text">${esc(it.question)}</span></div>
      ${audioRow(it, led)}
      ${optionGrid(it, "hoeren", a[it.id])}
    </section>`).join("")}

    <div class="teil-head"><h2>Hören, Teil 2</h2><span class="items">Aufgaben 7–10 · Sie hören jeden Text nur einmal</span></div>
    <p class="teil-instruction">Sie hören Durchsagen. Kreuzen Sie an: richtig (+) oder falsch (–)?</p>
    <div class="example">
      <div class="tag">Beispiel</div>
      <div class="q-text">${esc(t2.example.statement)}</div>
      <div style="margin-top:9px;font-size:14px;color:var(--muted)">Lösung: ${t2.example.answer === "+" ? "richtig (+)" : "falsch (–)"}</div>
    </div>
    ${t2.items.map((it) => `<section class="q">
      <div class="q-head"><span class="q-no">${it.id}</span><span class="q-text">${esc(it.statement)}</span></div>
      ${audioRow(it, led)}
      ${rfGrid(it, "hoeren", a[it.id])}
    </section>`).join("")}

    <div class="teil-head"><h2>Hören, Teil 3</h2><span class="items">Aufgaben 11–15 · Sie hören jeden Text zweimal</span></div>
    <p class="teil-instruction">Sie hören Ansagen auf dem Anrufbeantworter. Kreuzen Sie an: a, b oder c.</p>
    ${t3.items.map((it) => `<section class="q">
      <div class="q-head"><span class="q-no">${it.id}</span><span class="q-text">${esc(it.question)}</span></div>
      ${audioRow(it, led)}
      ${optionGrid(it, "hoeren", a[it.id])}
    </section>`).join("")}

    <div class="nav">
      <a class="btn secondary" href="#/pruefung/${exam.id}">Zurück</a>
      <a class="btn" href="#/pruefung/${exam.id}/lesen-schreiben">Weiter — Lesen und Schreiben</a>
    </div>`;

  return topbar(`<a class="btn quiet small" href="#/">Beenden</a>`) + `<div class="wrap">
    <div class="exam-layout">
      <article class="booklet">
        <div class="booklet-head">
          <div><div class="sub">Prüfung ${exam.id} · Teil 1 von 2</div><h1>Hören</h1></div>
          <div class="dur"><b>ca. 20 Min</b>15 Aufgaben</div>
        </div>
        <div class="booklet-body">${body}</div>
      </article>
      ${rail(exam, "hoeren")}
    </div>
  </div>`;
}

/* ---------- Lesen + Schreiben ---------- */

function pageLesenSchreiben(exam) {
  const a = state.answers.lesen;
  const form = state.answers.schreiben.form;
  const l1 = exam.lesen.teil1;
  const l2 = exam.lesen.teil2;
  const l3 = exam.lesen.teil3;
  const s1 = exam.schreiben.teil1;
  const s2 = exam.schreiben.teil2;

  const body = `
    <div class="rubric">
      <p><b>Lesen, circa 25 Minuten.</b> Sie lesen kurze Briefe, Anzeigen und Schilder. Zu jedem Text gibt es Aufgaben.</p>
      <p><b>Schreiben, circa 20 Minuten.</b> Sie füllen ein Formular aus und schreiben eine kurze Mitteilung.</p>
      <p style="margin:0">Beide Teile zusammen: <b>45 Minuten</b>. Hilfsmittel wie Wörterbücher sind nicht erlaubt.</p>
    </div>

    <div class="teil-head"><h2>Lesen, Teil 1</h2><span class="items">Aufgaben 1–5</span></div>
    <p class="teil-instruction">Lesen Sie die beiden Texte. Sind die Aussagen richtig (+) oder falsch (–)?</p>
    ${l1.texts.map((t) => `<div class="doc mail"><div class="doc-kicker">${esc(t.kind || "Nachricht")}</div>${nl2br(t.body)}</div>`).join("")}
    ${l1.example ? `<div class="example">
      <div class="tag">Beispiel</div>
      <div class="q-text">${esc(l1.example.statement)}</div>
      <div style="margin-top:8px;font-size:14px;color:var(--muted)">Lösung: ${fmt(l1.example.answer)}</div>
    </div>` : ""}
    ${l1.items.map((it) => `<section class="q">
      <div class="q-head"><span class="q-no">${it.id}</span><span class="q-text">${esc(it.statement)}</span></div>
      ${rfGrid(it, "lesen", a[it.id])}
    </section>`).join("")}

    <div class="teil-head"><h2>Lesen, Teil 2</h2><span class="items">Aufgaben 6–10</span></div>
    <p class="teil-instruction">Lesen Sie die Aufgabe und die beiden Anzeigen. Welche Anzeige passt? Kreuzen Sie an: a oder b.</p>
    ${l2.example ? `<div class="example">
      <div class="tag">Beispiel</div>
      <div class="q-text" style="margin-bottom:11px">${esc(l2.example.prompt)}</div>
      ${adPair(l2.example.options)}
      <div style="font-size:14px;color:var(--muted)">Lösung: Anzeige ${esc(l2.example.answer)}</div>
    </div>` : ""}
    ${l2.items.map((it) => `<section class="q">
      <div class="q-head"><span class="q-no">${it.id}</span><span class="q-text">${esc(it.prompt)}</span></div>
      ${adPair(it.options)}
      ${optionGrid({ id: it.id, options: it.options.map((o) => ({ id: o.id, label: `Anzeige ${o.id}` })) }, "lesen", a[it.id])}
    </section>`).join("")}

    <div class="teil-head"><h2>Lesen, Teil 3</h2><span class="items">Aufgaben 11–15</span></div>
    <p class="teil-instruction">Lesen Sie die Schilder und Hinweise. Richtig (+) oder falsch (–)?</p>
    ${l3.example ? `<div class="example">
      <div class="tag">Beispiel</div>
      <div class="plate-where">${esc(l3.example.where)}</div>
      <div class="plate">${nl2br(l3.example.sign)}</div>
      <div class="q-text">${esc(l3.example.statement)}</div>
      <div style="margin-top:8px;font-size:14px;color:var(--muted)">Lösung: ${fmt(l3.example.answer)}</div>
    </div>` : ""}
    ${l3.items.map((it) => `<section class="q">
      <div class="plate-where">${esc(it.where || "Hinweis")}</div>
      <div class="plate">${nl2br(it.sign)}</div>
      <div class="q-head"><span class="q-no">${it.id}</span><span class="q-text">${esc(it.statement)}</span></div>
      ${rfGrid(it, "lesen", a[it.id])}
    </section>`).join("")}

    <div class="teil-head"><h2>Schreiben, Teil 1</h2><span class="items">5 Informationen · 5 Punkte</span></div>
    <p class="teil-instruction">${esc(s1.scenario)}</p>
    <div class="formsheet">
      <div class="formsheet-head">${esc(s1.formTitle || "Anmeldung")}</div>
      ${s1.fields.map((f) => f.prefill
        ? `<div class="formrow filled"><label>${esc(f.label)}</label><span class="given">${esc(f.prefill)}</span></div>`
        : `<div class="formrow"><label>${esc(f.label)}</label><input data-form="${f.id}" value="${esc(form[f.id] || "")}" autocomplete="off" spellcheck="false"></div>`
      ).join("")}
    </div>

    <div class="teil-head"><h2>Schreiben, Teil 2</h2><span class="items">ca. 30 Wörter · 10 Punkte</span></div>
    <p class="teil-instruction">${esc(s2.instruction)}</p>
    <ul>${s2.points.map((p) => `<li>${esc(p.label)}</li>`).join("")}</ul>
    <p class="teil-instruction">Schreiben Sie zu jedem Punkt ein bis zwei Sätze. Vergessen Sie nicht die Anrede am Anfang und den Gruß am Schluss.</p>
    <textarea class="writing-box" id="write" placeholder="Liebe …">${esc(state.answers.schreiben.text)}</textarea>
    <div class="wordcount" id="wc"></div>

    <div class="nav">
      <a class="btn secondary" href="#/pruefung/${exam.id}/hoeren">Zurück zu Hören</a>
      <div class="grp">
        <a class="btn secondary" href="#/pruefung/${exam.id}/sprechen">Sprechen üben</a>
        <a class="btn" href="#/pruefung/${exam.id}/ergebnis">Abgeben und auswerten</a>
      </div>
    </div>`;

  return topbar(`<a class="btn quiet small" href="#/">Beenden</a>`) + `<div class="wrap">
    <div class="exam-layout">
      <article class="booklet">
        <div class="booklet-head">
          <div><div class="sub">Prüfung ${exam.id} · Teil 2 von 2</div><h1>Lesen und Schreiben</h1></div>
          <div class="dur"><b>45 Min</b>15 Aufgaben + 2 Texte</div>
        </div>
        <div class="booklet-body">${body}</div>
      </article>
      ${rail(exam, "lesen")}
    </div>
  </div>`;
}

/* ---------- Sprechen ---------- */

function pageSprechen(exam) {
  const s = exam.sprechen;
  return topbar(`<a class="btn quiet small" href="#/">Beenden</a>`) + `<div class="wrap wrap-narrow">
    <article class="booklet">
      <div class="booklet-head">
        <div><div class="sub">Prüfung ${exam.id} · mündlich</div><h1>Sprechen</h1></div>
        <div class="dur"><b>ca. 15 Min</b>3 Teile</div>
      </div>
      <div class="booklet-body">
        <div class="rubric"><p style="margin:0">In der echten Prüfung sprichst du in einer Gruppe, meist zu viert, ohne Vorbereitungszeit.
        Hier übst du allein: <b>sprich die Sätze laut aus</b>, bevor du das Muster ansiehst.</p></div>

        <div class="teil-head"><h2>Teil 1 — Sich vorstellen</h2><span class="items">ca. 3 Minuten</span></div>
        <p class="teil-instruction">Stellen Sie sich vor. Die Karten geben die Stichwörter vor. Danach buchstabieren Sie einen Namen und nennen eine Zahl.</p>
        <div class="cards">${s.teil1.prompts.map((w) => `<div class="tcard">${esc(w)}</div>`).join("")}</div>
        <div class="model">${esc(s.teil1.model)}</div>

        <div class="teil-head"><h2>Teil 2 — Um Informationen bitten</h2><span class="items">ca. 6 Minuten</span></div>
        <p class="teil-instruction">Thema: <b>${esc(s.teil2.topic)}</b>. Ziehen Sie eine Karte, stellen Sie eine Frage — und antworten Sie auf die Frage der anderen.</p>
        <div class="cards">${s.teil2.cards.map((w) => `<div class="tcard">${esc(w)}</div>`).join("")}</div>
        <div class="model">${esc(s.teil2.model)}</div>

        <div class="teil-head"><h2>Teil 3 — Bitten formulieren</h2><span class="items">ca. 4 Minuten</span></div>
        <p class="teil-instruction">${esc(s.teil3.prompt)}</p>
        <div class="model">${esc(s.teil3.model)}</div>

        <div class="nav">
          <a class="btn secondary" href="#/pruefung/${exam.id}/lesen-schreiben">Zurück</a>
          <a class="btn" href="#/pruefung/${exam.id}/ergebnis">Abgeben und auswerten</a>
        </div>
      </div>
    </article>
  </div>`;
}

/* ---------- Ergebnis ---------- */

function bar(label, got, max) {
  const pct = max ? Math.round((got / max) * 100) : 0;
  const cls = pct >= 60 ? "" : pct >= 40 ? " warn" : " bad";
  return `<div class="bar-row"><span>${label}</span>
    <span class="bar-track"><span class="bar-fill${cls}" style="width:${pct}%"></span></span>
    <span class="bar-val">${got} / ${max}</span></div>`;
}

function pageErgebnis(exam) {
  const sc = scoreObjective(exam, state.answers);
  const hints = schreibenHints(exam, state.answers.schreiben.text);
  const self = Number(state.answers.schreiben.selfScore || 0);
  const written = sc.hoeren + sc.lesen + sc.form + self;
  const pass = written >= 27;

  const reviews = sc.details.map((d) => `<div class="rev">
    <div class="rev-head ${d.ok ? "good" : "bad"}">
      <span class="rev-id">${d.section === "hoeren" ? "Hören" : "Lesen"} Teil ${d.teil} · Aufgabe ${d.id}</span>
      <span class="rev-tag ${d.ok ? "good" : "bad"}">${d.ok ? "richtig" : "falsch"}</span>
      <span class="rev-ans">deine Antwort <b>${fmt(d.given)}</b> · Lösung <b>${fmt(d.correct)}</b></span>
    </div>
    <div class="rev-body">
      <div>${esc(d.explanation.de)}</div>
      <div class="en">${esc(d.explanation.en)}</div>
      ${d.transcript ? `<div class="script">${esc(d.transcript)}</div>` : ""}
    </div>
  </div>`).join("");

  const check = (ok, text) => `<div class="chk"><span class="ic ${ok ? "y" : "n"}">${ok ? "✓" : "✕"}</span><span>${text}</span></div>`;

  return topbar(`<a class="btn secondary small" href="#/">Alle Prüfungen</a>`) + `<div class="wrap wrap-narrow">
    <div class="card">
      <div class="score-head">
        <div>
          <span class="eyebrow">Prüfung ${exam.id} · Auswertung</span>
          <h2>${esc(EXAM_META[exam.id].theme)}</h2>
          <p style="color:var(--ink-soft);margin:0">Hören, Lesen und das Formular werden automatisch bewertet.
          Die Punkte für die Mitteilung trägst du selbst ein. Schriftlich bestanden ab <b>27 von 45</b>.</p>
        </div>
        <div class="score-dial">
          <div class="n">${written}<small>/45</small></div>
          <div class="verdict ${pass ? "ok" : "no"}">${pass ? "bestanden" : "nicht bestanden"}</div>
          <div class="grade">${gradeLabel(written, 45)}</div>
        </div>
      </div>
      <div class="bars" style="margin-top:22px">
        ${bar("Hören", sc.hoeren, 15)}
        ${bar("Lesen", sc.lesen, 15)}
        ${bar("Schreiben Teil 1", sc.form, 5)}
        ${bar("Schreiben Teil 2", self, 10)}
      </div>
      <div class="note" style="margin-top:18px">In der echten Prüfung kommen 15 Punkte fürs Sprechen dazu.
      Gesamt sind es 60 Punkte, bestanden ab 36.</div>
    </div>

    <div class="card">
      <h3 style="margin-top:0">Schreiben Teil 1 — Formular</h3>
      ${sc.formDetails.map((f) => `<div class="rev">
        <div class="rev-head ${f.ok ? "good" : "bad"}">
          <span class="rev-id">${esc(f.label)}</span>
          <span class="rev-tag ${f.ok ? "good" : "bad"}">${f.ok ? "richtig" : "falsch"}</span>
          <span class="rev-ans">deine Angabe <b>${esc(f.given)}</b></span>
        </div>
        ${f.ok ? "" : `<div class="rev-body">Erwartet: <b>${esc(f.accepted.join(" / "))}</b></div>`}
      </div>`).join("")}

      <h3>Schreiben Teil 2 — selbst bewerten</h3>
      <p style="color:var(--ink-soft)">Offizielles Raster: pro Inhaltspunkt <b>3 / 1,5 / 0</b> Punkte, dazu <b>1</b> Punkt für Anrede und Gruß. Maximal 10.</p>
      <div class="doc mail" style="margin-bottom:14px">${state.answers.schreiben.text ? nl2br(state.answers.schreiben.text) : "<em style='color:var(--muted)'>kein Text geschrieben</em>"}</div>
      ${check(hints.words >= 25 && hints.words <= 45, `Länge: <b>${hints.words} Wörter</b> (Ziel ca. 30)`)}
      ${check(hints.greeting, "Anrede am Anfang")}
      ${check(hints.closing, "Gruß am Schluss")}
      ${hints.points.map((p) => check(p.ok, `Inhaltspunkt: ${esc(p.label)}`)).join("")}
      <div class="self-score" style="margin-top:14px">
        <label for="self">Deine Punkte für die Mitteilung</label>
        <input id="self" type="number" min="0" max="10" step="0.5" value="${esc(state.answers.schreiben.selfScore)}" placeholder="0–10">
        <span style="color:var(--muted);font-size:13.5px">von 10</span>
      </div>
      <h3>Musterlösung</h3>
      <div class="model">${esc(exam.schreiben.teil2.model)}</div>
    </div>

    <div class="card">
      <h3 style="margin-top:0">Hören und Lesen — Aufgabe für Aufgabe</h3>
      ${reviews}
      <div class="nav">
        <a class="btn secondary" href="#/pruefung/${exam.id}">Diese Prüfung neu starten</a>
        <a class="btn" href="#/">Andere Prüfung wählen</a>
      </div>
    </div>
  </div>`;
}

function fmt(v) {
  if (v === "+") return "richtig (+)";
  if (v === "-") return "falsch (–)";
  if (!v || v === "—") return "—";
  return v;
}

/* ---------- sidebar ---------- */

function bubbleRows(items, answers, kind) {
  return items.map((it) => {
    const set = kind === "rf" ? ["+", "-"] : (it.options ? it.options.map((o) => o.id) : ["a", "b", "c"]);
    const chosen = answers[it.id];
    return `<div class="brow"><span>${it.id}</span><span class="bset">${set.map((v) =>
      `<span class="bub${chosen === v ? " on" : ""}">${v === "-" ? "–" : v}</span>`).join("")}</span></div>`;
  }).join("");
}

function rail(exam, which) {
  const isH = which === "hoeren";
  const answers = isH ? state.answers.hoeren : state.answers.lesen;
  const groups = isH
    ? [["Teil 1 · a b c", exam.hoeren.teil1.items, "mc"],
       ["Teil 2 · richtig / falsch", exam.hoeren.teil2.items, "rf"],
       ["Teil 3 · a b c", exam.hoeren.teil3.items, "mc"]]
    : [["Teil 1 · richtig / falsch", exam.lesen.teil1.items, "rf"],
       ["Teil 2 · a b", exam.lesen.teil2.items, "mc"],
       ["Teil 3 · richtig / falsch", exam.lesen.teil3.items, "rf"]];
  const total = groups.reduce((n, g) => n + g[1].length, 0);
  const done = groups.reduce((n, g) => n + g[1].filter((i) => answers[i.id]).length, 0);
  const minutes = isH ? 20 : 45;

  return `<aside class="rail">
    <div class="panel">
      <div class="panel-head"><span>Zeit</span><span>${minutes} Min</span></div>
      <div class="clock" id="clock">
        <div class="t">--:--</div>
        <div class="lbl">${isH ? "Hören" : "Lesen und Schreiben"}</div>
        <div class="bar"><i style="width:100%"></i></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><span>Antwortbogen</span><span id="asheet-count">${done}/${total}</span></div>
      <div class="panel-body">
        ${groups.map(([label, items, kind]) =>
          `<div class="bgroup-label">${label}</div><div class="bubbles">${bubbleRows(items, answers, kind)}</div>`).join("")}
      </div>
    </div>
  </aside>`;
}

/* ============================ behaviour ============================ */

function bind(exam, page) {
  /* answers */
  $$("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { pick, id, val } = btn.dataset;
      state.answers[pick][id] = val;
      const box = btn.parentElement;
      $$("button", box).forEach((b) => b.setAttribute("data-on", b === btn ? "1" : "0"));
      syncSheet(exam, page);
    });
  });

  /* writing */
  $$("[data-form]").forEach((inp) => {
    inp.addEventListener("input", () => { state.answers.schreiben.form[inp.dataset.form] = inp.value; });
  });
  const w = $("#write");
  if (w) {
    const count = () => {
      const n = w.value.trim() ? w.value.trim().split(/\s+/).length : 0;
      state.answers.schreiben.text = w.value;
      const el = $("#wc");
      if (el) el.textContent = `${n} Wörter — Ziel: circa 30`;
    };
    w.addEventListener("input", count);
    count();
  }
  const self = $("#self");
  if (self) {
    self.addEventListener("change", () => {
      state.answers.schreiben.selfScore = Math.max(0, Math.min(10, Number(self.value) || 0));
      render();
    });
  }

  /* timers */
  if (page === "hoeren") runClock(exam.id, "hoeren", 20);
  if (page === "lesen-schreiben") runClock(exam.id, "lesen", 45);

  /* audio */
  AudioPlayer.onChange = () => refreshAudioUI(exam);
  $$("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => playOne(exam, btn.dataset.play));
  });
  const run = $("#tape-run");
  if (run) run.addEventListener("click", () => playWholeTape(exam));
  const stopBtn = $("#tape-stop");
  if (stopBtn) stopBtn.addEventListener("click", () => {
    AudioPlayer.stop();
    setTape("Aufnahme gestoppt.", "");
  });
}

function syncSheet(exam, page) {
  const isH = page === "hoeren";
  if (!isH && page !== "lesen-schreiben") return;
  const answers = isH ? state.answers.hoeren : state.answers.lesen;
  const items = isH ? allHoeren(exam) : allLesen(exam);
  const rows = $$(".brow");
  items.forEach((it, i) => {
    const row = rows[i];
    if (!row) return;
    const chosen = answers[it.id];
    $$(".bub", row).forEach((b) => {
      const v = b.textContent === "–" ? "-" : b.textContent;
      b.classList.toggle("on", v === chosen);
    });
  });
  const c = $("#asheet-count");
  if (c) c.textContent = `${items.filter((i) => answers[i.id]).length}/${items.length}`;
}

function setTape(text, tone = "") {
  state.tape = { text, tone };
  const el = $("#tape-status");
  if (el) {
    el.textContent = text;
    el.className = `tape-status ${tone}`;
  }
}

function refreshAudioUI(exam) {
  const led = state.ledger;
  allHoeren(exam).forEach((it) => {
    const btn = document.querySelector(`[data-play="${it.id}"]`);
    if (!btn) return;
    const spent = led.spent(it);
    btn.disabled = spent || state.running;
    btn.textContent = spent ? "Nicht mehr verfügbar" : "▶ Text hören";
    const row = btn.closest(".q-audio");
    const pips = row && row.querySelector(".plays");
    if (pips) pips.outerHTML = playPips(it, led);
  });
  const run = $("#tape-run");
  if (run) run.disabled = state.running;
}

async function playOne(exam, id) {
  const item = allHoeren(exam).find((i) => String(i.id) === String(id));
  if (!item || state.ledger.spent(item) || state.running) return;
  state.running = true;
  refreshAudioUI(exam);
  const token = ++AudioPlayer.token;
  state.ledger.consume(item);
  const left = state.ledger.remaining(item);
  setTape(`Aufgabe ${item.id} läuft …`, "live");
  try {
    await AudioPlayer.playFile(item.audio, token);
    setTape(left > 0
      ? `Aufgabe ${item.id} gehört. Du kannst diesen Text noch ${left}× starten.`
      : `Aufgabe ${item.id} ist verbraucht. Dieser Text ist jetzt weg — wie in der Prüfung.`, "");
  } catch (err) {
    if (err.message !== "abgebrochen") setTape(err.message, "err");
  } finally {
    state.running = false;
    refreshAudioUI(exam);
  }
}

/** Plays the whole recording like the exam CD: pauses to read, each text its official number of times. */
async function playWholeTape(exam) {
  if (state.running) return;
  const led = state.ledger;
  const queue = allHoeren(exam).filter((it) => !led.spent(it));
  if (!queue.length) {
    setTape("Die ganze Aufnahme ist schon durchgelaufen.", "err");
    return;
  }
  state.running = true;
  refreshAudioUI(exam);
  const token = ++AudioPlayer.token;
  try {
    setTape("Die Prüfung beginnt. Sie hören zuerst Teil 1.", "live");
    await AudioPlayer.wait(2600, token);
    for (const item of queue) {
      const rounds = led.remaining(item);
      for (let r = 0; r < rounds; r += 1) {
        setTape(`Aufgabe ${item.id} — ${r === 0 ? "Sie lesen die Aufgabe" : "Sie hören den Text noch einmal"} …`, "live");
        await AudioPlayer.wait(r === 0 ? 4200 : 1400, token);
        led.consume(item);
        refreshAudioUI(exam);
        setTape(`Aufgabe ${item.id} läuft …`, "live");
        await AudioPlayer.playFile(item.audio, token);
      }
      setTape(`Aufgabe ${item.id} — kreuzen Sie jetzt an.`, "live");
      await AudioPlayer.wait(3200, token);
    }
    setTape("Ende der Tonaufnahme. Übertragen Sie Ihre Lösungen.", "");
  } catch (err) {
    if (err.message !== "abgebrochen") setTape(`${err.message}`, "err");
    else setTape("Aufnahme gestoppt.", "");
  } finally {
    state.running = false;
    refreshAudioUI(exam);
  }
}

function runClock(examId, key, minutes) {
  const id = `${examId}:${key}`;
  if (!state.timers[id]) state.timers[id] = Date.now() + minutes * 60000;
  const total = minutes * 60000;
  if (state.tick) clearInterval(state.tick);
  const paint = () => {
    const box = $("#clock");
    if (!box) { clearInterval(state.tick); state.tick = null; return; }
    const left = Math.max(0, state.timers[id] - Date.now());
    const mm = String(Math.floor(left / 60000)).padStart(2, "0");
    const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
    $(".t", box).textContent = `${mm}:${ss}`;
    $(".bar i", box).style.width = `${(left / total) * 100}%`;
    box.classList.toggle("low", left < 5 * 60000);
  };
  paint();
  state.tick = setInterval(paint, 500);
}

/* ============================ router ============================ */

async function render() {
  const r = route();
  const app = $("#app");
  if (r.page === "home" || r.page === "format") {
    AudioPlayer.stop();
    if (state.tick) { clearInterval(state.tick); state.tick = null; }
    app.innerHTML = r.page === "home" ? pageHome() : pageFormat();
    window.scrollTo(0, 0);
    return;
  }
  try {
    const exam = await loadExam(r.id);
    if (state.examId !== r.id) { state.examId = r.id; resetExam(); }
    if (r.page === "intro") { AudioPlayer.stop(); resetExam(); }
    if (r.page !== "hoeren") AudioPlayer.stop();

    const view = {
      intro: pageIntro, hoeren: pageHoeren,
      "lesen-schreiben": pageLesenSchreiben, sprechen: pageSprechen, ergebnis: pageErgebnis,
    }[r.page];
    app.innerHTML = view(exam);
    bind(exam, r.page);
    window.scrollTo(0, 0);
  } catch (err) {
    app.innerHTML = topbar("") + `<div class="wrap wrap-narrow"><div class="card">
      <h2>Da ist etwas schiefgelaufen</h2><p>${esc(err.message)}</p>
      <p class="note">Starte die Seite über <code>./start.sh</code> und öffne
      <a href="http://127.0.0.1:8765">127.0.0.1:8765</a>. Als lokale Datei (file://) funktionieren Aufnahmen und Aufgaben nicht.</p>
      <a class="btn" href="#/">Zur Startseite</a></div></div>`;
  }
}

window.addEventListener("hashchange", render);
render();
