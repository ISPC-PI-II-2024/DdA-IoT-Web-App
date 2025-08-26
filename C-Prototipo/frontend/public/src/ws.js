// ==========================
// WebSocket Client Wrapper
// - Autenticación: token en querystring (?token=)
// - Reintentos con backoff exponencial + jitter
// - API: connect(), subscribe(topic, fn), unsubscribe(topic), close()
// - Emite mensajes {topic, ts, payload} desde el backend
// ==========================
import { storage } from "./utils/storage.js";

const CFG = () => window.__CONFIG || {};
const TOKEN_KEY = "auth_token";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export class RTClient {
  constructor() {
    this.ws = null;
    this.handlers = new Map(); // topic -> Set<fn>
    this.url = null;
    this.closing = false;
    this.backoff = { base: 500, max: 8000, factor: 2 };
  }

  onMessage(ev) {
    try {
      const data = JSON.parse(ev.data);
      if (data?.topic) {
        const set = this.handlers.get(data.topic);
        if (set) set.forEach(fn => fn(data));
      }
    } catch {
      // ignore
    }
  }

  async connect() {
    this.closing = false;
    const token = storage.get(TOKEN_KEY, null, true);
    if (!token) throw new Error("Sin token: inicie sesión");

    const base = CFG().WS_URL; // ej: ws://localhost:3000/ws
    this.url = `${base}?token=${encodeURIComponent(token)}`;

    let attempt = 0;
    while (!this.closing) {
      try {
        await this._connectOnce();
        // conectado: salir del bucle de reconexión
        return;
      } catch (e) {
        attempt++;
        const delay = Math.min(this.backoff.base * Math.pow(this.backoff.factor, attempt), this.backoff.max);
        const jitter = Math.random() * 150;
        await sleep(delay + jitter);
      }
    }
  }

  _connectOnce() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => resolve();
      ws.onmessage = (ev) => this.onMessage(ev);
      ws.onclose = () => {
        this.ws = null;
        if (!this.closing) this.connect(); // reconectar en background
      };
      ws.onerror = (err) => {
        try { ws.close(); } catch {}
        reject(err);
      };
    });
  }

  subscribe(topic, fn) {
    if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
    this.handlers.get(topic).add(fn);
    // Enviar sub al server
    this._send({ type: "sub", topic });
    // Retorna unsubscribe de conveniencia
    return () => this.unsubscribe(topic, fn);
  }

  unsubscribe(topic, fn) {
    const set = this.handlers.get(topic);
    if (set) {
      set.delete(fn);
      if (set.size === 0) this.handlers.delete(topic);
    }
    this._send({ type: "unsub", topic });
  }

  _send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  async close() {
    this.closing = true;
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }
}

// Singleton simple para la app
export const rtClient = new RTClient();
