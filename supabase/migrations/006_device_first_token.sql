-- Full device info (UA, screen, etc.) as JSONB
alter table messages add column if not exists device_info jsonb;

-- Time to first token (replaces time_to_answer — more meaningful metric)
alter table messages add column if not exists time_to_first_token numeric(10,3);
alter table sessions add column if not exists mean_time_to_first_token numeric(10,3);
