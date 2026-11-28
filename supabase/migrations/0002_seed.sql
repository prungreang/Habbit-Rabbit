-- Optional seed data. Sign in once first so a profile exists,
-- then set the email below to your own Google account.
do $$
declare
  uid uuid;
  h_water uuid;
  h_walk uuid;
  h_read uuid;
  d date;
begin
  select id into uid from public.profiles where email = 'you@example.com';
  if uid is null then
    raise notice 'No profile for you@example.com — sign in first, then re-run.';
    return;
  end if;

  insert into public.habits (user_id, title, emoji, color, weekdays, sort_order)
  values (uid, 'Drink a glass of water', '💧', 'secondary', '{0,1,2,3,4,5,6}', 0)
  returning id into h_water;

  insert into public.habits (user_id, title, emoji, color, weekdays, sort_order)
  values (uid, 'Ten minute walk outside', '🌿', 'primary', '{1,2,3,4,5}', 1)
  returning id into h_walk;

  insert into public.habits (user_id, title, emoji, color, weekdays, sort_order)
  values (uid, 'Read two pages', '📚', 'accent', '{0,1,2,3,4,5,6}', 2)
  returning id into h_read;

  for d in select generate_series(current_date - 6, current_date, interval '1 day')::date loop
    if random() > 0.25 then
      insert into public.habit_logs (habit_id, user_id, log_date)
      values (h_water, uid, d) on conflict do nothing;
    end if;
    if random() > 0.5 then
      insert into public.habit_logs (habit_id, user_id, log_date)
      values (h_read, uid, d) on conflict do nothing;
    end if;
  end loop;

  insert into public.notifications (user_id, title, body, kind)
  values (uid, 'Welcome to Habit Rabbit', 'Nothing here counts against you. Add one tiny thing and see how it feels.', 'info');
end $$;
