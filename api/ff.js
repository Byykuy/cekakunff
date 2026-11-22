"use strict";
// Fungsi serverless Vercel. API key dibaca dari Environment Variable FF_APIKEY.
const UPSTREAM = "https://apiz.vsunsee.qzz.io/vsunseeV8/freefire/stalk";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") return res.status(405).json({ error: "Metode tidak diizinkan" });

  const uid = String((req.query && req.query.uid) || "");
  if (!/^\d{5,15}$/.test(uid)) return res.status(400).json({ error: "UID tidak valid" });

  const key = process.env.FF_APIKEY;
  if (!key) return res.status(500).json({ error: "FF_APIKEY belum diatur di Vercel" });

  try {
    const target = (process.env.FF_UPSTREAM || UPSTREAM) +
      "?apikey=" + encodeURIComponent(key) + "&uid=" + encodeURIComponent(uid);
    const up = await fetch(target, { signal: AbortSignal.timeout(9000), headers: { Accept: "application/json" } });
    if (!up.ok) return res.status(502).json({ error: "Penyedia API menolak permintaan" });
    const json = await up.json();
    if (json.status !== true || !json.summary) return res.status(404).json({ error: "Akun tidak ditemukan" });
    return res.status(200).json(json);
  } catch (e) {
    return res.status(502).json({ error: "Penyedia API tidak bisa dihubungi" });
  }
};
