#!/usr/bin/env python3
"""Check all four papers against the telc A1 format before you rely on them."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
problems: list[str] = []


def check(cond, msg):
    if not cond:
        problems.append(msg)


def main() -> None:
    for exam_id in (1, 2, 3, 4):
        tag = f"exam {exam_id}"
        exam = json.loads((ROOT / "data" / f"exam-{exam_id}.json").read_text(encoding="utf-8"))

        h1, h2, h3 = (exam["hoeren"][k] for k in ("teil1", "teil2", "teil3"))
        check(len(h1["items"]) == 6, f"{tag}: Hören Teil 1 needs 6 items")
        check(len(h2["items"]) == 4, f"{tag}: Hören Teil 2 needs 4 items")
        check(len(h3["items"]) == 5, f"{tag}: Hören Teil 3 needs 5 items")

        seen_ids = []
        for teil_no, blk in ((1, h1), (2, h2), (3, h3)):
            want_plays = 1 if teil_no == 2 else 2
            for it in blk["items"]:
                where = f"{tag} Hören {it['id']}"
                seen_ids.append(it["id"])
                check(it.get("plays") == want_plays, f"{where}: should be heard {want_plays}×")
                check(it.get("style") in ("dialog", "durchsage", "telefon"), f"{where}: unknown style")
                check(bool(it.get("lines")), f"{where}: no spoken lines")
                for ln in it["lines"]:
                    check(ln["voice"] in ("frau", "mann"), f"{where}: bad voice role {ln['voice']!r}")
                    # Multi-digit numerals get read as one large number by the voice engine.
                    for run_ in re.findall(r"\d[\d\s]*\d", ln["text"]):
                        check(len(run_.replace(" ", "")) <= 2,
                              f"{where}: spell out digits {run_!r} so they are read one by one")
                if teil_no == 2:
                    check(it["answer"] in ("+", "-"), f"{where}: answer must be + or -")
                    check("statement" in it, f"{where}: missing statement")
                else:
                    ids = [o["id"] for o in it["options"]]
                    check(ids == ["a", "b", "c"], f"{where}: options must be a/b/c")
                    check(it["answer"] in ids, f"{where}: answer not among options")
                    check("question" in it, f"{where}: missing question")
                for lang in ("de", "en"):
                    check(it.get("explanation", {}).get(lang), f"{where}: missing {lang} explanation")
                audio = ROOT / it["audio"]
                check(audio.exists() and audio.stat().st_size > 8000, f"{where}: audio missing or tiny")
        check(seen_ids == list(range(1, 16)), f"{tag}: Hören items must be numbered 1–15")

        l1, l2, l3 = (exam["lesen"][k] for k in ("teil1", "teil2", "teil3"))
        check(len(l1["items"]) == 5 and len(l2["items"]) == 5 and len(l3["items"]) == 5,
              f"{tag}: each Lesen part needs 5 items")
        check([i["id"] for i in l1["items"] + l2["items"] + l3["items"]] == list(range(1, 16)),
              f"{tag}: Lesen items must be numbered 1–15")
        for part, blk in (("Lesen 1", l1), ("Lesen 2", l2), ("Lesen 3", l3)):
            check("example" in blk, f"{tag}: {part} has no Beispiel")
        check(len(l1["texts"]) == 2 and all(t.get("kind") for t in l1["texts"]),
              f"{tag}: Lesen Teil 1 needs 2 labelled texts")
        for it in l1["items"] + l3["items"]:
            check(it["answer"] in ("+", "-"), f"{tag} Lesen {it['id']}: answer must be + or -")
        for it in l2["items"]:
            ids = [o["id"] for o in it["options"]]
            check(ids == ["a", "b"], f"{tag} Lesen {it['id']}: needs options a and b")
            check(it["answer"] in ids, f"{tag} Lesen {it['id']}: answer not among options")
        for it in l3["items"]:
            check(it.get("where"), f"{tag} Lesen {it['id']}: sign has no location label")

        s1, s2 = exam["schreiben"]["teil1"], exam["schreiben"]["teil2"]
        check(s1.get("formTitle"), f"{tag}: form has no title")
        gaps = [f for f in s1["fields"] if not f.get("prefill")]
        check(len(gaps) == 5, f"{tag}: Schreiben Teil 1 needs exactly 5 gaps, found {len(gaps)}")
        for f in gaps:
            check(bool(f.get("accepted")), f"{tag}: field {f['id']} has no accepted answers")
        check(len(s2["points"]) == 3, f"{tag}: Schreiben Teil 2 needs 3 content points")
        words = len(s2["model"].split())
        check(20 <= words <= 55, f"{tag}: model answer is {words} words, expected roughly 30")

        if not problems:
            print(f"{tag}: {exam['title']} — OK")

    if problems:
        print("\nPROBLEMS")
        for p in problems:
            print(f"  - {p}")
        sys.exit(1)
    print("\nall 4 papers, 60 recordings and 120 items check out")


if __name__ == "__main__":
    main()
