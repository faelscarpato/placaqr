-- Lote TESTE (5 placas) - rode no SQL Editor do Supabase
insert into public.plates (code, batch) values
  ('DR4ATZDH', 'TESTE'),
  ('RWN4QHQA', 'TESTE'),
  ('7F6P49RP', 'TESTE'),
  ('QS4DAUJR', 'TESTE'),
  ('UGB7H4W7', 'TESTE')
on conflict (code) do nothing;
