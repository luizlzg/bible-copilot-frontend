alter table user_information add column if not exists created_at timestamptz default now();
