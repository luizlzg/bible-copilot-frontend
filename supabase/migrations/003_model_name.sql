alter table messages add column if not exists model_name text;
alter table messages add column if not exists num_tool_calls int;
