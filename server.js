const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log("✅ checklist-site version 2.0.0 starting");
console.log("✅ Node version:", process.version);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing environment variables: SUPABASE_URL and/or SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, version: "2.0.0" });
});

app.get("/api/checks", async (req, res) => {
  const { data, error } = await supabase
    .from("checks")
    .select("id, checked");

  if (error) {
    console.error("Supabase select error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  const result = {};
  for (const row of data || []) result[row.id] = row.checked;
  res.json(result);
});

app.post("/api/checks", async (req, res) => {
  const { id, checked } = req.body;

  if (!id || typeof checked !== "boolean") {
    return res.status(400).json({ error: "id and checked(boolean) are required" });
  }

  const { error } = await supabase
    .from("checks")
    .upsert({ id, checked }, { onConflict: "id" });

  if (error) {
    console.error("Supabase upsert error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

app.delete("/api/checks", async (req, res) => {
  const { error } = await supabase
    .from("checks")
    .delete()
    .neq("id", "__never_match__");

  if (error) {
    console.error("Supabase delete error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Express 5에서 app.get("*")가 에러를 내므로 절대 사용하지 않음.
// 루트 페이지는 public/index.html을 express.static이 자동으로 제공함.

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
