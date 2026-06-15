update public.houses
set
  name = case slug
    when 'red' then 'Red Bulls'
    when 'green' then 'Green Eagles'
    when 'yellow' then 'Yellow Tigers'
    when 'blue' then 'Blue Sharks'
  end,
  color = case slug
    when 'red' then '#ed1c24'
    when 'green' then '#286337'
    when 'yellow' then '#ffd900'
    when 'blue' then '#185d91'
  end,
  banner_url = case slug
    when 'red' then '/images/houses/red-bulls.jpg'
    when 'green' then '/images/houses/green-eagles.jpg'
    when 'yellow' then '/images/houses/yellow-tigers.jpg'
    when 'blue' then '/images/houses/blue-sharks.jpg'
  end
where slug in ('red', 'green', 'yellow', 'blue');
