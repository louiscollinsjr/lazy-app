-- REACTION TYPES
create table if not exists public.reaction_types (
  id text primary key,  -- e.g., 'like', 'upvote', 'downvote', 'heart', 'laugh', 'sad', 'angry'
  name text not null,
  icon text,  -- Optional: store an icon class or emoji
  created_at timestamp with time zone default now()
);

-- REACTIONS (for both articles and comments)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  reaction_type_id text references reaction_types(id) on delete cascade,
  
  -- Polymorphic relationship: only one of these should be non-null
  article_id text references articles(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Ensure only one reaction type per user per content
  constraint one_reaction_per_content 
    check (num_nonnulls(article_id, comment_id) = 1),
  unique(user_id, article_id, reaction_type_id),
  unique(user_id, comment_id, reaction_type_id)
);

-- Create indexes for better query performance
create index idx_reactions_article on public.reactions(article_id) where article_id is not null;
create index idx_reactions_comment on public.reactions(comment_id) where comment_id is not null;
create index idx_reactions_user on public.reactions(user_id);

-- Insert initial reaction types
insert into public.reaction_types (id, name, icon) values
('like', 'Like', '👍'),
('upvote', 'Upvote', '⬆️'),
('downvote', 'Downvote', '⬇️')
on conflict (id) do nothing;

-- Transfer existing votes from comment_votes if the table exists
do $$
begin
  if exists (select from information_schema.tables where table_name = 'comment_votes') then
    insert into public.reactions (user_id, comment_id, reaction_type_id)
    select user_id, comment_id, 
           case when vote_type = 'up' then 'upvote' else 'downvote' end
    from public.comment_votes
    on conflict do nothing;
  end if;
end
$$;
