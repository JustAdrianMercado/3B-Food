"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Clock3, LayoutGrid, MapPin, Milk, Search, ShoppingBasket, SlidersHorizontal, Soup, Sprout, Wheat, X } from "lucide-react";
import { CATEGORIES, ZONES, dateLabel, discount, getOfferViews, localDate, money, number, offerStatus, timeLabel, type Category, type OfferView } from "@/lib/domain";
import { useData } from "./data-provider";
import { LoadingCards, Reveal } from "./ui";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

const categoryIcons = { "Cocina del día": Soup, "Panadería": Wheat, "Frutas y verduras": Sprout, "Lácteos": Milk, "Despensa": ShoppingBasket };

export function OfferCard({ view, index = 0 }: { view: OfferView; index?: number }) {
  const { now } = useData();
  const { offer, lot, establishment } = view;
  const today = localDate(lot.pickupEndsAt ? new Date(lot.pickupEndsAt) : now) === localDate(now);
  return <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.15) }} className="offer-card" data-testid="offer-card">
    <div className="offer-image-wrap"><Link className="offer-image" href={`/ofertas/${offer.id}`} aria-label={`Ver ${lot.name}`}><Image src={offer.image} alt={lot.category === "Panadería" ? "Panadería artesanal recién preparada" : `${lot.category}, fotografía ilustrativa`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" /></Link><span className="discount-badge">−{discount(offer)}<small>%</small></span><span className="image-category">{lot.category}</span><span className="image-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span></div>
    <div className="offer-content"><div className="offer-vendor"><span className="vendor-avatar" style={{ backgroundColor: establishment.color }}>{establishment.initials}</span><span>{establishment.name}</span><span className="vendor-dot" /></div><Link href={`/ofertas/${offer.id}`} className="offer-title-link"><h3>{lot.name}</h3></Link><div className="offer-location"><MapPin size={13} />{establishment.zone}, Cochabamba<span>·</span>{number(lot.availableQuantity)} {lot.unit} disponibles</div><div className="offer-bottom"><div className="offer-price"><strong>{money(offer.price)}</strong><s>{money(offer.regularPrice)}</s></div><span className="pickup-chip"><Clock3 size={12} />{today ? "Retira hoy" : dateLabel(lot.pickupEndsAt)} · {timeLabel(lot.pickupEndsAt)}</span></div></div>
  </motion.article>;
}

export function EstablishmentOffers({ establishmentId }: { establishmentId: string }) {
  const { state, now, ready } = useData();
  if (!ready || !state) return <LoadingCards count={3} />;
  const views = getOfferViews(state).filter(({ offer, lot, establishment }) => establishment.id === establishmentId && offerStatus(offer, lot, now) === "Disponible");
  return views.length
    ? <div className="offer-grid">{views.map((view, index) => <OfferCard key={view.offer.id} view={view} index={index} />)}</div>
    : <EmptyState icon={Search} title="Hoy no hay ofertas disponibles" description="Este establecimiento publica sus excedentes cuando los tiene. Vuelve más tarde o explora otras ofertas de tu zona." action={<Link href="/ofertas" className="btn btn-secondary">Explorar ofertas<ArrowRight size={16} /></Link>} />;
}

export function OfferCatalog({ home = false }: { home?: boolean }) {
  const { state, now, ready } = useData();
  const [category, setCategory] = useState<Category | "Todas">("Todas");
  const [zone, setZone] = useState("Todas");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recomendadas");
  const [onlySoon, setOnlySoon] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const views = useMemo(() => {
    if (!state) return [];
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
    const query = normalize(search.trim());
    return getOfferViews(state).filter(({ offer, lot, establishment }) =>
      offerStatus(offer, lot, now) === "Disponible" &&
      (category === "Todas" || lot.category === category) &&
      (zone === "Todas" || establishment.zone === zone) &&
      (!query || normalize(`${lot.name} ${lot.description} ${establishment.name} ${lot.category}`).includes(query)) &&
      (!onlySoon || Date.parse(lot.commercializationEndsAt) - now <= lot.alertMinutes * 60_000),
    ).sort((a, b) => sort === "precio" ? a.offer.price - b.offer.price : sort === "descuento" ? discount(b.offer) - discount(a.offer) : sort === "plazo" ? Date.parse(a.lot.commercializationEndsAt) - Date.parse(b.lot.commercializationEndsAt) : 0);
  }, [state, now, category, zone, search, sort, onlySoon]);
  const activeFilters = category !== "Todas" || zone !== "Todas" || search.trim() || onlySoon || sort !== "recomendadas";
  const resetFilters = () => { setCategory("Todas"); setZone("Todas"); setSearch(""); setOnlySoon(false); setSort("recomendadas"); };

  return <section className={cn("catalog-section", !home && "catalog-section--full")} id="ofertas" aria-labelledby="catalog-heading"><div className="container">
    {home && <Reveal className="section-heading"><div><span className="eyebrow"><span className="tiny-line" />BUENO, CERCA Y A UN MEJOR PRECIO</span><h2 id="catalog-heading">Algo rico te está esperando<span className="text-clay">.</span></h2><p>Pequeños excedentes. Grandes oportunidades para tu día.</p></div><Link className="text-link" href="/ofertas">Explorar todas<ArrowUpRight size={17} /></Link></Reveal>}
    {!home && <h2 id="catalog-heading" className="sr-only">Catálogo de ofertas disponibles</h2>}
    <div className="catalog-toolbar"><div className="category-tabs" aria-label="Categorías de alimentos"><button className={cn("category-tab", category === "Todas" && "selected")} onClick={() => setCategory("Todas")} aria-pressed={category === "Todas"}><LayoutGrid size={16} />Todas</button>{CATEGORIES.map((item) => { const Icon = categoryIcons[item]; return <button key={item} className={cn("category-tab", category === item && "selected")} onClick={() => setCategory(item)} aria-pressed={category === item}><Icon size={17} />{item}</button>; })}</div><button className={cn("filter-toggle", filtersOpen && "selected")} onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen} aria-controls="catalog-filters"><SlidersHorizontal size={17} />Filtros{activeFilters && <span className="filter-dot" />}</button></div>
    <div id="catalog-filters" className={cn("catalog-filters", filtersOpen && "catalog-filters--open")}><label className="search-field"><Search size={18} /><span className="sr-only">Buscar alimentos o establecimientos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="¿Qué se te antoja hoy?" type="search" />{search && <button className="clear-search" aria-label="Borrar búsqueda" onClick={() => setSearch("")}><X size={15} /></button>}</label><label className="zone-field"><MapPin size={17} /><span className="sr-only">Filtrar por zona</span><select value={zone} onChange={(event) => setZone(event.target.value)}><option value="Todas">Todo Cochabamba</option>{ZONES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="sort-field"><span className="sr-only">Ordenar ofertas</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recomendadas">Recomendadas</option><option value="plazo">Terminan primero</option><option value="precio">Menor precio publicado</option><option value="descuento">Mayor descuento</option></select></label></div>
    {!home && <div className="catalog-options"><label className="checkbox-inline"><input type="checkbox" checked={onlySoon} onChange={(event) => setOnlySoon(event.target.checked)} />Solo próximas a su límite</label><span>El precio corresponde a la unidad de cada oferta.</span></div>}
    <div className="catalog-results"><span aria-live="polite">{ready ? <><b>{views.length}</b> oportunidades por aprovechar</> : "Buscando cosas buenas…"}</span>{activeFilters && <button className="clear-filters" onClick={resetFilters}>Limpiar filtros<X size={13} /></button>}<span className="results-live"><span />Solo ofertas vigentes</span></div>
    {!ready ? <LoadingCards count={home ? 3 : 6} /> : views.length ? <motion.div layout className="offer-grid"><AnimatePresence mode="popLayout">{views.slice(0, home ? 6 : undefined).map((view, index) => <OfferCard key={view.offer.id} view={view} index={index} />)}</AnimatePresence></motion.div> : <EmptyState icon={Search} title="Hoy no encontramos esa combinación" description="Prueba otra zona o categoría. Los establecimientos publican nuevas oportunidades cada día." action={<button className="btn btn-secondary" onClick={resetFilters}>Ver todas las categorías<ArrowRight size={16} /></button>} />}
    {home && <p className="catalog-footnote"><Clock3 size={14} />Las oportunidades tienen su tiempo. Revisa el horario de retiro antes de reservar.</p>}
  </div></section>;
}
