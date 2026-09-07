#!/usr/bin/env python3
"""Build the telc A1 listening recordings.

Speech comes from Microsoft neural German voices (edge-tts). Each clip is then
processed to sound like the real thing:

  dialog     clean two-person conversation, light room tone
  durchsage  station/shop PA: chime, loudspeaker band, hall reverb
  telefon    answering machine: beep, narrow phone band

Usage:
    python3 scripts/generate_audio.py            # only missing clips
    python3 scripts/generate_audio.py --all      # rebuild everything
    python3 scripts/generate_audio.py --exam 2   # one paper
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SR = 24000

# Two speakers per paper so the four exams sound like different recordings.
CAST = {
    1: {"frau": "de-DE-KatjaNeural", "mann": "de-DE-ConradNeural"},
    2: {"frau": "de-DE-AmalaNeural", "mann": "de-DE-KillianNeural"},
    3: {"frau": "de-DE-KatjaNeural", "mann": "de-DE-KillianNeural"},
    4: {"frau": "de-DE-AmalaNeural", "mann": "de-DE-ConradNeural"},
}
# Announcers are the same across papers, like a real station or shop system.
PA_VOICE = {"frau": "de-DE-SeraphinaMultilingualNeural", "mann": "de-DE-FlorianMultilingualNeural"}

# A1 candidates need clear, unhurried speech. Announcements are a touch slower.
RATE = {"dialog": "-8%", "telefon": "-8%", "durchsage": "-12%"}

GAP_BETWEEN_SPEAKERS = 0.45
LEAD_IN = 0.35
TAIL = 0.6

PA_FILTER = (
    "highpass=f=300,lowpass=f=3400,"
    "acompressor=threshold=0.08:ratio=6:attack=5:release=90,"
    "aecho=0.85:0.8:55|105|190:0.35|0.22|0.12,"
    "volume=1.5,alimiter=limit=0.95"
)
PHONE_FILTER = (
    "highpass=f=350,lowpass=f=3200,"
    "acompressor=threshold=0.1:ratio=5:attack=4:release=70,"
    "volume=1.35,alimiter=limit=0.95"
)
ROOM_FILTER = "aecho=0.95:0.12:22:0.06,volume=1.15,alimiter=limit=0.95"
LOUDNESS = "loudnorm=I=-16:TP=-1.5:LRA=11"


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed:\n{proc.stderr[-1500:]}")


def tts(voice: str, rate: str, text: str, dest: Path) -> None:
    mp3 = dest.with_suffix(".src.mp3")
    run([
        sys.executable, "-m", "edge_tts",
        f"--voice={voice}", f"--rate={rate}",
        f"--text={text}", f"--write-media={mp3}",
    ])
    run(["ffmpeg", "-y", "-i", str(mp3), "-ar", str(SR), "-ac", "1", str(dest)])
    mp3.unlink(missing_ok=True)


def silence(seconds: float, dest: Path) -> None:
    run([
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{seconds:.3f}", str(dest),
    ])


def bell(dest: Path) -> None:
    """Two-tone station chime, bell-like decay."""
    parts = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, freq in enumerate((988, 740)):
            tone = Path(tmp) / f"t{i}.wav"
            run([
                "ffmpeg", "-y", "-f", "lavfi",
                "-i", f"aevalsrc='0.42*sin(2*PI*{freq}*t)*exp(-3.2*t)':d=0.55:s={SR}",
                "-ac", "1", str(tone),
            ])
            parts.append(tone)
        concat(parts, dest, codec="pcm_s16le", suffix=".wav")


def beep(dest: Path) -> None:
    """Answering-machine tone."""
    run([
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", f"aevalsrc='0.3*sin(2*PI*1000*t)':d=0.32:s={SR}",
        "-af", "afade=t=in:d=0.02,afade=t=out:st=0.26:d=0.06",
        "-ac", "1", str(dest),
    ])


def concat(parts: list[Path], dest: Path, codec: str = "aac", suffix: str = ".m4a") -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        lst = Path(tmp) / "list.txt"
        lst.write_text("".join(f"file '{p}'\n" for p in parts), encoding="utf-8")
        cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", str(SR), "-ac", "1"]
        if codec == "aac":
            # Every clip lands at the same perceived loudness, so a dialogue and a
            # station announcement need no volume change between them.
            cmd += ["-af", LOUDNESS, "-c:a", "aac", "-b:a", "112k"]
        else:
            cmd += ["-c:a", codec]
        run(cmd + [str(dest)])


def apply_filter(src: Path, dest: Path, chain: str) -> None:
    run(["ffmpeg", "-y", "-i", str(src), "-af", chain, "-ar", str(SR), "-ac", "1", str(dest)])


def build_item(item: dict, exam_id: int, tmp: Path) -> None:
    style = item.get("style", "dialog")
    cast = PA_VOICE if style == "durchsage" else CAST[exam_id]
    rate = RATE[style]

    speech_parts: list[Path] = []
    gap = tmp / "gap.wav"
    if not gap.exists():
        silence(GAP_BETWEEN_SPEAKERS, gap)

    for i, line in enumerate(item["lines"]):
        voice = cast.get(line["voice"], cast["frau"])
        clip = tmp / f"e{exam_id}-{item['id']}-{i}.wav"
        tts(voice, rate, line["text"], clip)
        speech_parts.append(clip)
        if i < len(item["lines"]) - 1:
            speech_parts.append(gap)

    speech = tmp / f"e{exam_id}-{item['id']}-speech.wav"
    concat(speech_parts, speech, codec="pcm_s16le", suffix=".wav")

    treated = tmp / f"e{exam_id}-{item['id']}-fx.wav"
    chain = {"durchsage": PA_FILTER, "telefon": PHONE_FILTER}.get(style, ROOM_FILTER)
    apply_filter(speech, treated, chain)

    lead = tmp / "lead.wav"
    if not lead.exists():
        silence(LEAD_IN, lead)
    tail = tmp / "tail.wav"
    if not tail.exists():
        silence(TAIL, tail)

    sequence: list[Path] = [lead]
    if style == "durchsage":
        chime = tmp / "chime.wav"
        if not chime.exists():
            bell(chime)
        short = tmp / "short.wav"
        if not short.exists():
            silence(0.28, short)
        sequence += [chime, short]
    elif style == "telefon":
        tone = tmp / "beep.wav"
        if not tone.exists():
            beep(tone)
        short = tmp / "short.wav"
        if not short.exists():
            silence(0.28, short)
        sequence += [tone, short]
    sequence += [treated, tail]

    dest = ROOT / item["audio"]
    concat(sequence, dest)
    print(f"  {dest.relative_to(ROOT)}  [{style}]")


def iter_items(exam: dict):
    for teil in ("teil1", "teil2", "teil3"):
        yield from exam["hoeren"][teil]["items"]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="rebuild clips that already exist")
    ap.add_argument("--exam", type=int, choices=(1, 2, 3, 4))
    args = ap.parse_args()

    exam_ids = [args.exam] if args.exam else [1, 2, 3, 4]
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for exam_id in exam_ids:
            exam = json.loads((ROOT / "data" / f"exam-{exam_id}.json").read_text(encoding="utf-8"))
            print(f"Prüfung {exam_id} — {exam['title']}")
            for item in iter_items(exam):
                dest = ROOT / item["audio"]
                if dest.exists() and not args.all:
                    continue
                build_item(item, exam_id, tmp_path)


if __name__ == "__main__":
    main()
