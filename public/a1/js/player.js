/**
 * Playback with telc play limits.
 *
 * Hören Teil 1 and Teil 3: each text may be heard twice.
 * Hören Teil 2: each text may be heard once.
 * Once a text is used up it can never be played again in this sitting,
 * exactly as on the exam recording.
 */
const AudioPlayer = {
  el: null,
  token: 0,
  busy: false,
  onChange: null,

  _audio() {
    if (!this.el) {
      this.el = new Audio();
      this.el.preload = "auto";
    }
    return this.el;
  },

  stop() {
    this.token += 1;
    this.busy = false;
    const a = this._audio();
    a.pause();
    try { a.currentTime = 0; } catch (_) { /* not loaded yet */ }
    this.notify();
  },

  notify() {
    if (typeof this.onChange === "function") this.onChange();
  },

  wait(ms, token) {
    return new Promise((resolve, reject) => {
      const id = setInterval(() => {
        if (token !== this.token) {
          clearInterval(id);
          reject(new Error("abgebrochen"));
        }
      }, 120);
      setTimeout(() => {
        clearInterval(id);
        if (token !== this.token) reject(new Error("abgebrochen"));
        else resolve();
      }, ms);
    });
  },

  playFile(src, token) {
    return new Promise((resolve, reject) => {
      const a = this._audio();
      const cleanup = () => {
        a.onended = null;
        a.onerror = null;
      };
      a.onended = () => {
        cleanup();
        if (token !== this.token) reject(new Error("abgebrochen"));
        else resolve();
      };
      a.onerror = () => {
        cleanup();
        reject(new Error(`Tondatei fehlt: ${src}`));
      };
      a.src = src;
      a.play().catch((err) => {
        cleanup();
        reject(err);
      });
    });
  },
};

/** Tracks how often each text has been heard. */
class PlayLedger {
  constructor() {
    this.used = {};
  }

  allowance(item) {
    return item.plays || 1;
  }

  remaining(item) {
    return Math.max(0, this.allowance(item) - (this.used[item.id] || 0));
  }

  consume(item) {
    this.used[item.id] = (this.used[item.id] || 0) + 1;
  }

  spent(item) {
    return this.remaining(item) === 0;
  }
}
