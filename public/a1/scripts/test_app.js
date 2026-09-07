/* Headless check of rendering, answer handling and the telc play limits.
   Run: node scripts/test_app.js   (needs: npm install --no-save jsdom) */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
let failures = 0;

function ok(cond, label) {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}`);
  if (!cond) failures += 1;
}

async function boot(hash) {
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"), {
    url: `http://127.0.0.1:8765/${hash}`,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const { window } = dom;

  window.HTMLMediaElement.prototype.play = function () {
    setTimeout(() => this.onended && this.onended(), 5);
    return Promise.resolve();
  };
  window.HTMLMediaElement.prototype.pause = function () {};
  window.fetch = async (url) => {
    const file = path.join(ROOT, String(url).replace(/^\//, ""));
    if (!fs.existsSync(file)) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, "utf8")) };
  };
  window.scrollTo = () => {};

  // Classic <script> tags share one global lexical scope, so evaluate as one unit.
  const bundle = ["js/icons.js", "js/player.js", "js/scoring.js", "js/app.js"]
    .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8"))
    .join("\n;\n");
  window.eval(bundle);
  await new Promise((r) => setTimeout(r, 120));
  return window;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log("\nHome");
  {
    const w = await boot("#/");
    const d = w.document;
    ok(d.querySelectorAll(".exam-card").length === 4, "four exam cards");
    ok(/Vier vollständige/.test(d.body.textContent), "hero copy present");
  }

  console.log("\nFormat");
  {
    const w = await boot("#/format");
    ok(/Start Deutsch 1/.test(w.document.body.textContent), "format page renders");
  }

  console.log("\nHören — layout");
  const w = await boot("#/pruefung/1/hoeren");
  const d = w.document;
  ok(d.querySelectorAll("[data-play]").length === 15, "15 audio buttons");
  ok(d.querySelectorAll(".q").length === 15, "15 questions");
  ok(d.querySelectorAll(".brow").length === 15, "answer sheet has 15 rows");
  // Teil 1 is picture-based; Teil 3 options are short text, as on the real paper.
  const teil1Opts = Array.from(d.querySelectorAll(".opts")).slice(0, 7)
    .flatMap((g) => Array.from(g.querySelectorAll(".opt")));
  ok(teil1Opts.length === 21, "Teil 1 has 21 options (Beispiel + 6 × 3)");
  ok(teil1Opts.every((o) => o.querySelector("figure svg")), "every Teil 1 option has an illustration");
  ok(!d.body.innerHTML.includes("stroke-dasharray=\"5 5\""), "no placeholder illustrations");
  ok(!/undefined|\[object/.test(d.body.innerHTML), "no undefined leaking into markup");

  console.log("\nHören — play limits");
  const btn2 = d.querySelector('[data-play="2"]');       // Teil 1 → 2 plays
  const btn8 = d.querySelector('[data-play="8"]');       // Teil 2 → 1 play
  ok(btn2 && !btn2.disabled, "Teil 1 item starts playable");
  ok(btn8 && !btn8.disabled, "Teil 2 item starts playable");

  btn2.click(); await wait(120);
  ok(!d.querySelector('[data-play="2"]').disabled, "Teil 1: still playable after 1st play");
  ok(/noch 1× von 2/.test(d.querySelector('[data-play="2"]').closest(".q-audio").textContent),
    "Teil 1: shows one play remaining");

  d.querySelector('[data-play="2"]').click(); await wait(120);
  ok(d.querySelector('[data-play="2"]').disabled, "Teil 1: locked after 2nd play");
  ok(/Nicht mehr verfügbar/.test(d.querySelector('[data-play="2"]').textContent), "Teil 1: shows locked label");

  d.querySelector('[data-play="8"]').click(); await wait(120);
  ok(d.querySelector('[data-play="8"]').disabled, "Teil 2: locked after a single play");

  d.querySelector('[data-play="8"]').click(); await wait(80);
  ok(d.querySelector('[data-play="8"]').disabled, "Teil 2: stays locked when clicked again");

  console.log("\nHören — answering");
  const pick = d.querySelector('[data-pick="hoeren"][data-id="1"][data-val="b"]');
  pick.click(); await wait(40);
  ok(pick.getAttribute("data-on") === "1", "chosen option is marked");
  ok(d.querySelector("#asheet-count").textContent === "1/15", "answer sheet counter updates");
  const firstRow = d.querySelectorAll(".brow")[0];
  ok(Array.from(firstRow.querySelectorAll(".bub")).some((b) => b.classList.contains("on")),
    "answer sheet bubble filled");

  console.log("\nLesen und Schreiben");
  {
    const w2 = await boot("#/pruefung/1/lesen-schreiben");
    const d2 = w2.document;
    ok(d2.querySelectorAll(".q").length === 15, "15 reading questions");
    ok(d2.querySelectorAll(".example").length === 3, "Beispiel in all three Lesen parts");
    ok(d2.querySelectorAll("[data-form]").length === 5, "5 form fields");
    ok(d2.querySelector("#write") !== null, "writing box present");
    ok(d2.querySelectorAll(".plate").length === 6, "6 signs (5 + Beispiel)");
    ok(!/undefined/.test(d2.body.innerHTML), "no undefined in markup");
  }

  console.log("\nErgebnis");
  {
    const w3 = await boot("#/pruefung/2/ergebnis");
    const d3 = w3.document;
    ok(d3.querySelectorAll(".rev").length >= 30, "review entry for every item");
    ok(/\/45/.test(d3.body.textContent), "score out of 45");
    ok(d3.querySelector("#self") !== null, "self-score input present");
    ok(!/undefined/.test(d3.body.innerHTML), "no undefined in markup");
  }

  console.log("\nAll four exams load");
  for (const id of [1, 2, 3, 4]) {
    const wx = await boot(`#/pruefung/${id}/hoeren`);
    const n = wx.document.querySelectorAll("[data-play]").length;
    ok(n === 15, `exam ${id}: 15 listening items`);
  }

  console.log(failures ? `\n${failures} FAILED\n` : "\nAll checks passed\n");
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
