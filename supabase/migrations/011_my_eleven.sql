-- ============================================================
-- 011_my_eleven.sql
-- Mi XI del Mundial — tabla de jugadores del mundo + XI por usuario
-- ============================================================

-- ── world_squad ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.world_squad (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT    NOT NULL,
  short_name   TEXT    NOT NULL,
  position     TEXT    NOT NULL CHECK (position IN ('GK','DEF','MID','FWD')),
  team_id      TEXT    NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  country_code TEXT    NOT NULL,   -- código ISO-2 para flagcdn.com
  dorsal       INTEGER,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS world_squad_position_idx ON public.world_squad (position);
CREATE INDEX IF NOT EXISTS world_squad_team_idx     ON public.world_squad (team_id);

ALTER TABLE public.world_squad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "world_squad_public_read" ON public.world_squad
  FOR SELECT TO authenticated USING (is_active = true);

-- ── my_eleven ─────────────────────────────────────────────────
-- Un registro por usuario (upsert).
-- slots: JSONB { "GK_0": uuid, "DEF_1": uuid, ... }
CREATE TABLE IF NOT EXISTS public.my_eleven (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  formation    TEXT        NOT NULL DEFAULT '4-3-3',
  slots        JSONB       NOT NULL DEFAULT '{}',
  note         TEXT,
  is_published BOOLEAN     NOT NULL DEFAULT false,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.my_eleven ENABLE ROW LEVEL SECURITY;

CREATE POLICY "my_eleven_select" ON public.my_eleven
  FOR SELECT TO authenticated
  USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "my_eleven_insert" ON public.my_eleven
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "my_eleven_update" ON public.my_eleven
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_my_eleven_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_my_eleven_updated_at
  BEFORE UPDATE ON public.my_eleven
  FOR EACH ROW EXECUTE FUNCTION update_my_eleven_updated_at();

-- ══════════════════════════════════════════════════════════════
-- SEED — Jugadores del Mundial 2026
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.world_squad (name, short_name, position, team_id, country_code, dorsal) VALUES

-- ══════════════════ FRANCE (FRA) ══════════════════
('Mike Maignan',         'Maignan',       'GK',  'FRA', 'FR', 16),
('William Saliba',       'Saliba',        'DEF', 'FRA', 'FR', 17),
('Dayot Upamecano',      'Upamecano',     'DEF', 'FRA', 'FR',  5),
('Jules Koundé',         'Koundé',        'DEF', 'FRA', 'FR', 21),
('Théo Hernández',       'T. Hernández',  'DEF', 'FRA', 'FR', 22),
('Aurélien Tchouaméni',  'Tchouaméni',    'MID', 'FRA', 'FR',  8),
('Eduardo Camavinga',    'Camavinga',     'MID', 'FRA', 'FR', 14),
('Warren Zaïre-Emery',   'Zaïre-Emery',   'MID', 'FRA', 'FR', 20),
('Ousmane Dembélé',      'Dembélé',       'FWD', 'FRA', 'FR', 11),
('Antoine Griezmann',    'Griezmann',     'FWD', 'FRA', 'FR',  7),
('Kylian Mbappé',        'Mbappé',        'FWD', 'FRA', 'FR', 10),
('Bradley Barcola',      'Barcola',       'FWD', 'FRA', 'FR', 19),

-- ══════════════════ BRAZIL (BRA) ══════════════════
('Alisson',              'Alisson',       'GK',  'BRA', 'BR',  1),
('Éder Militão',         'Militão',       'DEF', 'BRA', 'BR',  3),
('Marquinhos',           'Marquinhos',    'DEF', 'BRA', 'BR',  4),
('Vanderson',            'Vanderson',     'DEF', 'BRA', 'BR',  2),
('Guilherme Arana',      'Arana',         'DEF', 'BRA', 'BR',  6),
('Casemiro',             'Casemiro',      'MID', 'BRA', 'BR',  5),
('Bruno Guimarães',      'B. Guimarães',  'MID', 'BRA', 'BR', 17),
('Raphinha',             'Raphinha',      'FWD', 'BRA', 'BR', 11),
('Rodrygo',              'Rodrygo',       'FWD', 'BRA', 'BR',  9),
('Savinho',              'Savinho',       'FWD', 'BRA', 'BR', 20),
('Vinicius Jr',          'Vinícius Jr',   'FWD', 'BRA', 'BR', 10),
('Endrick',              'Endrick',       'FWD', 'BRA', 'BR', 19),

-- ══════════════════ ARGENTINA (ARG) ══════════════════
('Emiliano Martínez',    'E. Martínez',   'GK',  'ARG', 'AR', 23),
('Nahuel Molina',        'Molina',        'DEF', 'ARG', 'AR', 26),
('Cristian Romero',      'Romero',        'DEF', 'ARG', 'AR', 13),
('Nicolás Otamendi',     'Otamendi',      'DEF', 'ARG', 'AR', 19),
('Marcos Acuña',         'Acuña',         'DEF', 'ARG', 'AR',  8),
('Alexis Mac Allister',  'Mac Allister',  'MID', 'ARG', 'AR', 10),
('Rodrigo De Paul',      'De Paul',       'MID', 'ARG', 'AR', 11),
('Enzo Fernández',       'E. Fernández',  'MID', 'ARG', 'AR',  5),
('Lionel Messi',         'Messi',         'FWD', 'ARG', 'AR', 10),
('Julián Álvarez',       'J. Álvarez',    'FWD', 'ARG', 'AR',  9),
('Lautaro Martínez',     'L. Martínez',   'FWD', 'ARG', 'AR', 22),

-- ══════════════════ ENGLAND (ENG) ══════════════════
('Jordan Pickford',      'Pickford',      'GK',  'ENG', 'EN',  1),
('Trent Alexander-Arnold','Alexander-Arnold','DEF','ENG','EN',66),
('Marc Guéhi',           'Guéhi',         'DEF', 'ENG', 'EN',  6),
('John Stones',          'Stones',        'DEF', 'ENG', 'EN',  5),
('Kieran Trippier',      'Trippier',      'DEF', 'ENG', 'EN', 12),
('Jude Bellingham',      'Bellingham',    'MID', 'ENG', 'EN', 22),
('Cole Palmer',          'Palmer',        'MID', 'ENG', 'EN', 20),
('Declan Rice',          'Rice',          'MID', 'ENG', 'EN', 41),
('Phil Foden',           'Foden',         'FWD', 'ENG', 'EN', 47),
('Harry Kane',           'Kane',          'FWD', 'ENG', 'EN',  9),
('Bukayo Saka',          'Saka',          'FWD', 'ENG', 'EN', 17),
('Morgan Rogers',        'M. Rogers',     'FWD', 'ENG', 'EN', 20),

-- ══════════════════ GERMANY (GER) ══════════════════
('Marc-André ter Stegen','ter Stegen',    'GK',  'GER', 'DE',  1),
('Antonio Rüdiger',      'Rüdiger',       'DEF', 'GER', 'DE',  2),
('Nico Schlotterbeck',   'Schlotterbeck', 'DEF', 'GER', 'DE',  3),
('Joshua Kimmich',       'Kimmich',       'MID', 'GER', 'DE',  6),
('Jamal Musiala',        'Musiala',       'MID', 'GER', 'DE', 14),
('Florian Wirtz',        'Wirtz',         'MID', 'GER', 'DE', 10),
('Leroy Sané',           'Sané',          'FWD', 'GER', 'DE', 19),
('Kai Havertz',          'Havertz',       'FWD', 'GER', 'DE', 29),
('Niclas Füllkrug',      'Füllkrug',      'FWD', 'GER', 'DE', 13),

-- ══════════════════ SPAIN (ESP) ══════════════════
('Unai Simón',           'U. Simón',      'GK',  'ESP', 'ES',  1),
('Dani Carvajal',        'Carvajal',      'DEF', 'ESP', 'ES',  2),
('Aymeric Laporte',      'Laporte',       'DEF', 'ESP', 'ES', 14),
('Robin Le Normand',     'Le Normand',    'DEF', 'ESP', 'ES', 24),
('Marc Cucurella',       'Cucurella',     'DEF', 'ESP', 'ES', 24),
('Fabián Ruiz',          'Fabián',        'MID', 'ESP', 'ES',  7),
('Pedri',                'Pedri',         'MID', 'ESP', 'ES',  8),
('Martín Zubimendi',     'Zubimendi',     'MID', 'ESP', 'ES', 20),
('Álvaro Morata',        'Morata',        'FWD', 'ESP', 'ES',  7),
('Nico Williams',        'Nico',          'FWD', 'ESP', 'ES', 11),
('Lamine Yamal',         'Yamal',         'FWD', 'ESP', 'ES', 19),
('Mikel Oyarzabal',      'Oyarzabal',     'FWD', 'ESP', 'ES', 22),

-- ══════════════════ PORTUGAL (POR) ══════════════════
('Diogo Costa',          'D. Costa',      'GK',  'POR', 'PT', 99),
('João Cancelo',         'Cancelo',       'DEF', 'POR', 'PT', 20),
('Rúben Dias',           'R. Dias',       'DEF', 'POR', 'PT',  4),
('Gonçalo Inácio',       'G. Inácio',     'DEF', 'POR', 'PT',  3),
('Nuno Mendes',          'N. Mendes',     'DEF', 'POR', 'PT', 22),
('Bernardo Silva',       'B. Silva',      'MID', 'POR', 'PT', 10),
('Bruno Fernandes',      'B. Fernandes',  'MID', 'POR', 'PT',  8),
('Vitinha',              'Vitinha',       'MID', 'POR', 'PT', 16),
('Cristiano Ronaldo',    'Ronaldo',       'FWD', 'POR', 'PT',  7),
('João Félix',           'J. Félix',      'FWD', 'POR', 'PT', 11),
('Rafael Leão',          'R. Leão',       'FWD', 'POR', 'PT', 17),

-- ══════════════════ NETHERLANDS (NED) ══════════════════
('Bart Verbruggen',      'Verbruggen',    'GK',  'NED', 'NL', 23),
('Virgil van Dijk',      'Van Dijk',      'DEF', 'NED', 'NL',  4),
('Matthijs de Ligt',     'De Ligt',       'DEF', 'NED', 'NL',  3),
('Denzel Dumfries',      'Dumfries',      'DEF', 'NED', 'NL', 22),
('Ryan Gravenberch',     'Gravenberch',   'MID', 'NED', 'NL', 18),
('Tijjani Reijnders',    'Reijnders',     'MID', 'NED', 'NL', 14),
('Xavi Simons',          'X. Simons',     'MID', 'NED', 'NL', 10),
('Cody Gakpo',           'Gakpo',         'FWD', 'NED', 'NL', 11),
('Memphis Depay',        'Depay',         'FWD', 'NED', 'NL', 10),
('Joshua Zirkzee',       'Zirkzee',       'FWD', 'NED', 'NL',  9),

-- ══════════════════ BELGIUM (BEL) ══════════════════
('Thibaut Courtois',     'Courtois',      'GK',  'BEL', 'BE',  1),
('Wout Faes',            'Faes',          'DEF', 'BEL', 'BE', 16),
('Arthur Theate',        'Theate',        'DEF', 'BEL', 'BE',  5),
('Kevin De Bruyne',      'De Bruyne',     'MID', 'BEL', 'BE', 17),
('Youri Tielemans',      'Tielemans',     'MID', 'BEL', 'BE', 11),
('Jeremy Doku',          'Doku',          'FWD', 'BEL', 'BE', 10),
('Lois Openda',          'Openda',        'FWD', 'BEL', 'BE', 15),
('Leandro Trossard',     'Trossard',      'FWD', 'BEL', 'BE',  9),

-- ══════════════════ MOROCCO (MAR) ══════════════════
('Yassine Bounou',       'Bono',          'GK',  'MAR', 'MA', 25),
('Achraf Hakimi',        'Hakimi',        'DEF', 'MAR', 'MA',  2),
('Nayef Aguerd',         'Aguerd',        'DEF', 'MAR', 'MA', 17),
('Romain Saïss',         'Saïss',         'DEF', 'MAR', 'MA',  5),
('Sofyan Amrabat',       'Amrabat',       'MID', 'MAR', 'MA',  4),
('Azzedine Ounahi',      'Ounahi',        'MID', 'MAR', 'MA', 11),
('Hakim Ziyech',         'Ziyech',        'FWD', 'MAR', 'MA', 22),
('Youssef En-Nesyri',    'En-Nesyri',     'FWD', 'MAR', 'MA', 19),

-- ══════════════════ NORWAY (NOR) ══════════════════
('Ørjan Nyland',         'Nyland',        'GK',  'NOR', 'NO', 12),
('Leo Ostigård',         'Ostigård',      'DEF', 'NOR', 'NO',  5),
('Birger Meling',        'Meling',        'DEF', 'NOR', 'NO',  3),
('Martin Ødegaard',      'Ødegaard',      'MID', 'NOR', 'NO', 10),
('Sander Berge',         'Berge',         'MID', 'NOR', 'NO', 23),
('Erling Haaland',       'Haaland',       'FWD', 'NOR', 'NO',  9),
('Alexander Sørloth',    'Sørloth',       'FWD', 'NOR', 'NO', 20),

-- ══════════════════ CROATIA (CRO) ══════════════════
('Dominik Livaković',    'Livaković',     'GK',  'CRO', 'HR', 23),
('Joško Gvardiol',       'Gvardiol',      'DEF', 'CRO', 'HR', 24),
('Josip Stanišić',       'Stanišić',      'DEF', 'CRO', 'HR',  5),
('Mateo Kovačić',        'Kovačić',       'MID', 'CRO', 'HR',  8),
('Lovro Majer',          'Majer',         'MID', 'CRO', 'HR', 10),
('Ante Budimir',         'Budimir',       'FWD', 'CRO', 'HR', 19),
('Bruno Petković',       'Petković',      'FWD', 'CRO', 'HR', 16),

-- ══════════════════ COLOMBIA (COL) ══════════════════
('Camilo Vargas',        'C. Vargas',     'GK',  'COL', 'CO', 12),
('Dávinson Sánchez',     'D. Sánchez',    'DEF', 'COL', 'CO',  3),
('Yerry Mina',           'Y. Mina',       'DEF', 'COL', 'CO', 13),
('Richard Ríos',         'R. Ríos',       'MID', 'COL', 'CO', 16),
('James Rodríguez',      'James',         'MID', 'COL', 'CO', 10),
('Luis Díaz',            'L. Díaz',       'FWD', 'COL', 'CO', 19),
('Jhon Córdoba',         'J. Córdoba',    'FWD', 'COL', 'CO',  9),

-- ══════════════════ URUGUAY (URU) ══════════════════
('Sergio Rochet',        'Rochet',        'GK',  'URU', 'UY',  1),
('José María Giménez',   'J. Giménez',    'DEF', 'URU', 'UY',  2),
('Ronald Araújo',        'R. Araújo',     'DEF', 'URU', 'UY',  4),
('Rodrigo Bentancur',    'Bentancur',     'MID', 'URU', 'UY', 25),
('Manuel Ugarte',        'Ugarte',        'MID', 'URU', 'UY', 17),
('Federico Valverde',    'Valverde',      'MID', 'URU', 'UY', 14),
('Darwin Núñez',         'D. Núñez',      'FWD', 'URU', 'UY',  9),
('Facundo Pellistri',    'Pellistri',     'FWD', 'URU', 'UY', 11),

-- ══════════════════ USA (USA) ══════════════════
('Matt Turner',          'Turner',        'GK',  'USA', 'US',  1),
('Sergino Dest',         'Dest',          'DEF', 'USA', 'US',  2),
('Miles Robinson',       'M. Robinson',   'DEF', 'USA', 'US',  4),
('Tyler Adams',          'T. Adams',      'MID', 'USA', 'US',  4),
('Weston McKennie',      'McKennie',      'MID', 'USA', 'US',  8),
('Christian Pulisic',    'Pulisic',       'FWD', 'USA', 'US', 10),
('Giovanni Reyna',       'G. Reyna',      'FWD', 'USA', 'US',  7),
('Folarin Balogun',      'Balogun',       'FWD', 'USA', 'US',  9),

-- ══════════════════ MEXICO (MEX) ══════════════════
('Luis Malagón',         'Malagón',       'GK',  'MEX', 'MX',  1),
('Jorge Sánchez',        'J. Sánchez',    'DEF', 'MEX', 'MX',  3),
('Johan Vásquez',        'J. Vásquez',    'DEF', 'MEX', 'MX',  4),
('Edson Álvarez',        'E. Álvarez',    'MID', 'MEX', 'MX',  6),
('Alexis Vega',          'A. Vega',       'MID', 'MEX', 'MX', 23),
('Santiago Giménez',     'S. Giménez',    'FWD', 'MEX', 'MX', 11),
('Raúl Jiménez',         'R. Jiménez',    'FWD', 'MEX', 'MX',  9),
('Hirving Lozano',       'Lozano',        'FWD', 'MEX', 'MX', 22),

-- ══════════════════ JAPAN (JPN) ══════════════════
('Zion Suzuki',          'Z. Suzuki',     'GK',  'JPN', 'JP', 23),
('Takehiro Tomiyasu',    'Tomiyasu',      'DEF', 'JPN', 'JP',  5),
('Ko Itakura',           'Itakura',       'DEF', 'JPN', 'JP',  3),
('Wataru Endo',          'Endo',          'MID', 'JPN', 'JP', 17),
('Daichi Kamada',        'Kamada',        'MID', 'JPN', 'JP', 10),
('Kaoru Mitoma',         'Mitoma',        'FWD', 'JPN', 'JP', 11),
('Takefusa Kubo',        'Kubo',          'FWD', 'JPN', 'JP', 14),
('Ayase Ueda',           'Ueda',          'FWD', 'JPN', 'JP',  9),

-- ══════════════════ SOUTH KOREA (KOR) ══════════════════
('Kim Seung-gyu',        'S.G. Kim',      'GK',  'KOR', 'KR', 21),
('Kim Min-jae',          'Min-jae Kim',   'DEF', 'KOR', 'KR',  3),
('Lee Jae-sung',         'Lee Jae-sung',  'MID', 'KOR', 'KR', 14),
('Lee Kang-in',          'Lee Kang-in',   'MID', 'KOR', 'KR', 19),
('Son Heung-min',        'Son',           'FWD', 'KOR', 'KR',  7),
('Hwang Hee-chan',       'Hwang',         'FWD', 'KOR', 'KR', 11),

-- ══════════════════ SENEGAL (SEN) ══════════════════
('Edouard Mendy',        'E. Mendy',      'GK',  'SEN', 'SN', 16),
('Kalidou Koulibaly',    'Koulibaly',     'DEF', 'SEN', 'SN',  3),
('Ismail Jakobs',        'Jakobs',        'DEF', 'SEN', 'SN', 18),
('Pape Matar Sarr',      'P.M. Sarr',     'MID', 'SEN', 'SN', 23),
('Idrissa Gueye',        'I. Gueye',      'MID', 'SEN', 'SN', 15),
('Sadio Mané',           'Mané',          'FWD', 'SEN', 'SN', 10),
('Ismaila Sarr',         'I. Sarr',       'FWD', 'SEN', 'SN', 23),

-- ══════════════════ CANADA (CAN) ══════════════════
('Maxime Crépeau',       'Crépeau',       'GK',  'CAN', 'CA', 16),
('Alistair Johnston',    'Johnston',      'DEF', 'CAN', 'CA',  2),
('Steven Vitória',       'Vitória',       'DEF', 'CAN', 'CA', 13),
('Ismaël Koné',          'Koné',          'MID', 'CAN', 'CA', 17),
('Jonathan Osorio',      'Osorio',        'MID', 'CAN', 'CA', 21),
('Jonathan David',       'J. David',      'FWD', 'CAN', 'CA', 20),
('Cyle Larin',           'Larin',         'FWD', 'CAN', 'CA',  9),

-- ══════════════════ AUSTRALIA (AUS) ══════════════════
('Mathew Ryan',          'M. Ryan',       'GK',  'AUS', 'AU',  1),
('Harry Souttar',        'Souttar',       'DEF', 'AUS', 'AU',  5),
('Aaron Mooy',           'Mooy',          'MID', 'AUS', 'AU', 13),
('Jackson Irvine',       'Irvine',        'MID', 'AUS', 'AU', 15),
('Mathew Leckie',        'Leckie',        'FWD', 'AUS', 'AU',  7),
('Mitchell Duke',        'Duke',          'FWD', 'AUS', 'AU', 20),

-- ══════════════════ SWEDEN (SWE) ══════════════════
('Robin Olsen',          'R. Olsen',      'GK',  'SWE', 'SE',  1),
('Victor Nilsson Lindelöf','Lindelöf',    'DEF', 'SWE', 'SE',  2),
('Ludwig Augustinsson',  'Augustinsson',  'DEF', 'SWE', 'SE',  3),
('Dejan Kulusevski',     'Kulusevski',    'MID', 'SWE', 'SE', 10),
('Emil Forsberg',        'Forsberg',      'MID', 'SWE', 'SE', 10),
('Alexander Isak',       'A. Isak',       'FWD', 'SWE', 'SE', 14),
('Viktor Gyökeres',      'Gyökeres',      'FWD', 'SWE', 'SE', 11),

-- ══════════════════ SWITZERLAND (SUI) ══════════════════
('Yann Sommer',          'Sommer',        'GK',  'SUI', 'CH',  1),
('Manuel Akanji',        'Akanji',        'DEF', 'SUI', 'CH',  5),
('Fabian Schär',         'Schär',         'DEF', 'SUI', 'CH', 20),
('Remo Freuler',         'Freuler',       'MID', 'SUI', 'CH', 13),
('Granit Xhaka',         'Xhaka',         'MID', 'SUI', 'CH', 10),
('Breel Embolo',         'Embolo',        'FWD', 'SUI', 'CH', 10),
('Noah Okafor',          'Okafor',        'FWD', 'SUI', 'CH', 11)

ON CONFLICT DO NOTHING;
