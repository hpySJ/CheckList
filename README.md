# 제출 서류 체크리스트

Render + Supabase로 체크 상태가 저장되는 체크리스트입니다.

## 1. Supabase SQL 실행

Supabase → SQL Editor에서 `supabase.sql` 파일 내용을 전부 붙여넣고 Run 하세요.

## 2. Render 환경변수

Render → Environment에 아래 두 개를 정확히 추가하세요.

```env
SUPABASE_URL=Supabase Project URL
SUPABASE_KEY=Supabase anon key 또는 publishable key
```

## 3. Render 설정

- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: Free 가능

## 4. 배포 확인

- `/health` 접속 → `{ "ok": true }` 나오면 서버 정상
- `/api/checks` 접속 → `{}` 또는 저장된 체크 데이터가 나오면 Supabase 연결 정상
