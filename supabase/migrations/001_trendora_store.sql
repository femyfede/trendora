create table if not exists public.trendora_store (
  id smallint primary key check (id = 1),
  version bigint not null default 0,
  payload jsonb not null
);

alter table public.trendora_store enable row level security;

revoke all on table public.trendora_store from anon, authenticated;
grant select, insert, update on table public.trendora_store to service_role;

create or replace function public.write_trendora_store(
  p_expected_version bigint,
  p_payload jsonb
)
returns table(new_version bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.trendora_store as store
  set payload = p_payload,
      version = store.version + 1
  where store.id = 1
    and store.version = p_expected_version
  returning store.version;
end;
$$;

revoke all on function public.write_trendora_store(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.write_trendora_store(bigint, jsonb) to service_role;
