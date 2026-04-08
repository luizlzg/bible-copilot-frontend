-- Store full structured AI response (message + references + interpretation) in messages table
alter table messages add column if not exists ai_response jsonb;

-- Drop the old plain-text column
alter table messages drop column if exists ai_message;
