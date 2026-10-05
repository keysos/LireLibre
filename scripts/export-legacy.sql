-- Use psql against the OLD database; output is a single JSON document.
select jsonb_build_object(
 'users',coalesce((select jsonb_agg(jsonb_build_object('id',id,'email',email,'name',name,'bio',bio,'avatar_url',avatar_url,'is_public',is_public,'created_at',created_at,'email_verified_at',email_verified_at)) from public.users),'[]'::jsonb),
 'books',coalesce((select jsonb_agg(to_jsonb(b)) from public.books b),'[]'::jsonb),
 'user_books',coalesce((select jsonb_agg(to_jsonb(x)) from public.user_books x),'[]'::jsonb),
 'ratings',coalesce((select jsonb_agg(to_jsonb(x)) from public.ratings x),'[]'::jsonb),
 'reviews',coalesce((select jsonb_agg(to_jsonb(x)) from public.reviews x),'[]'::jsonb),
 'lists',coalesce((select jsonb_agg(to_jsonb(x)) from public.lists x),'[]'::jsonb),
 'list_books',coalesce((select jsonb_agg(to_jsonb(x)) from public.list_books x),'[]'::jsonb),
 'reading_goals',coalesce((select jsonb_agg(to_jsonb(x)) from public.reading_goals x),'[]'::jsonb)
);
