-- user_information (auth.users handles email/password)
create table if not exists user_information (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gender text,
  birth_date date
);

alter table user_information enable row level security;

create policy "Users can manage own info" on user_information
  for all using (auth.uid() = user_id);

-- sessions
create table if not exists sessions (
  session_id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  conversation_history jsonb default '[]'::jsonb,
  num_user_messages int default 0,
  num_ai_messages int default 0,
  num_tool_calls int default 0,
  total_input_tokens int,
  total_output_tokens int,
  total_input_cost numeric(10,6),
  total_output_cost numeric(10,6),
  total_cost numeric(10,6),
  mean_time_to_answer numeric(10,3),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table sessions enable row level security;

create policy "Users can manage own sessions" on sessions
  for all using (auth.uid() = user_id);

-- messages
create table if not exists messages (
  message_id uuid primary key default gen_random_uuid(),
  session_id text references sessions(session_id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_message text,
  ai_message text,
  message_type text default 'ai_message',
  context jsonb,
  input_tokens int,
  output_tokens int,
  input_cost numeric(10,6),
  output_cost numeric(10,6),
  time_to_answer numeric(10,3),
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Users can manage own messages" on messages
  for all using (auth.uid() = user_id);
