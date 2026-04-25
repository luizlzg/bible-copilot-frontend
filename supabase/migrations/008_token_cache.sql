alter table messages add column if not exists cache_read_tokens int;
alter table messages add column if not exists cache_creation_tokens int; 