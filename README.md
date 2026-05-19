# 제출 서류 체크리스트

알파프로젝트 4-1 참가비 · 4-2 교통비 · 4-3 숙박비

---

## 배포 순서

### STEP 1 — Supabase DB 만들기

1. https://supabase.com 가입 (무료)
2. **New Project** 클릭 → 프로젝트 이름 입력 → Create
3. 왼쪽 메뉴 **SQL Editor** 클릭 → 아래 쿼리 붙여넣고 **Run**

```sql
create table checks (
  id text primary key,
  checked boolean not null default false
);
```

4. **Project Settings → API** 클릭
   - Project URL 복사 → SUPABASE_URL
   - anon public 키 복사 → SUPABASE_KEY

---

### STEP 2 — GitHub에 올리기

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_ID/checklist.git
git push -u origin main
```

---

### STEP 3 — Render 배포

1. https://render.com 가입 (GitHub 계정으로 로그인)
2. **New → Web Service** 클릭
3. GitHub 레포 연결
4. 설정:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: Free
5. **Environment Variables** 에 아래 두 개 추가:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
6. Deploy → 2~3분 후 주소 생성

---

## 로컬 실행

```bash
cp .env.example .env
# .env 열어서 Supabase URL, KEY 입력

npm install
node server.js
# http://localhost:3000
```
