const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// .env 또는 Render 환경변수에서 읽어옴
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 체크 상태 전체 불러오기
app.get("/api/checks", async (req, res) => {
  const { data, error } = await supabase
    .from("checks")
    .select("id, checked");

  if (error) return res.status(500).json({ error: error.message });

  // { id: checked, ... } 형태로 변환
  const result = {};
  (data || []).forEach((row) => { result[row.id] = row.checked; });
  res.json(result);
});

// 체크 하나 업데이트 (없으면 insert, 있으면 update)
app.post("/api/checks", async (req, res) => {
  const { id, checked } = req.body;
  const { error } = await supabase
    .from("checks")
    .upsert({ id, checked }, { onConflict: "id" });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// 전체 초기화
app.delete("/api/checks", async (req, res) => {
  const { error } = await supabase
    .from("checks")
    .delete()
    .neq("id", ""); // 전체 삭제

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅  서버 실행 중: http://localhost:${PORT}`);
});
