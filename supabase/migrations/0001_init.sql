-- EcoRescate initial schema.
-- All access goes through the Next.js server with the service-role key. Row Level Security is
-- enabled with no policies, and function execution is revoked from anon/authenticated, so the
-- public Supabase API exposes nothing even if the anon key leaks.

create table if not exists establishments (
  id text primary key,
  slug text not null unique,
  name text not null,
  type text not null check (type in ('Restaurante', 'Supermercado')),
  zone text not null,
  address text not null,
  description text not null,
  opening_hours text not null,
  initials text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists lots (
  id text primary key default ('lot-' || gen_random_uuid()),
  establishment_id text not null references establishments (id),
  name text not null check (char_length(name) between 3 and 100),
  description text not null check (char_length(description) between 10 and 1200),
  category text not null check (category in ('Cocina del día', 'Panadería', 'Frutas y verduras', 'Lácteos', 'Despensa')),
  unit text not null check (unit in ('porciones', 'unidades', 'kg')),
  initial_quantity numeric(12, 3) not null check (initial_quantity > 0),
  available_quantity numeric(12, 3) not null check (available_quantity >= 0 and available_quantity <= initial_quantity),
  entry_at timestamptz not null,
  date_type text not null check (date_type in ('Límite de oferta', 'Consumo preferente', 'Vencimiento')),
  food_date date not null,
  commercialization_ends_at timestamptz not null,
  pickup_starts_at timestamptz not null,
  pickup_ends_at timestamptz not null,
  alert_minutes integer not null check (alert_minutes > 0 and alert_minutes <= 43200),
  suitability_declared boolean not null check (suitability_declared),
  check (unit = 'kg' or (initial_quantity = trunc(initial_quantity) and available_quantity = trunc(available_quantity))),
  check (pickup_starts_at < pickup_ends_at and pickup_ends_at <= commercialization_ends_at)
);
create index if not exists lots_establishment_idx on lots (establishment_id);

create table if not exists offers (
  id text primary key default ('offer-' || gen_random_uuid()),
  lot_id text not null unique references lots (id),
  regular_price numeric(10, 2) not null check (regular_price > 0),
  price numeric(10, 2) not null check (price > 0 and price < regular_price),
  image text not null check (image like '/images/%'),
  published_at timestamptz not null default now(),
  paused boolean not null default false
);

create table if not exists reservations (
  id text primary key default ('res-' || gen_random_uuid()),
  code text not null unique,
  offer_id text not null references offers (id),
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price > 0),
  customer_name text check (customer_name is null or char_length(customer_name) between 2 and 80),
  customer_token text,
  status text not null check (status in ('Reservada', 'Retirada', 'Cancelada', 'No retirada')),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  check ((status = 'Reservada') = (closed_at is null))
);
create index if not exists reservations_offer_idx on reservations (offer_id);
create index if not exists reservations_token_idx on reservations (customer_token);
create index if not exists reservations_pending_idx on reservations (status) where status = 'Reservada';

create table if not exists movements (
  id text primary key default ('mov-' || gen_random_uuid()),
  lot_id text not null references lots (id),
  reservation_id text references reservations (id),
  type text not null check (type in ('Publicación', 'Reserva', 'Retiro', 'Cancelación', 'Plazo finalizado', 'Cambio de precio')),
  quantity numeric(12, 3) not null check (quantity >= 0),
  detail text not null,
  created_at timestamptz not null default now()
);
create index if not exists movements_lot_idx on movements (lot_id);
create index if not exists movements_created_idx on movements (created_at desc);

create table if not exists business_applications (
  id text primary key default ('app-' || gen_random_uuid()),
  business_name text not null check (char_length(business_name) between 2 and 120),
  business_type text not null check (business_type in ('Restaurante', 'Supermercado', 'Otro')),
  zone text not null check (char_length(zone) between 2 and 80),
  contact_name text not null check (char_length(contact_name) between 2 and 80),
  phone text not null check (char_length(phone) between 6 and 30),
  email text check (email is null or char_length(email) <= 160),
  message text check (message is null or char_length(message) <= 1500),
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id text primary key default ('msg-' || gen_random_uuid()),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 160),
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now()
);

alter table establishments enable row level security;
alter table lots enable row level security;
alter table offers enable row level security;
alter table reservations enable row level security;
alter table movements enable row level security;
alter table business_applications enable row level security;
alter table contact_messages enable row level security;

-- Business rules ---------------------------------------------------------------------------

-- Same rule as effectiveEnd() in src/lib/domain.ts: the earliest of the commercial limit,
-- the pickup end and the last millisecond of the declared food date in Cochabamba (UTC-4).
create or replace function lot_effective_end(l lots) returns timestamptz
language sql stable as $$
  select least(
    l.commercialization_ends_at,
    l.pickup_ends_at,
    ((l.food_date + 1)::timestamp at time zone 'America/La_Paz') - interval '1 millisecond'
  );
$$;

create or replace function format_money(value numeric) returns text
language sql immutable as $$ select 'Bs ' || replace(rtrim(to_char(value, 'FM999999990.99'), '.'), '.', ','); $$;

create or replace function new_reservation_code() returns text
language plpgsql volatile as $$
declare candidate text;
begin
  loop
    candidate := 'ECO-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from reservations where code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function expire_reservations() returns integer
language plpgsql as $$
declare r record; affected integer := 0;
begin
  for r in
    select res.id, res.code, res.quantity, l.id as lot_id
    from reservations res
    join offers o on o.id = res.offer_id
    join lots l on l.id = o.lot_id
    where res.status = 'Reservada' and lot_effective_end(l) <= now()
    order by l.id
    for update of res, l
  loop
    update reservations set status = 'No retirada', closed_at = now() where id = r.id;
    update lots set available_quantity = available_quantity + r.quantity where id = r.lot_id;
    insert into movements (lot_id, reservation_id, type, quantity, detail)
    values (r.lot_id, r.id, 'Plazo finalizado', r.quantity, 'La reserva ' || r.code || ' terminó sin retiro. La oferta permanece cerrada.');
    affected := affected + 1;
  end loop;
  return affected;
end;
$$;

create or replace function reserve_offer(p_offer_id text, p_quantity numeric, p_customer_name text, p_customer_token text)
returns reservations
language plpgsql as $$
declare o offers; l lots; amount numeric(12, 3); result reservations;
begin
  select * into o from offers where id = p_offer_id;
  if not found then raise exception 'No encontramos esta oferta. Vuelve al catálogo.'; end if;
  select * into l from lots where id = o.lot_id for update;
  if now() >= lot_effective_end(l) or o.paused or l.available_quantity <= 0 then
    raise exception 'Esta oferta ya no está disponible.';
  end if;
  if p_quantity is null or p_quantity <= 0 then raise exception 'Selecciona una cantidad mayor que cero.'; end if;
  if l.unit <> 'kg' and p_quantity <> trunc(p_quantity) then raise exception 'Selecciona una cantidad entera.'; end if;
  amount := round(p_quantity, 3);
  if amount <= 0 or amount > l.available_quantity then raise exception 'No hay existencias suficientes para esa cantidad.'; end if;

  update lots set available_quantity = available_quantity - amount where id = l.id;
  insert into reservations (code, offer_id, quantity, unit_price, customer_name, customer_token, status)
  values (new_reservation_code(), o.id, amount, o.price, nullif(trim(p_customer_name), ''), p_customer_token, 'Reservada')
  returning * into result;
  insert into movements (lot_id, reservation_id, type, quantity, detail)
  values (l.id, result.id, 'Reserva', amount, 'Reserva ' || result.code || ' registrada.');
  return result;
end;
$$;

create or replace function cancel_reservation(p_reservation_id text, p_customer_token text, p_establishment_id text)
returns reservations
language plpgsql as $$
declare r reservations; l lots; result reservations;
begin
  select * into r from reservations where id = p_reservation_id for update;
  if not found then raise exception 'No encontramos esta reserva.'; end if;
  select l2.* into l from lots l2 join offers o on o.lot_id = l2.id where o.id = r.offer_id for update of l2;
  if not ((p_customer_token is not null and r.customer_token = p_customer_token) or (p_establishment_id is not null and l.establishment_id = p_establishment_id)) then
    raise exception 'No encontramos esta reserva.';
  end if;
  if r.status <> 'Reservada' then raise exception 'Esta reserva ya está cerrada y no puede procesarse de nuevo.'; end if;

  update reservations set status = 'Cancelada', closed_at = now() where id = r.id returning * into result;
  update lots set available_quantity = available_quantity + r.quantity where id = l.id;
  insert into movements (lot_id, reservation_id, type, quantity, detail)
  values (l.id, r.id, 'Cancelación', r.quantity, 'Reserva ' || r.code || ' cancelada.' ||
    case when now() >= lot_effective_end(l) then ' El plazo de la oferta ya terminó.' else ' Cantidad liberada.' end);
  return result;
end;
$$;

create or replace function collect_reservation(p_reservation_id text, p_establishment_id text)
returns reservations
language plpgsql as $$
declare r reservations; l lots; result reservations;
begin
  select * into r from reservations where id = p_reservation_id for update;
  if not found then raise exception 'No encontramos esta reserva.'; end if;
  select l2.* into l from lots l2 join offers o on o.lot_id = l2.id where o.id = r.offer_id;
  if l.establishment_id <> p_establishment_id then raise exception 'La reserva pertenece a otro establecimiento.'; end if;
  if r.status <> 'Reservada' then raise exception 'Esta reserva ya está cerrada y no puede procesarse de nuevo.'; end if;
  if now() < l.pickup_starts_at then raise exception 'El horario de retiro todavía no comenzó.'; end if;
  if now() >= lot_effective_end(l) then raise exception 'El plazo de retiro ya finalizó.'; end if;

  update reservations set status = 'Retirada', closed_at = now() where id = r.id returning * into result;
  insert into movements (lot_id, reservation_id, type, quantity, detail)
  values (l.id, r.id, 'Retiro', r.quantity, 'Retiro ' || r.code || ' confirmado manualmente.');
  return result;
end;
$$;

create or replace function publish_lot(
  p_establishment_id text, p_name text, p_description text, p_category text, p_unit text, p_quantity numeric,
  p_regular_price numeric, p_price numeric, p_image text, p_entry_at timestamptz, p_date_type text, p_food_date date,
  p_commercialization_ends_at timestamptz, p_pickup_starts_at timestamptz, p_pickup_ends_at timestamptz, p_alert_minutes integer
) returns offers
language plpgsql as $$
declare l lots; result offers;
begin
  insert into lots (establishment_id, name, description, category, unit, initial_quantity, available_quantity, entry_at, date_type,
    food_date, commercialization_ends_at, pickup_starts_at, pickup_ends_at, alert_minutes, suitability_declared)
  values (p_establishment_id, trim(p_name), trim(p_description), p_category, p_unit, round(p_quantity, 3), round(p_quantity, 3), p_entry_at,
    p_date_type, p_food_date, p_commercialization_ends_at, p_pickup_starts_at, p_pickup_ends_at, p_alert_minutes, true)
  returning * into l;
  insert into offers (lot_id, regular_price, price, image) values (l.id, p_regular_price, p_price, p_image) returning * into result;
  insert into movements (lot_id, type, quantity, detail) values (l.id, 'Publicación', l.initial_quantity, 'Se publicó ' || l.name || '.');
  return result;
end;
$$;

create or replace function update_offer_price(p_offer_id text, p_establishment_id text, p_price numeric)
returns offers
language plpgsql as $$
declare o offers; l lots; result offers;
begin
  select * into o from offers where id = p_offer_id for update;
  if not found then raise exception 'No encontramos esta oferta. Vuelve al catálogo.'; end if;
  select * into l from lots where id = o.lot_id;
  if l.establishment_id <> p_establishment_id then raise exception 'Esta oferta pertenece a otro establecimiento.'; end if;
  if now() >= lot_effective_end(l) then raise exception 'El plazo de esta oferta ya finalizó.'; end if;
  if p_price is null or p_price <= 0 or p_price >= o.regular_price then raise exception 'El nuevo precio debe ser positivo y menor al precio habitual.'; end if;

  update offers set price = round(p_price, 2) where id = o.id returning * into result;
  insert into movements (lot_id, type, quantity, detail)
  values (l.id, 'Cambio de precio', 0, 'Precio actualizado a ' || format_money(result.price) || '. Las reservas existentes conservan su precio.');
  return result;
end;
$$;

create or replace function toggle_offer(p_offer_id text, p_establishment_id text)
returns offers
language plpgsql as $$
declare o offers; l lots; result offers;
begin
  select * into o from offers where id = p_offer_id for update;
  if not found then raise exception 'No encontramos esta oferta. Vuelve al catálogo.'; end if;
  select * into l from lots where id = o.lot_id;
  if l.establishment_id <> p_establishment_id then raise exception 'Esta oferta pertenece a otro establecimiento.'; end if;
  if now() >= lot_effective_end(l) then raise exception 'El plazo de esta oferta ya finalizó.'; end if;
  update offers set paused = not paused where id = o.id returning * into result;
  return result;
end;
$$;

-- Only the server (service role) may run these.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
