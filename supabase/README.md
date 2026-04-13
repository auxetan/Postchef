# PostChef — Supabase setup

## Variables frontend

À renseigner dans `.env.local` :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Variables serveur déjà présentes

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `SHOTSTACK_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `PEXELS_API_KEY`

## Migration à exécuter

Appliquer le fichier :

- `supabase/migrations/20260413_phase2_auth.sql`

## Ce que la migration crée

- `profiles`
- `restaurants`
- `app_state`
- trigger de création automatique après inscription
- policies RLS basées sur `auth.uid() = user_id`

## Comportement actuel dans l'app

- si Supabase est configuré : auth réelle + sync distante
- si Supabase n'est pas configuré : mode démo local explicite pour ne pas bloquer le dev
