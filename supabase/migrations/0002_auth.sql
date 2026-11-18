-- Accounts and roles: consumers, establishments and administrators.
-- Passwords are stored as scrypt hashes; sessions keep only a SHA-256 hash of the cookie token.

create table if not exists users (
  id text primary key default ('usr-' || gen_random_uuid()),
  name text not null check (char_length(name) between 2 and 80),
  email text not null unique check (char_length(email) between 5 and 160 and email = lower(email)),
  phone text check (phone is null or char_length(phone) between 6 and 30),
  password_hash text not null,
  role text not null check (role in ('consumidor', 'establecimiento', 'administrador')),
  establishment_id text references establishments (id),
  created_at timestamptz not null default now(),
  check ((role = 'establecimiento') = (establishment_id is not null))
);
create index if not exists users_establishment_idx on users (establishment_id);

create table if not exists sessions (
  token_hash text primary key,
  user_id text not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_idx on sessions (user_id);

alter table reservations add column if not exists user_id text references users (id);
create index if not exists reservations_user_idx on reservations (user_id);

alter table users enable row level security;
alter table sessions enable row level security;

-- Reservations now belong to a consumer account instead of an anonymous browser token.
drop function if exists reserve_offer(text, numeric, text, text);
create or replace function reserve_offer(p_offer_id text, p_quantity numeric, p_user_id text)
returns reservations
language plpgsql as $$
declare o offers; l lots; u users; amount numeric(12, 3); result reservations;
begin
  select * into u from users where id = p_user_id;
  if not found or u.role <> 'consumidor' then raise exception 'Inicia sesión con una cuenta de cliente para reservar.'; end if;
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
  insert into reservations (code, offer_id, quantity, unit_price, customer_name, user_id, status)
  values (new_reservation_code(), o.id, amount, o.price, u.name, u.id, 'Reservada')
  returning * into result;
  insert into movements (lot_id, reservation_id, type, quantity, detail)
  values (l.id, result.id, 'Reserva', amount, 'Reserva ' || result.code || ' registrada.');
  return result;
end;
$$;

drop function if exists cancel_reservation(text, text, text);
create or replace function cancel_reservation(p_reservation_id text, p_user_id text, p_establishment_id text)
returns reservations
language plpgsql as $$
declare r reservations; l lots; result reservations;
begin
  select * into r from reservations where id = p_reservation_id for update;
  if not found then raise exception 'No encontramos esta reserva.'; end if;
  select l2.* into l from lots l2 join offers o on o.lot_id = l2.id where o.id = r.offer_id for update of l2;
  if not ((p_user_id is not null and r.user_id = p_user_id) or (p_establishment_id is not null and l.establishment_id = p_establishment_id)) then
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

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
