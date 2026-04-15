-- PostChef — OAuth fix
-- Corrige le trigger handle_new_user pour extraire correctement le prénom
-- depuis les métadonnées Google (given_name / name) et Apple (full_name)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_name text;
begin
  -- Priorité : first_name (email/password) → given_name (Google) → 1er mot de full_name/name (Google/Apple)
  v_first_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'given_name'), ''),
    nullif(trim(split_part(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ), ' ', 1)), ''),
    ''
  );

  insert into public.profiles (user_id, email, first_name)
  values (
    new.id,
    coalesce(new.email, ''),
    v_first_name
  )
  on conflict (user_id) do update
    set
      email      = excluded.email,
      first_name = case
                     when public.profiles.first_name = '' then excluded.first_name
                     else public.profiles.first_name
                   end,
      updated_at = timezone('utc', now());

  insert into public.restaurants (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.app_state (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Ré-attacher le trigger (au cas où il aurait été détaché)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
