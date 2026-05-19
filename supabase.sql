-- Supabase SQL Editor에서 실행
-- 이미 checks 테이블이 있어도 안전하게 다시 만들지 않음
create table if not exists checks (
  id text primary key,
  checked boolean not null default false,
  updated_at timestamp with time zone default now()
);

-- upsert/update 때 updated_at 자동 갱신용 함수
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists checks_set_updated_at on checks;
create trigger checks_set_updated_at
before update on checks
for each row
execute function set_updated_at();

-- RLS가 켜져 있어도 anon key로 읽기/쓰기 가능하게 함.
-- 이 체크리스트는 공개 링크용이라 전체 공개 정책으로 설정.
alter table checks enable row level security;

drop policy if exists "Allow public read checks" on checks;
create policy "Allow public read checks"
on checks for select
to anon
using (true);

drop policy if exists "Allow public insert checks" on checks;
create policy "Allow public insert checks"
on checks for insert
to anon
with check (true);

drop policy if exists "Allow public update checks" on checks;
create policy "Allow public update checks"
on checks for update
to anon
using (true)
with check (true);

drop policy if exists "Allow public delete checks" on checks;
create policy "Allow public delete checks"
on checks for delete
to anon
using (true);
