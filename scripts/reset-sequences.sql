-- REQUIRED after legacy import. Run once in Supabase SQL Editor.
do $$ declare t text; largest_id bigint; begin
 foreach t in array array['books','user_books','ratings','reviews','lists','list_books','reading_goals'] loop
  execute format('select max(id) from public.%I',t) into largest_id;
  perform pg_catalog.setval(pg_catalog.pg_get_serial_sequence('public.'||t,'id'),coalesce(largest_id,1),largest_id is not null);
 end loop;
end $$;
