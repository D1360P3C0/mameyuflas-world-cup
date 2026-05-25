-- ============================================================
-- MWC — Seed: Equipos y Partidos del Mundial 2026
-- 48 equipos + 72 partidos de fase de grupos
-- Fuente: Sorteo oficial FIFA, 5 Dic 2025, Kennedy Center, Washington D.C.
-- ============================================================

-- ============================================================
-- EQUIPOS (48)
-- Los horarios de los partidos son aproximados (18:00 UTC).
-- Un admin puede actualizarlos vía panel de administración.
-- ============================================================
INSERT INTO public.teams (id, name, country_code, group_letter, confederation)
VALUES
  -- GRUPO A
  ('MEX', 'Mexico',           'MX', 'A', 'CONCACAF'),
  ('RSA', 'South Africa',     'ZA', 'A', 'CAF'),
  ('KOR', 'South Korea',      'KR', 'A', 'AFC'),
  ('CZE', 'Czech Republic',   'CZ', 'A', 'UEFA'),
  -- GRUPO B
  ('CAN', 'Canada',                    'CA', 'B', 'CONCACAF'),
  ('BIH', 'Bosnia and Herzegovina',    'BA', 'B', 'UEFA'),
  ('QAT', 'Qatar',                     'QA', 'B', 'AFC'),
  ('SUI', 'Switzerland',               'CH', 'B', 'UEFA'),
  -- GRUPO C
  ('BRA', 'Brazil',    'BR', 'C', 'CONMEBOL'),
  ('MAR', 'Morocco',   'MA', 'C', 'CAF'),
  ('HAI', 'Haiti',     'HT', 'C', 'CONCACAF'),
  ('SCO', 'Scotland',  'SC', 'C', 'UEFA'),
  -- GRUPO D
  ('USA', 'United States', 'US', 'D', 'CONCACAF'),
  ('PAR', 'Paraguay',      'PY', 'D', 'CONMEBOL'),
  ('AUS', 'Australia',     'AU', 'D', 'AFC'),
  ('TUR', 'Turkey',        'TR', 'D', 'UEFA'),
  -- GRUPO E
  ('GER', 'Germany',       'DE', 'E', 'UEFA'),
  ('CUW', 'Curaçao',       'CW', 'E', 'CONCACAF'),
  ('CIV', 'Côte d''Ivoire','CI', 'E', 'CAF'),
  ('ECU', 'Ecuador',       'EC', 'E', 'CONMEBOL'),
  -- GRUPO F
  ('NED', 'Netherlands', 'NL', 'F', 'UEFA'),
  ('JPN', 'Japan',       'JP', 'F', 'AFC'),
  ('SWE', 'Sweden',      'SE', 'F', 'UEFA'),
  ('TUN', 'Tunisia',     'TN', 'F', 'CAF'),
  -- GRUPO G
  ('BEL', 'Belgium',     'BE', 'G', 'UEFA'),
  ('EGY', 'Egypt',       'EG', 'G', 'CAF'),
  ('IRN', 'Iran',        'IR', 'G', 'AFC'),
  ('NZL', 'New Zealand', 'NZ', 'G', 'OFC'),
  -- GRUPO H
  ('ESP', 'Spain',         'ES', 'H', 'UEFA'),
  ('CPV', 'Cape Verde',    'CV', 'H', 'CAF'),
  ('KSA', 'Saudi Arabia',  'SA', 'H', 'AFC'),
  ('URU', 'Uruguay',       'UY', 'H', 'CONMEBOL'),
  -- GRUPO I
  ('FRA', 'France',   'FR', 'I', 'UEFA'),
  ('SEN', 'Senegal',  'SN', 'I', 'CAF'),
  ('IRQ', 'Iraq',     'IQ', 'I', 'AFC'),
  ('NOR', 'Norway',   'NO', 'I', 'UEFA'),
  -- GRUPO J
  ('ARG', 'Argentina', 'AR', 'J', 'CONMEBOL'),
  ('ALG', 'Algeria',   'DZ', 'J', 'CAF'),
  ('AUT', 'Austria',   'AT', 'J', 'UEFA'),
  ('JOR', 'Jordan',    'JO', 'J', 'AFC'),
  -- GRUPO K
  ('POR', 'Portugal',  'PT', 'K', 'UEFA'),
  ('COD', 'DR Congo',  'CD', 'K', 'CAF'),
  ('UZB', 'Uzbekistan','UZ', 'K', 'AFC'),
  ('COL', 'Colombia',  'CO', 'K', 'CONMEBOL'),
  -- GRUPO L
  ('ENG', 'England',  'EN', 'L', 'UEFA'),
  ('CRO', 'Croatia',  'HR', 'L', 'UEFA'),
  ('GHA', 'Ghana',    'GH', 'L', 'CAF'),
  ('PAN', 'Panama',   'PA', 'L', 'CONCACAF')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PARTIDOS FASE DE GRUPOS (72)
-- Horarios: aproximados en UTC (base 18:00 UTC).
-- Los dos partidos de la última jornada de cada grupo
-- tienen el mismo horario (regla FIFA: simultáneos).
-- ============================================================
INSERT INTO public.matches
  (home_team_id, away_team_id, stage, group_letter, match_number, scheduled_at, venue, city)
VALUES

  -- ===================== GRUPO A =====================
  -- Jornada 1
  ('MEX', 'RSA', 'group', 'A',  1, '2026-06-11 21:00:00+00', 'Estadio Azteca',  'Mexico City'),
  ('KOR', 'CZE', 'group', 'A',  2, '2026-06-12 00:00:00+00', 'Estadio Akron',   'Guadalajara'),
  -- Jornada 2
  ('CZE', 'RSA', 'group', 'A',  3, '2026-06-18 18:00:00+00', 'Mercedes-Benz Stadium', 'Atlanta'),
  ('MEX', 'KOR', 'group', 'A',  4, '2026-06-18 21:00:00+00', 'Estadio Akron',         'Guadalajara'),
  -- Jornada 3 (simultáneos)
  ('CZE', 'MEX', 'group', 'A',  5, '2026-06-24 18:00:00+00', 'Estadio Azteca', 'Mexico City'),
  ('RSA', 'KOR', 'group', 'A',  6, '2026-06-24 18:00:00+00', 'Estadio BBVA',   'Monterrey'),

  -- ===================== GRUPO B =====================
  -- Jornada 1
  ('CAN', 'BIH', 'group', 'B',  7, '2026-06-12 18:00:00+00', 'BMO Field',      'Toronto'),
  ('QAT', 'SUI', 'group', 'B',  8, '2026-06-12 21:00:00+00', 'Levi''s Stadium','Santa Clara'),
  -- Jornada 2
  ('SUI', 'BIH', 'group', 'B',  9, '2026-06-18 22:00:00+00', 'SoFi Stadium',  'Inglewood'),
  ('CAN', 'QAT', 'group', 'B', 10, '2026-06-19 01:00:00+00', 'BC Place',       'Vancouver'),
  -- Jornada 3 (simultáneos)
  ('SUI', 'CAN', 'group', 'B', 11, '2026-06-24 21:00:00+00', 'BC Place',    'Vancouver'),
  ('BIH', 'QAT', 'group', 'B', 12, '2026-06-24 21:00:00+00', 'Lumen Field', 'Seattle'),

  -- ===================== GRUPO C =====================
  -- Jornada 1
  ('BRA', 'MAR', 'group', 'C', 13, '2026-06-13 18:00:00+00', 'Gillette Stadium',      'Foxborough'),
  ('HAI', 'SCO', 'group', 'C', 14, '2026-06-13 21:00:00+00', 'MetLife Stadium',       'East Rutherford'),
  -- Jornada 2
  ('BRA', 'HAI', 'group', 'C', 15, '2026-06-19 18:00:00+00', 'Lincoln Financial Field', 'Philadelphia'),
  ('SCO', 'MAR', 'group', 'C', 16, '2026-06-19 21:00:00+00', 'Gillette Stadium',        'Foxborough'),
  -- Jornada 3 (simultáneos)
  ('SCO', 'BRA', 'group', 'C', 17, '2026-06-24 00:00:00+00', 'Hard Rock Stadium',      'Miami Gardens'),
  ('MAR', 'HAI', 'group', 'C', 18, '2026-06-24 00:00:00+00', 'Mercedes-Benz Stadium',  'Atlanta'),

  -- ===================== GRUPO D =====================
  -- Jornada 1
  ('USA', 'PAR', 'group', 'D', 19, '2026-06-12 22:00:00+00', 'SoFi Stadium',  'Inglewood'),
  ('AUS', 'TUR', 'group', 'D', 20, '2026-06-13 01:00:00+00', 'BC Place',       'Vancouver'),
  -- Jornada 2
  ('TUR', 'PAR', 'group', 'D', 21, '2026-06-19 22:00:00+00', 'Levi''s Stadium', 'Santa Clara'),
  ('USA', 'AUS', 'group', 'D', 22, '2026-06-20 01:00:00+00', 'Lumen Field',     'Seattle'),
  -- Jornada 3 (simultáneos)
  ('TUR', 'USA', 'group', 'D', 23, '2026-06-25 18:00:00+00', 'SoFi Stadium',    'Inglewood'),
  ('PAR', 'AUS', 'group', 'D', 24, '2026-06-25 18:00:00+00', 'Levi''s Stadium', 'Santa Clara'),

  -- ===================== GRUPO E =====================
  -- Jornada 1
  ('GER', 'CUW', 'group', 'E', 25, '2026-06-14 18:00:00+00', 'Lincoln Financial Field', 'Philadelphia'),
  ('CIV', 'ECU', 'group', 'E', 26, '2026-06-14 21:00:00+00', 'NRG Stadium',             'Houston'),
  -- Jornada 2
  ('GER', 'CIV', 'group', 'E', 27, '2026-06-20 18:00:00+00', 'BMO Field',          'Toronto'),
  ('ECU', 'CUW', 'group', 'E', 28, '2026-06-20 21:00:00+00', 'Arrowhead Stadium',  'Kansas City'),
  -- Jornada 3 (simultáneos)
  ('ECU', 'GER', 'group', 'E', 29, '2026-06-25 21:00:00+00', 'Lincoln Financial Field', 'Philadelphia'),
  ('CUW', 'CIV', 'group', 'E', 30, '2026-06-25 21:00:00+00', 'MetLife Stadium',         'East Rutherford'),

  -- ===================== GRUPO F =====================
  -- Jornada 1
  ('NED', 'JPN', 'group', 'F', 31, '2026-06-14 22:00:00+00', 'AT&T Stadium',  'Arlington'),
  ('SWE', 'TUN', 'group', 'F', 32, '2026-06-15 01:00:00+00', 'Estadio BBVA',  'Monterrey'),
  -- Jornada 2
  ('NED', 'SWE', 'group', 'F', 33, '2026-06-20 22:00:00+00', 'NRG Stadium',   'Houston'),
  ('TUN', 'JPN', 'group', 'F', 34, '2026-06-21 01:00:00+00', 'Estadio BBVA',  'Monterrey'),
  -- Jornada 3 (simultáneos)
  ('TUN', 'NED', 'group', 'F', 35, '2026-06-25 00:00:00+00', 'AT&T Stadium',       'Arlington'),
  ('JPN', 'SWE', 'group', 'F', 36, '2026-06-25 00:00:00+00', 'Arrowhead Stadium',  'Kansas City'),

  -- ===================== GRUPO G =====================
  -- Jornada 1
  ('BEL', 'EGY', 'group', 'G', 37, '2026-06-15 18:00:00+00', 'SoFi Stadium',  'Inglewood'),
  ('IRN', 'NZL', 'group', 'G', 38, '2026-06-15 21:00:00+00', 'Lumen Field',   'Seattle'),
  -- Jornada 2
  ('BEL', 'IRN', 'group', 'G', 39, '2026-06-21 18:00:00+00', 'SoFi Stadium', 'Inglewood'),
  ('NZL', 'EGY', 'group', 'G', 40, '2026-06-21 21:00:00+00', 'BC Place',     'Vancouver'),
  -- Jornada 3 (simultáneos)
  ('NZL', 'BEL', 'group', 'G', 41, '2026-06-26 18:00:00+00', 'Lumen Field', 'Seattle'),
  ('EGY', 'IRN', 'group', 'G', 42, '2026-06-26 18:00:00+00', 'BC Place',    'Vancouver'),

  -- ===================== GRUPO H =====================
  -- Jornada 1
  ('ESP', 'CPV', 'group', 'H', 43, '2026-06-15 22:00:00+00', 'Hard Rock Stadium',     'Miami Gardens'),
  ('KSA', 'URU', 'group', 'H', 44, '2026-06-16 01:00:00+00', 'Mercedes-Benz Stadium', 'Atlanta'),
  -- Jornada 2
  ('ESP', 'KSA', 'group', 'H', 45, '2026-06-21 22:00:00+00', 'Hard Rock Stadium',     'Miami Gardens'),
  ('URU', 'CPV', 'group', 'H', 46, '2026-06-22 01:00:00+00', 'Mercedes-Benz Stadium', 'Atlanta'),
  -- Jornada 3 (simultáneos)
  ('URU', 'ESP', 'group', 'H', 47, '2026-06-26 21:00:00+00', 'NRG Stadium',     'Houston'),
  ('CPV', 'KSA', 'group', 'H', 48, '2026-06-26 21:00:00+00', 'Estadio Akron',   'Guadalajara'),

  -- ===================== GRUPO I =====================
  -- Jornada 1
  ('FRA', 'SEN', 'group', 'I', 49, '2026-06-16 18:00:00+00', 'MetLife Stadium',         'East Rutherford'),
  ('IRQ', 'NOR', 'group', 'I', 50, '2026-06-16 21:00:00+00', 'Gillette Stadium',        'Foxborough'),
  -- Jornada 2
  ('FRA', 'IRQ', 'group', 'I', 51, '2026-06-22 18:00:00+00', 'MetLife Stadium',           'East Rutherford'),
  ('NOR', 'SEN', 'group', 'I', 52, '2026-06-22 21:00:00+00', 'Lincoln Financial Field',   'Philadelphia'),
  -- Jornada 3 (simultáneos)
  ('NOR', 'FRA', 'group', 'I', 53, '2026-06-26 00:00:00+00', 'Gillette Stadium', 'Foxborough'),
  ('SEN', 'IRQ', 'group', 'I', 54, '2026-06-26 00:00:00+00', 'BMO Field',        'Toronto'),

  -- ===================== GRUPO J =====================
  -- Jornada 1
  ('ARG', 'ALG', 'group', 'J', 55, '2026-06-16 22:00:00+00', 'Arrowhead Stadium', 'Kansas City'),
  ('AUT', 'JOR', 'group', 'J', 56, '2026-06-17 01:00:00+00', 'Levi''s Stadium',   'Santa Clara'),
  -- Jornada 2
  ('ARG', 'AUT', 'group', 'J', 57, '2026-06-22 22:00:00+00', 'AT&T Stadium',    'Arlington'),
  ('JOR', 'ALG', 'group', 'J', 58, '2026-06-23 01:00:00+00', 'Levi''s Stadium', 'Santa Clara'),
  -- Jornada 3 (simultáneos)
  ('JOR', 'ARG', 'group', 'J', 59, '2026-06-27 18:00:00+00', 'Arrowhead Stadium', 'Kansas City'),
  ('ALG', 'AUT', 'group', 'J', 60, '2026-06-27 18:00:00+00', 'AT&T Stadium',      'Arlington'),

  -- ===================== GRUPO K =====================
  -- Jornada 1
  ('POR', 'COD', 'group', 'K', 61, '2026-06-17 18:00:00+00', 'NRG Stadium',     'Houston'),
  ('UZB', 'COL', 'group', 'K', 62, '2026-06-17 21:00:00+00', 'Estadio Azteca',  'Mexico City'),
  -- Jornada 2
  ('POR', 'UZB', 'group', 'K', 63, '2026-06-23 18:00:00+00', 'NRG Stadium',     'Houston'),
  ('COL', 'COD', 'group', 'K', 64, '2026-06-23 21:00:00+00', 'Estadio Akron',   'Guadalajara'),
  -- Jornada 3 (simultáneos)
  ('COL', 'POR', 'group', 'K', 65, '2026-06-27 21:00:00+00', 'Hard Rock Stadium',     'Miami Gardens'),
  ('COD', 'UZB', 'group', 'K', 66, '2026-06-27 21:00:00+00', 'Mercedes-Benz Stadium', 'Atlanta'),

  -- ===================== GRUPO L =====================
  -- Jornada 1
  ('ENG', 'CRO', 'group', 'L', 67, '2026-06-17 22:00:00+00', 'BMO Field',      'Toronto'),
  ('GHA', 'PAN', 'group', 'L', 68, '2026-06-18 01:00:00+00', 'AT&T Stadium',   'Arlington'),
  -- Jornada 2
  ('ENG', 'GHA', 'group', 'L', 69, '2026-06-23 22:00:00+00', 'Gillette Stadium', 'Foxborough'),
  ('PAN', 'CRO', 'group', 'L', 70, '2026-06-24 01:00:00+00', 'BMO Field',        'Toronto'),
  -- Jornada 3 (simultáneos)
  ('PAN', 'ENG', 'group', 'L', 71, '2026-06-27 00:00:00+00', 'MetLife Stadium',          'East Rutherford'),
  ('CRO', 'GHA', 'group', 'L', 72, '2026-06-27 00:00:00+00', 'Lincoln Financial Field',  'Philadelphia')

ON CONFLICT DO NOTHING;
