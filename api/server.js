// api/server.js (ESM) — Auto LN ping/post + optional static serve
import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const CORS_ORIGIN = "*";
const PORT = 5001;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "200kb" }));

async function axiosWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const source = axios.CancelToken.source();
  const timer = setTimeout(() => {
    source.cancel(`Timeout after ${timeoutMs}ms`);
  }, timeoutMs);

  try {
    const response = await axios({
      url,
      cancelToken: source.token,
      ...opts,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ------------ Auto LN (GrowxAutoLnForm) ping and post endpoints -------------
const TRACKDRIVE_NUMBER_23 = "+18446163653";
const TRAFFIC_SOURCE_ID_23 = "1000";

// GET /api/ping23 — proxies check_for_available_auto_ins_buyers ping (Auto LN)
app.get("/api/ping23", async (req, res) => {
  try {
    if (!TRACKDRIVE_NUMBER_23 || !TRAFFIC_SOURCE_ID_23) {
      console.error("Missing TRACKDRIVE_NUMBER_23 or TRAFFIC_SOURCE_ID_23");
      return res.status(500).json({
        success: false,
        status: "error",
        errors: ["Server misconfiguration"],
      });
    }

    const {
      caller_id,
      first_name,
      last_name,
      city,
      state,
      zip,
      dob,
      marital_status,
      gender,
      residence_status,
      vehicle1_year,
      vehicle1_make,
      vehicle1_model,
      ip_address,
      jornaya_leadid,
      trusted_form_cert_url,
      original_lead_submit_date,
      age,
    } = req.query;

    if (!caller_id || !/^\+1\d{10}$/.test(String(caller_id))) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid or missing caller_id. Expected +1XXXXXXXXXX"],
      });
    }

    let apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/ping/check_for_available_auto_ins_buyers" +
      `?trackdrive_number=${encodeURIComponent(TRACKDRIVE_NUMBER_23)}` +
      `&traffic_source_id=${encodeURIComponent(TRAFFIC_SOURCE_ID_23)}` +
      `&caller_id=${encodeURIComponent(caller_id)}`;

    if (first_name) apiUrl += `&first_name=${encodeURIComponent(first_name)}`;
    if (last_name) apiUrl += `&last_name=${encodeURIComponent(last_name)}`;
    if (city) apiUrl += `&city=${encodeURIComponent(city)}`;
    if (state) apiUrl += `&state=${encodeURIComponent(state)}`;
    if (zip) apiUrl += `&zip=${encodeURIComponent(zip)}`;
    if (dob) apiUrl += `&dob=${encodeURIComponent(dob)}`;
    if (marital_status) apiUrl += `&marital_status=${encodeURIComponent(marital_status)}`;
    if (gender) apiUrl += `&gender=${encodeURIComponent(gender)}`;
    if (residence_status) apiUrl += `&residence_status=${encodeURIComponent(residence_status)}`;
    if (vehicle1_year) apiUrl += `&vehicle1_year=${encodeURIComponent(vehicle1_year)}`;
    if (vehicle1_make) apiUrl += `&vehicle1_make=${encodeURIComponent(vehicle1_make)}`;
    if (vehicle1_model) apiUrl += `&vehicle1_model=${encodeURIComponent(vehicle1_model)}`;
    if (ip_address) apiUrl += `&ip_address=${encodeURIComponent(ip_address)}`;
    if (jornaya_leadid) apiUrl += `&jornaya_leadid=${encodeURIComponent(jornaya_leadid)}`;
    if (trusted_form_cert_url) {
      apiUrl += `&trusted_form_cert_url=${encodeURIComponent(trusted_form_cert_url)}`;
    }
    if (original_lead_submit_date) {
      apiUrl += `&original_lead_submit_date=${encodeURIComponent(original_lead_submit_date)}`;
    }
    if (age) apiUrl += `&age=${encodeURIComponent(age)}`;

    console.log("Ping23 upstream URL:", apiUrl);
    const upstream = await axiosWithTimeout(apiUrl, { method: "GET" }, 8000);
    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    console.error("Ping23 upstream error:", err.message || err);

    if (axios.isCancel(err)) {
      return res.status(504).json({
        success: false,
        status: "timeout",
        errors: ["Upstream request timed out"],
      });
    }

    if (err.response) {
      let errors;
      if (typeof err.response.data?.errors === "object" && !Array.isArray(err.response.data?.errors)) {
        errors = Object.entries(err.response.data.errors).map(([key, messages]) =>
          Array.isArray(messages) ? `${key}: ${messages.join(", ")}` : `${key}: ${messages}`
        );
      } else {
        errors = err.response.data?.errors || [`Upstream status ${err.response.status}`];
      }
      return res.status(err.response.status || 502).json({
        success: false,
        status: "upstream_error",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + (err.message || "unknown")],
    });
  }
});

// POST /api/post23 — proxies check_for_available_auto_ins_buyers post (Auto LN)
app.post("/api/post23", async (req, res) => {
  if (!TRACKDRIVE_NUMBER_23 || !TRAFFIC_SOURCE_ID_23) {
    console.error("Missing TRACKDRIVE_NUMBER_23 or TRAFFIC_SOURCE_ID_23");
    return res.status(500).json({ success: false, status: "error", errors: ["Server misconfiguration"] });
  }

  try {
    const body = req.body || {};

    const required = ["ping_id", "caller_id", "first_name", "last_name", "city", "state", "zip"];
    const missing = required.filter(
      (k) => body[k] === undefined || body[k] === null || String(body[k]).trim() === ""
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Missing required fields: " + missing.join(", ")],
      });
    }

    const callerId = String(body.caller_id).trim();
    if (!/^\+1\d{10}$/.test(callerId)) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid caller_id. Expected +1XXXXXXXXXX"],
      });
    }

    const zip = String(body.zip).trim();
    if (!/^\d{5}$/.test(zip)) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid zip. Expected 5-digit US ZIP code"],
      });
    }

    const payload = {
      ping_id: String(body.ping_id).trim(),
      caller_id: callerId,
      first_name: String(body.first_name).trim(),
      last_name: String(body.last_name).trim(),
      city: String(body.city).trim(),
      state: String(body.state).trim(),
      zip,
      trackdrive_number: TRACKDRIVE_NUMBER_23,
      traffic_source_id: TRAFFIC_SOURCE_ID_23,
    };

    const optional = [
      "dob",
      "marital_status",
      "gender",
      "residence_status",
      "vehicle1_year",
      "vehicle1_make",
      "vehicle1_model",
      "ip_address",
      "jornaya_leadid",
      "trusted_form_cert_url",
      "original_lead_submit_date",
      "age",
    ];
    for (const key of optional) {
      if (body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== "") {
        payload[key] = String(body[key]).trim();
      }
    }

    const apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/post/check_for_available_auto_ins_buyers";

    console.log("Post23 upstream URL:", apiUrl);
    const upstream = await axiosWithTimeout(
      apiUrl,
      { method: "POST", headers: { "Content-Type": "application/json" }, data: JSON.stringify(payload) },
      10000
    );

    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    console.error("Post23 upstream error:", err.message || err);
    if (axios.isCancel(err)) {
      return res.status(504).json({ success: false, status: "timeout", errors: ["Upstream request timed out"] });
    }
    if (err.response) {
      let errors;
      if (typeof err.response.data?.errors === "object" && !Array.isArray(err.response.data?.errors)) {
        errors = Object.entries(err.response.data.errors).map(([key, messages]) =>
          Array.isArray(messages) ? `${key}: ${messages.join(", ")}` : `${key}: ${messages}`
        );
      } else {
        errors = err.response.data?.errors || [`Upstream status ${err.response.status}`];
      }
      return res.status(err.response.status || 502).json({ success: false, status: "upstream_error", errors });
    }
    return res.status(500).json({ success: false, status: "error", errors: ["Server error: " + (err.message || "unknown")] });
  }
});

// ----- Serve built frontend in production -----
const distPath = path.join(__dirname, "..", "dist");

if (fs.existsSync(distPath)) {
  console.log("Serving static files from:", distPath);
  app.use(express.static(distPath));

  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("Dist folder not found; skipping static file serving (dev mode).");
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
