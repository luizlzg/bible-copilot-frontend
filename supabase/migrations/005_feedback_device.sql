alter table messages add column if not exists user_feedback text; -- 'like' | 'dislike'
alter table messages add column if not exists device_type text;   -- 'mobile' | 'desktop'
