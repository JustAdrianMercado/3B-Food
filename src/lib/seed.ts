import { type SiteState, type Establishment, type Category, type Lot, type Movement, type Reservation, type Role, type Unit, localDate } from "./domain";

/** Password shared by the initial accounts (change it after the first sign-in). */
export const SEED_PASSWORD = "Rescate2026";

export const establishments: readonly Establishment[] = [
  { id: "est-espiga", slug: "la-espiga-de-tupuraya", name: "La Espiga de Tupuraya", type: "Restaurante", zone: "Tupuraya", address: "Av. Pando 1245, zona Tupuraya, Cochabamba", description: "Panadería y cafetería de barrio con producción artesanal diaria. Al final de la tarde ofrece el pan y la repostería que no se vendió durante el día.", openingHours: "Lunes a sábado, 07:00–20:30", initials: "LE", color: "#e5b07b" },
  { id: "est-barrio", slug: "cocina-de-barrio", name: "Cocina de Barrio", type: "Restaurante", zone: "Cala Cala", address: "Av. América 0587, zona Cala Cala, Cochabamba", description: "Almuerzos caseros preparados cada día. Las porciones que quedan después del servicio se ofrecen a un mejor precio para retirar por la tarde.", openingHours: "Lunes a sábado, 11:30–21:30", initials: "CB", color: "#a9bf94" },
  { id: "est-verde", slug: "mercado-verde", name: "Mercado Verde", type: "Supermercado", zone: "Centro", address: "Calle España 352, zona Centro, Cochabamba", description: "Supermercado del centro con frutas, verduras y lácteos. Publica productos con detalles de apariencia o próximos a su fecha de consumo.", openingHours: "Todos los días, 08:00–21:00", initials: "MV", color: "#d7bd76" },
  { id: "est-recoleta", slug: "mesa-de-la-recoleta", name: "Mesa de la Recoleta", type: "Restaurante", zone: "La Recoleta", address: "Av. Potosí 1460, zona La Recoleta, Cochabamba", description: "Restaurante familiar de cocina casera. Ofrece los platos del día que quedan al cierre del almuerzo y de la cena.", openingHours: "Martes a domingo, 12:00–22:00", initials: "MR", color: "#d7a797" },
  { id: "est-prado", slug: "cafe-el-prado", name: "Café El Prado", type: "Restaurante", zone: "El Prado", address: "Av. Ballivián 640, zona El Prado, Cochabamba", description: "Café sobre El Prado con panadería y postres propios. Publica la producción del día que todavía puede disfrutarse.", openingHours: "Todos los días, 08:00–21:30", initials: "CP", color: "#c9a98b" },
  { id: "est-queru", slug: "sabores-de-queru-queru", name: "Sabores de Queru Queru", type: "Restaurante", zone: "Queru Queru", address: "Av. Santa Cruz 1820, zona Queru Queru, Cochabamba", description: "Comida tradicional, parrillas y ensaladas frescas. Las porciones restantes se ofrecen para retirar durante la tarde.", openingHours: "Lunes a sábado, 11:00–21:30", initials: "SQ", color: "#e0b49a" },
  { id: "est-sarco", slug: "super-sarco", name: "Súper Sarco", type: "Supermercado", zone: "Sarco", address: "Av. Simón López 2150, zona Sarco, Cochabamba", description: "Supermercado de barrio con verduras, frutas y productos de despensa. Ofrece productos maduros o con fecha de consumo cercana.", openingHours: "Todos los días, 07:30–22:00", initials: "SS", color: "#b7c4a0" },
  { id: "est-muyurina", slug: "minimarket-muyurina", name: "Minimarket Muyurina", type: "Supermercado", zone: "Muyurina", address: "Av. Oquendo 1033, zona Muyurina, Cochabamba", description: "Minimarket con lácteos, galletas y productos envasados. Publica artículos cerrados próximos a su fecha de consumo preferente.", openingHours: "Lunes a sábado, 08:00–22:00", initials: "MM", color: "#cdbf86" },
  { id: "est-julia", slug: "pension-dona-julia", name: "Pensión Doña Julia", type: "Restaurante", zone: "Las Cuadras", address: "Av. Rubén Darío 774, zona Las Cuadras, Cochabamba", description: "Pensión con almuerzo completo y platos a la carta. Lo que sobra del día se ofrece por la tarde para que nada se pierda.", openingHours: "Lunes a sábado, 11:30–21:00", initials: "DJ", color: "#d9b38c" },
  { id: "est-hipodromo", slug: "despensa-hipodromo", name: "Despensa Hipódromo", type: "Supermercado", zone: "Hipódromo", address: "Av. Circunvalación 2290, zona Hipódromo, Cochabamba", description: "Despensa familiar con lácteos, panadería envasada y abarrotes. Publica productos con fecha de consumo cercana.", openingHours: "Todos los días, 08:00–22:00", initials: "DH", color: "#bfc79a" },
];

export interface SeedAccount { id: string; name: string; email: string; phone: string | null; role: Role; establishmentId: string | null }

const owners: [string, string, string, string][] = [
  ["est-espiga", "Rosa Quiroga", "laespiga@ecorescate.bo", "71423580"],
  ["est-barrio", "Marco Antezana", "cocinadebarrio@ecorescate.bo", "72216094"],
  ["est-verde", "Patricia Rocha", "mercadoverde@ecorescate.bo", "70354128"],
  ["est-recoleta", "Gonzalo Paz", "mesarecoleta@ecorescate.bo", "76490315"],
  ["est-prado", "Lucía Montaño", "cafeelprado@ecorescate.bo", "71189642"],
  ["est-queru", "Hugo Salazar", "saboresqueru@ecorescate.bo", "79327751"],
  ["est-sarco", "Elena Gutiérrez", "supersarco@ecorescate.bo", "72651830"],
  ["est-muyurina", "Ramiro Terceros", "muyurina@ecorescate.bo", "70948263"],
  ["est-julia", "Julia Camacho", "donajulia@ecorescate.bo", "76115409"],
  ["est-hipodromo", "Fernando Ugarte", "despensahipodromo@ecorescate.bo", "71762934"],
];

const customers = ["Ana Rojas", "Luis Fernández", "Carla Vargas", "Diego Mamani", "Sofía Céspedes", "Mateo Arze", "Valeria Quiroga", "Jorge Torrico", "Camila Rivero", "Andrés Choque", "Daniela Soria", "Pablo Medrano"];
const emailOf = (name: string) => `${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, ".")}@correo.bo`;
const customerId = (index: number) => `usr-${customers[index].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-")}`;

export const accounts: readonly SeedAccount[] = [
  { id: "usr-admin", name: "Equipo EcoRescate", email: "admin@ecorescate.bo", phone: null, role: "administrador", establishmentId: null },
  ...owners.map(([establishmentId, name, email, phone]) => ({ id: `usr-${establishmentId.slice(4)}`, name, email, phone, role: "establecimiento" as const, establishmentId })),
  ...customers.map((name, index) => ({ id: customerId(index), name, email: emailOf(name), phone: null, role: "consumidor" as const, establishmentId: null })),
];

/** [customer index, quantity, status]. */
type SeedReservation = [number, number, Reservation["status"]];

interface SeedItem {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  category: Category;
  unit: Unit;
  amount: number;
  regular: number;
  price: number;
  image: string;
  dateType: Lot["dateType"];
  alert: number;
  /** Current offers: [day offset, local time] of the end of pickup. Past offers: days ago. */
  end: [number, string] | number;
  paused?: boolean;
  /** Price before a discount change made after publishing. */
  previousPrice?: number;
  reservations?: SeedReservation[];
}

const SAME_DAY: Pick<SeedItem, "dateType"> = { dateType: "Límite de oferta" };

/** Offers that are currently available, paused or sold out. */
const currentItems: SeedItem[] = [
  { id: "pan-artesanal", establishmentId: "est-espiga", name: "Bolsa sorpresa de pan del día (6 piezas)", description: "Seis panes artesanales de la producción de hoy: marraquetas, pan integral y una pieza dulce. El surtido depende de lo que quede al cierre. Conservar en un lugar fresco y seco. Contiene gluten; puede contener leche y huevo.", category: "Panadería", unit: "unidades", amount: 10, regular: 30, price: 15, image: "/images/panaderia.webp", dateType: "Consumo preferente", alert: 1440, end: [0, "20:30"], reservations: [[1, 2, "Retirada"], [2, 1, "Retirada"], [0, 1, "Reservada"]] },
  { id: "pan-integral", establishmentId: "est-espiga", name: "Pan integral de masa madre", description: "Pan integral de masa madre horneado esta mañana, entero (aprox. 600 g). Ideal para tostadas durante los próximos dos días. Contiene gluten.", category: "Panadería", unit: "unidades", amount: 6, regular: 22, price: 12, previousPrice: 14, image: "/images/pan-integral.webp", dateType: "Consumo preferente", alert: 360, end: [0, "20:30"] },
  { id: "torta-chocolate", establishmentId: "est-espiga", name: "Torta de chocolate (porción)", description: "Porción generosa de torta húmeda de chocolate con cobertura de ganache, elaborada ayer. Mantener refrigerada. Contiene gluten, leche y huevo.", category: "Panadería", unit: "porciones", amount: 8, regular: 18, price: 10, image: "/images/torta-chocolate.webp", dateType: "Consumo preferente", alert: 360, end: [0, "20:30"], reservations: [[4, 2, "Retirada"]] },
  { id: "pollo-plancha", establishmentId: "est-barrio", name: "Pollo a la plancha con arroz y ensalada", description: "Pechuga de pollo a la plancha con arroz graneado, verduras salteadas y limón, preparada hoy al mediodía. Se entrega en envase para llevar; recalentar antes de consumir.", category: "Cocina del día", unit: "porciones", amount: 8, regular: 35, price: 20, image: "/images/pollo-plancha.webp", ...SAME_DAY, alert: 1440, end: [0, "21:30"], reservations: [[3, 2, "Retirada"], [0, 1, "Reservada"]] },
  { id: "picante-pollo", establishmentId: "est-barrio", name: "Picante de pollo con chuño y arroz", description: "Porción de picante de pollo con chuño phuti, arroz y sarsa, preparada hoy. Picor medio. Se entrega caliente o refrigerada, según la hora de retiro.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 38, price: 22, image: "/images/pollo-guiso.webp", ...SAME_DAY, alert: 360, end: [0, "21:30"], reservations: [[4, 1, "Reservada"]] },
  { id: "verduras-mix", establishmentId: "est-verde", name: "Mix de verduras frescas por kilo", description: "Zanahoria, tomate, lechuga, rábano y pepino seleccionados con pequeños detalles de apariencia. Se vende por kilogramo. Lavar antes de consumir.", category: "Frutas y verduras", unit: "kg", amount: 10, regular: 16, price: 9, image: "/images/verduras.webp", dateType: "Consumo preferente", alert: 1440, end: [1, "21:00"], reservations: [[5, 2.5, "Retirada"], [6, 1, "Reservada"]] },
  { id: "frutas-tropicales", establishmentId: "est-verde", name: "Frutas tropicales de temporada por kilo", description: "Papaya, piña, mandarina, palta y kiwi bien maduros, listos para consumir en los próximos días. Se venden por kilogramo, en surtido.", category: "Frutas y verduras", unit: "kg", amount: 8, regular: 22, price: 12, image: "/images/frutas.webp", dateType: "Consumo preferente", alert: 1440, end: [2, "21:00"] },
  { id: "queso-fresco", establishmentId: "est-verde", name: "Queso fresco del valle por kilo", description: "Queso fresco de productores del valle alto, cortado y envasado en el local. Mantener refrigerado. Oferta pausada mientras se revisa la cadena de frío. Contiene leche.", category: "Lácteos", unit: "kg", amount: 3, regular: 48, price: 32, image: "/images/queso.webp", dateType: "Vencimiento", alert: 1440, end: [2, "21:00"], paused: true },
  { id: "leche-entera", establishmentId: "est-verde", name: "Leche entera pasteurizada 1 L", description: "Bolsas cerradas de leche entera pasteurizada de 1 litro con fecha de vencimiento próxima. Mantener refrigerada y trasladar sin interrumpir la cadena de frío.", category: "Lácteos", unit: "unidades", amount: 12, regular: 9, price: 6, image: "/images/leche.webp", dateType: "Vencimiento", alert: 1440, end: [1, "21:00"], reservations: [[7, 3, "Retirada"]] },
  { id: "lasana-carne", establishmentId: "est-recoleta", name: "Lasaña de carne gratinada", description: "Porción de lasaña de carne con salsa de tomate y queso gratinado, preparada hoy. Se entrega en envase apto para horno. Contiene gluten y leche.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 45, price: 26, image: "/images/lasana.webp", ...SAME_DAY, alert: 360, end: [0, "22:00"], reservations: [[8, 2, "Retirada"], [9, 1, "Cancelada"]] },
  { id: "pollo-horno", establishmentId: "est-recoleta", name: "Pollo al horno con papas doradas", description: "Cuarto de pollo al horno con papas doradas y ensalada criolla, preparado hoy. Se entrega en envase para llevar; recalentar antes de consumir.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 45, price: 27, image: "/images/pollo-horno.webp", ...SAME_DAY, alert: 120, end: [0, "22:00"] },
  { id: "crema-zapallo", establishmentId: "est-recoleta", name: "Crema de zapallo con semillas", description: "Crema de zapallo casera con semillas tostadas y un toque de queso, preparada hoy. Se entrega en envase térmico. Contiene leche.", category: "Cocina del día", unit: "porciones", amount: 5, regular: 20, price: 12, image: "/images/crema-zapallo.webp", ...SAME_DAY, alert: 120, end: [0, "22:00"], reservations: [[10, 3, "Retirada"], [11, 2, "Reservada"]] },
  { id: "medialunas-cafe", establishmentId: "est-prado", name: "Medialunas de manteca", description: "Medialunas de manteca de la producción de esta mañana, empacadas por unidad. Ideales para acompañar el café de la tarde. Contiene gluten, leche y huevo.", category: "Panadería", unit: "unidades", amount: 12, regular: 8, price: 4.5, image: "/images/medialunas.webp", dateType: "Consumo preferente", alert: 1440, end: [0, "21:00"], reservations: [[0, 4, "Retirada"], [1, 2, "Reservada"]] },
  { id: "torta-frutilla", establishmentId: "est-prado", name: "Torta de frutilla y crema (porción)", description: "Porción de torta de bizcochuelo con crema chantilly y frutillas frescas, elaborada hoy. Mantener refrigerada y consumir en el día. Contiene gluten, leche y huevo.", category: "Panadería", unit: "porciones", amount: 6, regular: 22, price: 12, image: "/images/torta-frutilla.webp", dateType: "Consumo preferente", alert: 360, end: [0, "21:00"] },
  { id: "pie-manzana", establishmentId: "est-prado", name: "Pie de manzana entero (8 porciones)", description: "Pie de manzana con canela y masa quebrada, entero y horneado ayer. Conservar en lugar fresco. Contiene gluten, leche y huevo.", category: "Panadería", unit: "unidades", amount: 2, regular: 70, price: 40, image: "/images/pie-manzana.webp", dateType: "Consumo preferente", alert: 1440, end: [1, "20:00"] },
  { id: "parrillada-uno", establishmentId: "est-queru", name: "Parrillada mixta para uno", description: "Pollo, chorizo y carne de res a la parrilla con papa, choclo y llajua aparte, preparados hoy. Recalentar antes de consumir.", category: "Cocina del día", unit: "porciones", amount: 5, regular: 55, price: 32, image: "/images/parrillada.webp", ...SAME_DAY, alert: 360, end: [0, "21:30"], reservations: [[2, 1, "Reservada"]] },
  { id: "ensalada-completa", establishmentId: "est-queru", name: "Ensalada completa con palta", description: "Lechuga, tomate cherry, palta, aceitunas, cebolla morada y queso, con aderezo aparte. Preparada hoy y conservada en frío. Consumir el mismo día.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 30, price: 16, image: "/images/ensalada.webp", ...SAME_DAY, alert: 120, end: [0, "21:30"] },
  { id: "sopa-verduras", establishmentId: "est-queru", name: "Sopa de verduras casera", description: "Sopa de verduras con fideo, zanahoria, arvejas y papa, preparada hoy. Se entrega caliente en envase térmico. Contiene gluten.", category: "Cocina del día", unit: "porciones", amount: 8, regular: 15, price: 8, image: "/images/sopa-verduras.webp", ...SAME_DAY, alert: 1440, end: [0, "21:30"], reservations: [[3, 2, "Retirada"]] },
  { id: "platanos-maduros", establishmentId: "est-sarco", name: "Plátanos maduros por kilo", description: "Plátanos con la cáscara manchada propia de la maduración. Ideales para batidos, queques o consumo inmediato. Se venden por kilogramo.", category: "Frutas y verduras", unit: "kg", amount: 6, regular: 10, price: 5, image: "/images/platanos.webp", dateType: "Consumo preferente", alert: 1440, end: [1, "21:00"], reservations: [[4, 1.5, "Retirada"]] },
  { id: "verduras-mercado", establishmentId: "est-sarco", name: "Bolsa de verduras para la semana", description: "Zapallo, pimentón, papa, cebolla y tomate seleccionados con detalles de apariencia. Se vende por kilogramo. Lavar antes de consumir.", category: "Frutas y verduras", unit: "kg", amount: 12, regular: 14, price: 8, image: "/images/mercado.webp", dateType: "Consumo preferente", alert: 1440, end: [2, "21:00"] },
  { id: "arroz-grano", establishmentId: "est-sarco", name: "Arroz grano largo en bolsa de 1 kg", description: "Bolsas cerradas de arroz grano largo de 1 kg con fecha de consumo preferente próxima. Envase íntegro. Conservar en un lugar seco.", category: "Despensa", unit: "unidades", amount: 10, regular: 14, price: 9, image: "/images/arroz.webp", dateType: "Consumo preferente", alert: 1440, end: [3, "21:00"] },
  { id: "galletas-chips", establishmentId: "est-muyurina", name: "Galletas con chips de chocolate (paquete)", description: "Paquetes cerrados de galletas con chips de chocolate de 300 g, con fecha de consumo preferente cercana. Contienen gluten, leche y soya.", category: "Despensa", unit: "unidades", amount: 14, regular: 15, price: 9, image: "/images/galletas.webp", dateType: "Consumo preferente", alert: 1440, end: [2, "21:00"], reservations: [[5, 2, "Reservada"]] },
  { id: "cereal-avena", establishmentId: "est-muyurina", name: "Cereal de avena y miel 500 g", description: "Cajas cerradas de cereal de avena con miel de 500 g, con fecha de consumo preferente próxima. Envase íntegro. Contiene gluten.", category: "Despensa", unit: "unidades", amount: 8, regular: 28, price: 17, image: "/images/cereal.webp", dateType: "Consumo preferente", alert: 1440, end: [3, "21:00"] },
  { id: "macarons-caja", establishmentId: "est-muyurina", name: "Macarons surtidos (caja de 6)", description: "Cajas selladas de seis macarons de sabores surtidos. Mantener en un lugar fresco. Contienen almendra, huevo y leche.", category: "Panadería", unit: "unidades", amount: 6, regular: 35, price: 20, image: "/images/masitas.webp", dateType: "Consumo preferente", alert: 1440, end: [1, "21:00"] },
  { id: "costillas-cerdo", establishmentId: "est-julia", name: "Costillas de cerdo al horno con mote", description: "Costillas de cerdo al horno con mote, papa y ensalada de tomate, preparadas hoy. Recalentar antes de consumir.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 40, price: 24, image: "/images/costillas.webp", ...SAME_DAY, alert: 360, end: [0, "21:00"], reservations: [[6, 2, "Retirada"], [7, 1, "Reservada"]] },
  { id: "fideo-bolognesa", establishmentId: "est-julia", name: "Fideo con salsa boloñesa", description: "Porción de fideo con salsa boloñesa y queso rallado, preparada hoy al mediodía. Se entrega en envase para llevar. Contiene gluten y leche.", category: "Cocina del día", unit: "porciones", amount: 8, regular: 25, price: 14, image: "/images/pasta-penne.webp", ...SAME_DAY, alert: 120, end: [0, "21:00"], reservations: [[8, 1, "Reservada"]] },
  { id: "yogurt-frutilla", establishmentId: "est-hipodromo", name: "Yogurt bebible de frutilla 1 L", description: "Botellas cerradas de yogurt bebible sabor frutilla de 1 litro, con fecha de vencimiento próxima. Mantener refrigerado. Contiene leche.", category: "Lácteos", unit: "unidades", amount: 8, regular: 18, price: 11, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440, end: [2, "21:00"] },
  { id: "pan-molde", establishmentId: "est-hipodromo", name: "Pan de molde blanco 500 g", description: "Bolsas cerradas de pan de molde blanco de 500 g con fecha de consumo preferente cercana. Contiene gluten; puede contener soya.", category: "Panadería", unit: "unidades", amount: 6, regular: 15, price: 9, image: "/images/bread.webp", dateType: "Consumo preferente", alert: 1440, end: [1, "21:00"] },
];

/** Offers from the last days whose period already ended, so reports and history have depth. */
const pastItems: SeedItem[] = [
  { id: "hist-pan-ayer", establishmentId: "est-espiga", name: "Bolsa sorpresa de pan del día (6 piezas)", description: "Seis panes artesanales de la producción del día. Contiene gluten.", category: "Panadería", unit: "unidades", amount: 12, regular: 30, price: 15, image: "/images/panaderia.webp", dateType: "Consumo preferente", alert: 1440, end: 1, reservations: [[0, 2, "Retirada"], [5, 3, "Retirada"], [9, 2, "Retirada"], [2, 1, "Cancelada"], [7, 1, "No retirada"]] },
  { id: "hist-almuerzo-ayer", establishmentId: "est-barrio", name: "Almuerzo completo con sopa y segundo", description: "Sopa de maní y segundo de carne con arroz, preparados el día. Retirar para consumo inmediato.", category: "Cocina del día", unit: "porciones", amount: 12, regular: 38, price: 20, image: "/images/pollo-guiso.webp", ...SAME_DAY, alert: 240, end: 1, reservations: [[1, 3, "Retirada"], [3, 2, "Retirada"], [8, 2, "Retirada"], [10, 2, "No retirada"]] },
  { id: "hist-parrilla-ayer", establishmentId: "est-queru", name: "Parrillada mixta para uno", description: "Pollo, chorizo y carne a la parrilla con papa y choclo.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 55, price: 32, image: "/images/parrillada.webp", ...SAME_DAY, alert: 360, end: 1, reservations: [[4, 2, "Retirada"], [6, 2, "Retirada"]] },
  { id: "hist-frutas", establishmentId: "est-verde", name: "Frutas de temporada por kilo", description: "Mandarinas, manzanas y duraznos con detalles de apariencia.", category: "Frutas y verduras", unit: "kg", amount: 10, regular: 20, price: 11, image: "/images/frutas.webp", dateType: "Consumo preferente", alert: 1440, end: 2, reservations: [[2, 3.5, "Retirada"], [11, 2, "Retirada"], [0, 1, "Cancelada"]] },
  { id: "hist-lasana", establishmentId: "est-recoleta", name: "Lasaña de verduras", description: "Lasaña de verduras gratinada. Contiene gluten y leche.", category: "Cocina del día", unit: "porciones", amount: 8, regular: 45, price: 26, image: "/images/lasana.webp", ...SAME_DAY, alert: 300, end: 2, reservations: [[5, 4, "Retirada"], [9, 2, "Retirada"], [1, 1, "No retirada"]] },
  { id: "hist-medialunas", establishmentId: "est-prado", name: "Medialunas de manteca", description: "Medialunas de la producción del día. Contiene gluten, leche y huevo.", category: "Panadería", unit: "unidades", amount: 20, regular: 8, price: 4.5, image: "/images/medialunas.webp", dateType: "Consumo preferente", alert: 240, end: 3, reservations: [[0, 6, "Retirada"], [3, 5, "Retirada"], [7, 3, "Cancelada"], [10, 4, "Retirada"]] },
  { id: "hist-leche", establishmentId: "est-sarco", name: "Leche saborizada de 1 litro", description: "Envases cerrados de leche saborizada con fecha de vencimiento próxima.", category: "Lácteos", unit: "unidades", amount: 10, regular: 12, price: 7, image: "/images/leche.webp", dateType: "Vencimiento", alert: 1440, end: 3, reservations: [[6, 6, "Retirada"], [8, 2, "Cancelada"]] },
  { id: "hist-despensa", establishmentId: "est-muyurina", name: "Fideo y arroz en paquete", description: "Paquetes cerrados de fideo y arroz con fecha de consumo preferente próxima.", category: "Despensa", unit: "unidades", amount: 8, regular: 14, price: 9, image: "/images/arroz.webp", dateType: "Consumo preferente", alert: 1440, end: 4, reservations: [[4, 5, "Retirada"], [11, 2, "Retirada"]] },
  { id: "hist-costillas", establishmentId: "est-julia", name: "Costillas de cerdo al horno", description: "Costillas al horno con mote y papa.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 40, price: 24, image: "/images/costillas.webp", ...SAME_DAY, alert: 360, end: 4, reservations: [[2, 2, "Retirada"], [9, 3, "Retirada"]] },
  { id: "hist-verduras", establishmentId: "est-sarco", name: "Verduras surtidas por kilo", description: "Zapallo, zanahoria y tomate con detalles de apariencia.", category: "Frutas y verduras", unit: "kg", amount: 15, regular: 14, price: 8, image: "/images/mercado.webp", dateType: "Consumo preferente", alert: 1440, end: 5, reservations: [[1, 3, "Retirada"], [5, 2.5, "Retirada"], [7, 2, "Retirada"], [3, 1, "No retirada"]] },
  { id: "hist-torta", establishmentId: "est-espiga", name: "Torta de chocolate (porción)", description: "Porciones de torta de chocolate. Contiene gluten, leche y huevo.", category: "Panadería", unit: "porciones", amount: 10, regular: 18, price: 10, image: "/images/torta-chocolate.webp", dateType: "Consumo preferente", alert: 360, end: 5, reservations: [[6, 3, "Retirada"], [10, 2, "Retirada"], [0, 2, "Retirada"]] },
  { id: "hist-sopa", establishmentId: "est-queru", name: "Sopa de verduras casera", description: "Sopa de verduras con fideo y papa.", category: "Cocina del día", unit: "porciones", amount: 10, regular: 15, price: 8, image: "/images/sopa-verduras.webp", ...SAME_DAY, alert: 240, end: 6, reservations: [[8, 4, "Retirada"], [2, 2, "Retirada"], [11, 1, "Cancelada"]] },
  { id: "hist-yogurt", establishmentId: "est-hipodromo", name: "Yogurt bebible de durazno 1 L", description: "Botellas cerradas de yogurt bebible con fecha de vencimiento próxima.", category: "Lácteos", unit: "unidades", amount: 8, regular: 18, price: 11, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440, end: 6, reservations: [[4, 3, "Retirada"], [9, 2, "Retirada"]] },
  { id: "hist-pollo", establishmentId: "est-recoleta", name: "Pollo al horno con papas doradas", description: "Cuarto de pollo al horno con papas.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 45, price: 27, image: "/images/pollo-horno.webp", ...SAME_DAY, alert: 120, end: 6, reservations: [[3, 2, "Retirada"], [7, 2, "Retirada"], [1, 1, "No retirada"]] },
];

const HOUR = 3_600_000;
/** Deterministic reservation code (ECO- + 6 hex characters) derived from the reservation id. */
function codeFor(value: string): string {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return `ECO-${hash.toString(16).toUpperCase().padStart(8, "0").slice(-6)}`;
}

/** Dates are computed from `now` (Cochabamba time), so the sample data is current whenever it is loaded. */
export function createSeed(now = Date.now()): SiteState {
  const iso = (ms: number) => new Date(ms).toISOString();
  const localTime = (dayOffset: number, time: string) => Date.parse(`${localDate(now + dayOffset * 24 * HOUR)}T${time}:00-04:00`);
  const state: SiteState = { viewer: null, establishments: [...establishments], selectedEstablishmentId: "est-espiga", lots: [], offers: [], reservations: [], movements: [] };
  const pushMovement = (movement: Omit<Movement, "id">, key: string) => state.movements.push({ id: `mov-${key}`, ...movement });

  for (const [past, item] of [...currentItems.map((entry) => [false, entry] as const), ...pastItems.map((entry) => [true, entry] as const)]) {
    let end: number, entry: number, published: number, pickupStart: number;
    if (typeof item.end === "number") {
      end = localTime(-item.end, "21:00"); entry = localTime(-item.end, "08:00"); published = localTime(-item.end, "13:00"); pickupStart = localTime(-item.end, "15:00");
    } else {
      // Keep at least five hours of pickup ahead, whatever the time the data is loaded.
      end = Math.max(localTime(item.end[0], item.end[1]), now + 5 * HOUR);
      const multiDay = item.end[0] > 0;
      // Pickup opened earlier today (not before 07:00), on a quarter hour, so pickups can be confirmed right away.
      const quarter = 15 * 60_000;
      pickupStart = Math.floor(Math.min(Math.max(now - 2 * HOUR, localTime(0, "07:00")), now - 0.5 * HOUR) / quarter) * quarter;
      published = now - (multiDay ? 20 : 2.5) * HOUR;
      entry = Math.min(published, multiDay ? now - 26 * HOUR : localTime(0, "06:30"));
    }
    const lotId = `lot-${item.id}`;
    const lot: Lot = {
      id: lotId, establishmentId: item.establishmentId, name: item.name, description: item.description, category: item.category, unit: item.unit,
      initialQuantity: item.amount, availableQuantity: item.amount, entryAt: iso(entry), dateType: item.dateType, foodDate: localDate(end),
      commercializationEndsAt: iso(end), pickupStartsAt: iso(pickupStart), pickupEndsAt: iso(end), alertMinutes: item.alert, suitabilityDeclared: true,
    };
    state.lots.push(lot);
    state.offers.push({ id: item.id, lotId, regularPrice: item.regular, price: item.price, image: item.image, publishedAt: iso(published), paused: item.paused ?? false });
    pushMovement({ lotId, reservationId: null, type: "Publicación", quantity: item.amount, createdAt: iso(published), detail: `Se publicó ${item.name}.` }, `pub-${item.id}`);
    if (item.previousPrice) pushMovement({ lotId, reservationId: null, type: "Cambio de precio", quantity: 0, createdAt: iso(published + 0.5 * HOUR), detail: `Precio actualizado de Bs ${item.previousPrice} a Bs ${String(item.price).replace(".", ",")}. Las reservas existentes conservan su precio.` }, `price-${item.id}`);

    (item.reservations ?? []).forEach(([customer, quantity, status], index) => {
      const id = `res-${item.id}-${index + 1}`;
      const created = past ? published + (1 + index * 0.7) * HOUR : now - (1.8 - index * 0.35) * HOUR;
      const closed = status === "Reservada" ? null
        : past ? status === "Retirada" ? pickupStart + (0.5 + index * 0.6) * HOUR : status === "Cancelada" ? created + 0.5 * HOUR : end
        : Math.min(now - 0.05 * HOUR, Math.max(created + 0.3 * HOUR, pickupStart + (0.15 + 0.08 * index) * HOUR));
      const reservation: Reservation = { id, code: codeFor(id), offerId: item.id, quantity, unitPrice: item.price, createdAt: iso(created), status, closedAt: closed === null ? null : iso(closed), customerName: customers[customer], mine: false };
      state.reservations.push(reservation);
      if (status === "Reservada" || status === "Retirada") lot.availableQuantity = Math.round((lot.availableQuantity - quantity) * 1000) / 1000;
      const movement = (type: Movement["type"], at: string, detail: string) => pushMovement({ lotId, reservationId: id, type, quantity, createdAt: at, detail }, `${type === "Reserva" ? "res" : "close"}-${id}`);
      movement("Reserva", reservation.createdAt, `Reserva ${reservation.code} registrada.`);
      if (status === "Retirada") movement("Retiro", reservation.closedAt!, `Retiro ${reservation.code} confirmado manualmente.`);
      if (status === "Cancelada") movement("Cancelación", reservation.closedAt!, `Reserva ${reservation.code} cancelada. Cantidad liberada.`);
      if (status === "No retirada") movement("Plazo finalizado", reservation.closedAt!, `La reserva ${reservation.code} terminó sin retiro. La oferta permanece cerrada.`);
    });
  }
  state.reservations.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  state.movements.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return state;
}

/** Account that made each sample reservation, so customers see their own history after signing in. */
export function reservationOwner(reservation: Reservation): string | null {
  const index = customers.indexOf(reservation.customerName ?? "");
  return index >= 0 ? customerId(index) : null;
}

export const contactMessages = [
  { id: "msg-1", name: "Mariela Coca", email: "mariela.coca@correo.bo", subject: "¿Puedo reservar para otra persona?", message: "Hola, quería saber si puedo reservar una oferta y que mi hermana pase a retirarla con el código. ¡Gracias!", hoursAgo: 5 },
  { id: "msg-2", name: "Rodrigo Villarroel", email: "rodrigo.villarroel@correo.bo", subject: "Panadería en Sacaba", message: "Tengo una panadería en Sacaba y me interesa sumarme. ¿Ya están trabajando con locales fuera de la ciudad?", hoursAgo: 27 },
  { id: "msg-3", name: "Gabriela Ortiz", email: "gabriela.ortiz@correo.bo", subject: "Sugerencia: filtro por precio máximo", message: "Me encanta la página. Sería útil poder filtrar las ofertas por un precio máximo, por ejemplo hasta Bs 15.", hoursAgo: 52 },
  { id: "msg-4", name: "Sergio Mendoza", email: "sergio.mendoza@correo.bo", subject: "Reserva no retirada", message: "Ayer no llegué a retirar mi reserva a tiempo por el tráfico. ¿Eso afecta mis próximas reservas?", hoursAgo: 80 },
];
