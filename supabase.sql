create table if not exists checks (
  id text primary key,
  checked boolean not null default false
);
