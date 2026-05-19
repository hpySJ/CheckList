const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

// 로컬 실행용: .env 파일이 있으면 직접 읽음. Render에서는 Environment Variables 사용.
function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const app = express();
const PORT = process.env.PORT || 3000;

// Render 환경변수 이름 오타까지 어느 정도 허용
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.supabase_URL ||
  process.env.SUPABASE_PROJECT_URL;

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.supabase_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase 환경변수가 없습니다.");
  console.error("Render → Environment에 SUPABASE_URL, SUPABASE_KEY를 추가하세요.");
  console.error("현재 SUPABASE_URL 존재 여부:", Boolean(supabaseUrl));
  console.error("현재 SUPABASE_KEY 존재 여부:", Boolean(supabaseKey));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "server is running" });
});

// 체크 상태 전체 불러오기
app.get("/api/checks", async (req, res) => {
  const { data, error } = await supabase
    .from("checks")
    .select("id, checked");

  if (error) {
    console.error("GET /api/checks error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  const result = {};
  for (const row of data || []) {
    result[row.id] = row.checked;
  }

  res.json(result);
});

// 체크 하나 업데이트. 없으면 insert, 있으면 update.
app.post("/api/checks", async (req, res) => {
  const { id, checked } = req.body || {};

  if (typeof id !== "string" || id.length === 0 || typeof checked !== "boolean") {
    return res.status(400).json({ error: "id(string)와 checked(boolean)가 필요합니다." });
  }

  const { data, error } = await supabase
    .from("checks")
    .upsert({ id, checked }, { onConflict: "id" })
    .select("id, checked")
    .single();

  if (error) {
    console.error("POST /api/checks error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true, item: data });
});

// 전체 초기화
app.delete("/api/checks", async (req, res) => {
  const { error } = await supabase
    .from("checks")
    .delete()
    .not("id", "is", null);

  if (error) {
    console.error("DELETE /api/checks error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// 새로고침/직접 접근 대응
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
