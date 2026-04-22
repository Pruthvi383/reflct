insert into public.prize_pool_config (match_type, percentage)
values
  ('match_5', 40),
  ('match_4', 35),
  ('match_3', 25)
on conflict (match_type) do update
set percentage = excluded.percentage;

insert into public.charities (
  name,
  slug,
  description,
  impact_blurb,
  image_url,
  event_blurb,
  location,
  website_url,
  tags,
  featured
)
values
  (
    'First Tee Futures',
    'first-tee-futures',
    'Creates access to coaching, life-skills mentoring, and equipment grants for young players from underrepresented communities.',
    'Every active subscriber helps fund lesson access, green-fee support, and youth mentoring.',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    'Community golf day on June 14 with local coaches and school partners.',
    'Atlanta, GA',
    'https://example.org/first-tee-futures',
    array['youth', 'education', 'access'],
    true
  ),
  (
    'Fairways for Families',
    'fairways-for-families',
    'Supports families navigating cancer treatment with travel grants, meals, and short-term emergency relief.',
    'Subscription giving turns monthly play into practical support when households are stretched thin.',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'Charity scramble and dinner fundraiser in July.',
    'Austin, TX',
    'https://example.org/fairways-for-families',
    array['health', 'relief', 'families'],
    false
  ),
  (
    'Open Greens Alliance',
    'open-greens-alliance',
    'Builds inclusive community sport programs and funds adaptive golf events for players with disabilities.',
    'Members help open more accessible events, transport, and adapted coaching sessions.',
    'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1200&q=80',
    'Adaptive golf showcase and volunteer day next month.',
    'San Diego, CA',
    'https://example.org/open-greens-alliance',
    array['inclusion', 'community', 'adaptive-sport'],
    false
  )
on conflict (slug) do update
set description = excluded.description,
    impact_blurb = excluded.impact_blurb,
    image_url = excluded.image_url,
    event_blurb = excluded.event_blurb,
    location = excluded.location,
    website_url = excluded.website_url,
    tags = excluded.tags,
    featured = excluded.featured;
