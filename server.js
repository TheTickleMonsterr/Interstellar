import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Proxy route
app.get("/proxy/:url(*)", async (req, res) => {
  try {
    let targetUrl = req.params.url;

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      }
    });

    // Copy content-type
    res.set("Content-Type", response.headers.get("content-type") || "text/html");

    // Remove iframe blocking headers
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");

    const body = await response.text();
    res.send(body);

  } catch (err) {
    res.status(500).send("Error loading page.");
  }
});

// Fallback → home page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
