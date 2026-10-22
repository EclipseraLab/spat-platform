create extension if not exists pgcrypto;
create type public.reward_status as enum ('pending','approved','rejected','held');
create type public.ledger_kind as enum ('earn','spend','conversion','adjustment');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.point_balances (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 sp_balance bigint not null default 0 check (sp_balance >= 0),
 gp_balance bigint not null default 0 check (gp_balance >= 0),
 lifetime_sp_earned bigint not null default 0 check (lifetime_sp_earned >= 0),
 updated_at timestamptz not null default now()
);
create table public.point_ledger (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 kind public.ledger_kind not null,
 currency text not null check (currency in ('SP','GP')),
 amount bigint not null check (amount <> 0),
 source_type text not null,
 source_id uuid,
 idempotency_key text not null,
 description text not null default '',
 created_at timestamptz not null default now(),
 unique(user_id,idempotency_key)
);
create table public.check_ins (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 claimed_at timestamptz not null default now(),
 points_awarded integer not null default 3 check (points_awarded = 3)
);
create index check_ins_user_time_idx on public.check_ins(user_id,claimed_at desc);

create table public.quiz_questions (
 id uuid primary key default gen_random_uuid(),
 prompt text not null,
 options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options)=4),
 correct_option smallint not null check(correct_option between 0 and 3),
 explanation text not null default '',
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.weekly_quiz_assignments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 week_start date not null,
 question_order uuid[] not null check(cardinality(question_order)=5),
 created_at timestamptz not null default now(),
 unique(user_id,week_start)
);
create table public.quiz_answers (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 week_start date not null,
 question_id uuid not null references public.quiz_questions(id),
 selected_option smallint not null check(selected_option between 0 and 3),
 is_correct boolean not null,
 points_awarded integer not null default 0 check(points_awarded in (0,10)),
 answered_at timestamptz not null default now(),
 unique(user_id,week_start,question_id)
);
create table public.missions (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 description text not null default '',
 reward_sp integer not null check(reward_sp>=0),
 active boolean not null default true,
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.reward_claims (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 task_type text not null,
 task_id uuid,
 evidence_url text,
 status public.reward_status not null default 'pending',
 requested_points integer not null check(requested_points>=0),
 reviewed_by uuid references public.profiles(id),
 review_note text not null default '',
 reviewed_at timestamptz,
 appeal_count smallint not null default 0 check(appeal_count between 0 and 1),
 created_at timestamptz not null default now()
);
create index reward_claims_review_idx on public.reward_claims(status,created_at);
create table public.admin_audit_log (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references public.profiles(id),
 action text not null,
 target_type text not null,
 target_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.point_balances enable row level security;
alter table public.point_ledger enable row level security;
alter table public.check_ins enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.weekly_quiz_assignments enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.missions enable row level security;
alter table public.reward_claims enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "Read own profile" on public.profiles for select to authenticated using(auth.uid()=id);
create policy "Update own profile" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy "Read own balance" on public.point_balances for select to authenticated using(auth.uid()=user_id);
create policy "Read own ledger" on public.point_ledger for select to authenticated using(auth.uid()=user_id);
create policy "Read own check-ins" on public.check_ins for select to authenticated using(auth.uid()=user_id);
create policy "Read active questions" on public.quiz_questions for select to authenticated using(active=true);
create policy "Read own quiz assignment" on public.weekly_quiz_assignments for select to authenticated using(auth.uid()=user_id);
create policy "Read own answers" on public.quiz_answers for select to authenticated using(auth.uid()=user_id);
create policy "Read active missions" on public.missions for select to authenticated using(active=true);
create policy "Read own reward claims" on public.reward_claims for select to authenticated using(auth.uid()=user_id);
revoke insert,update,delete on public.point_balances from anon,authenticated;
revoke insert,update,delete on public.point_ledger from anon,authenticated;
revoke insert,update,delete on public.check_ins from anon,authenticated;
revoke insert,update,delete on public.weekly_quiz_assignments from anon,authenticated;
revoke insert,update,delete on public.quiz_answers from anon,authenticated;
revoke insert,update,delete on public.admin_audit_log from anon,authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $$
declare chosen_username text;
begin
 chosen_username := lower(coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1)));
 if chosen_username !~ '^[a-z0-9_]{3,24}$' then
   chosen_username := 'member_' || substr(replace(new.id::text,'-',''),1,12);
 end if;
 insert into public.profiles(id,username,display_name)
 values(new.id,chosen_username,coalesce(new.raw_user_meta_data->>'display_name',chosen_username));
 insert into public.point_balances(user_id) values(new.id);
 return new;
exception when unique_violation then
 raise exception 'That username is already in use. Choose another username.';
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
