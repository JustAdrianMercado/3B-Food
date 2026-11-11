import { type SiteState, type Establishment, type Category, type Lot, type Movement, type Reservation, type Unit, localDate } from "./domain";

export const establishments: readonly Establishment[] = [
  { id: "est-espiga", slug: "la-espiga-de-tupuraya", name: "La Espiga de Tupuraya", type: "Restaurante", zone: "Tupuraya", address: "Av. Pando, zona Tupuraya, Cochabamba", description: "Panadería y cafetería de barrio con producción artesanal diaria. Al final de la tarde ofrece el pan y la repostería que no se vendió durante el día.", openingHours: "Lunes a sábado, 07:00–20:00", initials: "LE", color: "#e5b07b" },
  { id: "est-barrio", slug: "cocina-de-barrio", name: "Cocina de Barrio", type: "Restaurante", zone: "Cala Cala", address: "Av. América, zona Cala Cala, Cochabamba", description: "Almuerzos caseros preparados cada día. Las porciones que quedan después del servicio se ofrecen a un mejor precio para retirar por la tarde.", openingHours: "Lunes a viernes, 11:30–16:00", initials: "CB", color: "#a9bf94" },
  { id: "est-verde", slug: "mercado-verde", name: "Mercado Verde", type: "Supermercado", zone: "Centro", address: "Calle España, zona Centro, Cochabamba", description: "Supermercado del centro con frutas, verduras y lácteos. Publica productos con detalles de apariencia o próximos a su fecha de consumo.", openingHours: "Todos los días, 08:00–21:00", initials: "MV", color: "#d7bd76" },
  { id: "est-recoleta", slug: "mesa-de-la-recoleta", name: "Mesa de la Recoleta", type: "Restaurante", zone: "La Recoleta", address: "Av. Potosí, zona La Recoleta, Cochabamba", description: "Restaurante familiar de cocina cochabambina. Ofrece los platos del día que quedan al cierre del almuerzo y de la cena.", openingHours: "Martes a domingo, 12:00–22:00", initials: "MR", color: "#d7a797" },
  { id: "est-prado", slug: "cafe-el-prado", name: "Café El Prado", type: "Restaurante", zone: "El Prado", address: "Av. Ballivián, zona El Prado, Cochabamba", description: "Café sobre El Prado con panadería y postres propios. Publica la producción de la mañana que todavía puede disfrutarse en el día.", openingHours: "Todos los días, 08:00–21:30", initials: "CP", color: "#c9a98b" },
  { id: "est-queru", slug: "sabores-de-queru-queru", name: "Sabores de Queru Queru", type: "Restaurante", zone: "Queru Queru", address: "Av. Santa Cruz, zona Queru Queru, Cochabamba", description: "Comida tradicional y ensaladas frescas al mediodía. Las porciones restantes se ofrecen para retirar durante la tarde.", openingHours: "Lunes a sábado, 11:00–17:00", initials: "SQ", color: "#e0b49a" },
  { id: "est-sarco", slug: "super-sarco", name: "Súper Sarco", type: "Supermercado", zone: "Sarco", address: "Av. Simón López, zona Sarco, Cochabamba", description: "Supermercado de barrio con verduras, frutas y productos de despensa. Ofrece productos maduros o con fecha de consumo cercana.", openingHours: "Todos los días, 07:30–22:00", initials: "SS", color: "#b7c4a0" },
  { id: "est-muyurina", slug: "minimarket-muyurina", name: "Minimarket Muyurina", type: "Supermercado", zone: "Muyurina", address: "Av. Oquendo, zona Muyurina, Cochabamba", description: "Minimarket con lácteos, galletas y productos envasados. Publica artículos cerrados próximos a su fecha de consumo preferente.", openingHours: "Lunes a sábado, 08:00–22:00", initials: "MM", color: "#cdbf86" },
];

/** Hours are relative to `now`: negative values are in the past. */
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
  /** End of commercialization and pickup. */
  end: number;
  entered: number;
  image: string;
  dateType: Lot["dateType"];
  alert: number;
  /** Defaults to -0.75 h. */
  published?: number;
  /** Defaults to -0.5 h. */
  pickupFrom?: number;
  paused?: boolean;
}

interface SeedReservation {
  id: string;
  code: string;
  offerId: string;
  quantity: number;
  status: Reservation["status"];
  created: number;
  /** Required unless the reservation is still pending. */
  closed?: number;
}

/** Offers that are currently available, paused or sold out. */
const currentItems: SeedItem[] = [
  { id: "pan-artesanal", establishmentId: "est-espiga", name: "Una bolsa de cosas buenas", description: "Una selección de seis panes artesanales del día: marraquetas, pan integral y un toque dulce. El surtido depende de los excedentes disponibles. Conservar en un lugar fresco y seco. Contiene gluten; puede contener leche y huevo.", category: "Panadería", unit: "unidades", amount: 12, regular: 35, price: 18, end: 5, entered: -4, image: "/images/bread.webp", dateType: "Consumo preferente", alert: 360 },
  { id: "bowl-del-dia", establishmentId: "est-barrio", name: "Tu almuerzo, con otra oportunidad", description: "Bowl preparado con arroz, vegetales de temporada y pollo. Una porción completa elaborada hoy, conservada bajo refrigeración. Retirar para consumo inmediato; consultar al establecimiento por alérgenos.", category: "Cocina del día", unit: "porciones", amount: 10, regular: 38, price: 22, end: 3, entered: -2, image: "/images/bowl.webp", dateType: "Consumo preferente", alert: 240 },
  { id: "caja-de-huerta", establishmentId: "est-verde", name: "De la huerta, igual de buenas", description: "Mix de frutas y verduras de temporada con pequeñas imperfecciones de apariencia. Se comercializa por kilogramo. Los productos se seleccionan y revisan en el establecimiento; lavar antes de consumir y conservar según el producto.", category: "Frutas y verduras", unit: "kg", amount: 8, regular: 28, price: 15, end: 25, entered: -24, image: "/images/produce.webp", dateType: "Consumo preferente", alert: 1440 },
  { id: "merienda-dulce", establishmentId: "est-espiga", name: "Una pausa que sabe mejor", description: "Pack de dos croissants y una pieza de repostería de la producción del día. Ideal para compartir la merienda. Conservar en lugar fresco. Contiene gluten, leche y huevo; puede contener frutos secos.", category: "Panadería", unit: "unidades", amount: 8, regular: 40, price: 24, end: 7, entered: -3, image: "/images/pastry.webp", dateType: "Consumo preferente", alert: 240 },
  { id: "yogurt-natural", establishmentId: "est-verde", name: "Yogurt natural para tu desayuno", description: "Pack de dos yogures naturales de 200 g en su envase original. Producto próximo a su fecha declarada de vencimiento. Mantener refrigerado y trasladar sin interrumpir la cadena de frío. Contiene leche.", category: "Lácteos", unit: "unidades", amount: 10, regular: 30, price: 18, end: 30, entered: -48, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440 },
  { id: "pasta-de-la-casa", establishmentId: "est-recoleta", name: "El último plato de la casa", description: "Porción de pasta con salsa de tomates y vegetales preparada hoy. Se entrega refrigerada y en envase para llevar. Retirar para consumo inmediato, siguiendo las indicaciones de recalentado del establecimiento. Contiene gluten.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 45, price: 25, end: 4, entered: -3, image: "/images/pasta.webp", dateType: "Consumo preferente", alert: 300 },
  { id: "sillpancho-casero", establishmentId: "est-queru", name: "Sillpancho de la casa", description: "Porción de sillpancho con arroz, papa, ensalada fresca y huevo, preparada hoy al mediodía. Se entrega refrigerada en envase para llevar. Recalentar antes de consumir. Contiene huevo y gluten.", category: "Cocina del día", unit: "porciones", amount: 8, regular: 42, price: 25, end: 2.5, entered: -3, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 180 },
  { id: "ensalada-completa", establishmentId: "est-queru", name: "Ensalada completa del mediodía", description: "Bowl de lechuga, tomate cherry, garbanzos, camote asado, repollo morado y palta, con aderezo aparte. Preparado hoy y conservado en frío. Consumir el mismo día.", category: "Cocina del día", unit: "porciones", amount: 5, regular: 30, price: 16, end: 3, entered: -2, image: "/images/bowl.webp", dateType: "Consumo preferente", alert: 120 },
  { id: "pan-de-arroz", establishmentId: "est-prado", name: "Pan de arroz recién horneado", description: "Panes de arroz con queso horneados esta mañana. Se entregan en bolsa de papel; conservar en lugar fresco y seco y consumir en el día. Contiene leche y huevo.", category: "Panadería", unit: "unidades", amount: 15, regular: 4, price: 2, end: 6, entered: -5, image: "/images/bread.webp", dateType: "Consumo preferente", alert: 240 },
  { id: "medialunas-cafe", establishmentId: "est-prado", name: "Medialunas para el café", description: "Medialunas de manteca de la producción de esta mañana, empacadas por unidad. Ideales para acompañar el café de la tarde. Contiene gluten, leche y huevo.", category: "Panadería", unit: "unidades", amount: 10, regular: 8, price: 4.5, end: 4, entered: -4, image: "/images/pastry.webp", dateType: "Consumo preferente", alert: 120 },
  { id: "postre-frutilla", establishmentId: "est-prado", name: "Postre de frutilla en frasco", description: "Crema de leche con frutillas frescas en frasco de vidrio individual, elaborada hoy. Mantener refrigerado y consumir dentro de las próximas horas. Contiene leche.", category: "Lácteos", unit: "unidades", amount: 6, regular: 18, price: 10, end: 20, entered: -6, image: "/images/yogurt.webp", dateType: "Consumo preferente", alert: 360 },
  { id: "tallarin-de-la-casa", establishmentId: "est-barrio", name: "Tallarín con salsa de la casa", description: "Porción de tallarín con salsa de carne y tomate preparada hoy. Se entrega en envase para llevar; recalentar antes de consumir. Contiene gluten.", category: "Cocina del día", unit: "porciones", amount: 7, regular: 35, price: 20, end: 1.5, entered: -3, image: "/images/pasta.webp", dateType: "Consumo preferente", alert: 120 },
  { id: "verduras-semana", establishmentId: "est-sarco", name: "Bolsa de verduras para la semana", description: "Zanahoria, zapallo, tomate y cebolla seleccionados con detalles de apariencia. Se vende por kilogramo. Lavar antes de consumir y conservar en un lugar fresco.", category: "Frutas y verduras", unit: "kg", amount: 12, regular: 14, price: 8, end: 28, entered: -20, image: "/images/produce.webp", dateType: "Consumo preferente", alert: 1440 },
  { id: "platanos-maduros", establishmentId: "est-sarco", name: "Plátanos bien maduros", description: "Plátanos con la cáscara manchada propia de la maduración. Ideales para batidos, queques o consumo inmediato. Se venden por kilogramo.", category: "Frutas y verduras", unit: "kg", amount: 6, regular: 10, price: 5, end: 20, entered: -48, image: "/images/produce.webp", dateType: "Consumo preferente", alert: 1440 },
  { id: "quinua-real", establishmentId: "est-sarco", name: "Quinua real en bolsa de 1 kg", description: "Bolsas cerradas de quinua real de 1 kg con fecha de consumo preferente próxima. Envase íntegro y sin abrir. Conservar en un lugar seco.", category: "Despensa", unit: "unidades", amount: 9, regular: 32, price: 22, end: 30, entered: -120, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 1440 },
  { id: "postres-lacteos", establishmentId: "est-muyurina", name: "Postres lácteos individuales", description: "Flanes y postres de leche en envase individual sellado, con fecha de vencimiento próxima. Mantener refrigerados y trasladar sin interrumpir la cadena de frío. Contienen leche.", category: "Lácteos", unit: "unidades", amount: 12, regular: 9, price: 5, end: 26, entered: -72, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440 },
  { id: "galletas-cereales", establishmentId: "est-muyurina", name: "Galletas y cereales surtidos", description: "Paquetes cerrados de galletas y cereal con fecha de consumo preferente cercana. Envases íntegros. Contienen gluten; pueden contener leche y soya.", category: "Despensa", unit: "unidades", amount: 14, regular: 15, price: 9, end: 29, entered: -96, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 1440 },
  { id: "pollo-al-horno", establishmentId: "est-recoleta", name: "Pollo al horno con arroz", description: "Porción de pollo al horno con arroz graneado, vainitas y tomate, preparada hoy. Se entrega refrigerada en envase para llevar. Recalentar antes de consumir.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 45, price: 27, end: 3.5, entered: -3, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 240 },
  { id: "queso-fresco", establishmentId: "est-verde", name: "Queso fresco por kilo", description: "Queso fresco de la zona, cortado y envasado en el establecimiento. Mantener refrigerado. Oferta pausada mientras se revisa la cadena de frío. Contiene leche.", category: "Lácteos", unit: "kg", amount: 3, regular: 48, price: 32, end: 26, entered: -24, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440, paused: true },
  { id: "sopa-de-mani", establishmentId: "est-recoleta", name: "Sopa de maní del día", description: "Porción de sopa de maní con papas fritas, preparada hoy. Se entrega caliente en envase para llevar. Contiene maní.", category: "Cocina del día", unit: "porciones", amount: 4, regular: 20, price: 12, end: 2, entered: -3, image: "/images/bowl.webp", dateType: "Consumo preferente", alert: 120 },
];

/** Offers from previous days whose period already ended, so reports and history have some depth. */
const pastItems: SeedItem[] = [
  { id: "hist-pan-ayer", establishmentId: "est-espiga", name: "Pan surtido de ayer", description: "Selección de panes artesanales de la producción del día anterior. Conservar en un lugar fresco y seco. Contiene gluten.", category: "Panadería", unit: "unidades", amount: 15, regular: 30, price: 15, end: -18, entered: -26, published: -25, pickupFrom: -22, image: "/images/bread.webp", dateType: "Consumo preferente", alert: 360 },
  { id: "hist-almuerzo-ayer", establishmentId: "est-barrio", name: "Almuerzo completo de ayer", description: "Porciones de almuerzo con arroz, guiso de verduras y carne preparadas el día anterior. Retirar para consumo inmediato.", category: "Cocina del día", unit: "porciones", amount: 12, regular: 38, price: 20, end: -20, entered: -26, published: -24, pickupFrom: -23, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 240 },
  { id: "hist-queru-ayer", establishmentId: "est-queru", name: "Pique de la casa", description: "Porciones de pique con carne, salchicha, papa y locoto preparadas el día anterior. Recalentar antes de consumir.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 50, price: 30, end: -21, entered: -26, published: -25, pickupFrom: -24, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 180 },
  { id: "hist-frutas-temporada", establishmentId: "est-verde", name: "Frutas de temporada", description: "Mandarinas, manzanas y duraznos con detalles de apariencia, vendidos por kilogramo. Lavar antes de consumir.", category: "Frutas y verduras", unit: "kg", amount: 10, regular: 20, price: 11, end: -44, entered: -70, published: -50, pickupFrom: -49, image: "/images/produce.webp", dateType: "Consumo preferente", alert: 1440 },
  { id: "hist-pasta-recoleta", establishmentId: "est-recoleta", name: "Lasaña de verduras", description: "Porciones de lasaña de verduras preparadas el mismo día y entregadas refrigeradas. Contiene gluten y leche.", category: "Cocina del día", unit: "porciones", amount: 8, regular: 45, price: 26, end: -45, entered: -50, published: -49, pickupFrom: -48, image: "/images/pasta.webp", dateType: "Consumo preferente", alert: 300 },
  { id: "hist-prado-panaderia", establishmentId: "est-prado", name: "Cuñapés y empanadas de queso", description: "Producción de panadería del día anterior, empacada por unidad. Contiene leche y huevo.", category: "Panadería", unit: "unidades", amount: 20, regular: 5, price: 2.5, end: -66, entered: -72, published: -71, pickupFrom: -70, image: "/images/pastry.webp", dateType: "Consumo preferente", alert: 240 },
  { id: "hist-sarco-lacteos", establishmentId: "est-sarco", name: "Leche saborizada de 1 litro", description: "Envases cerrados de leche saborizada con fecha de vencimiento próxima. Mantener refrigerados. Contiene leche.", category: "Lácteos", unit: "unidades", amount: 10, regular: 12, price: 7, end: -68, entered: -120, published: -96, pickupFrom: -95, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440 },
  { id: "hist-muyurina-despensa", establishmentId: "est-muyurina", name: "Fideo y arroz en paquete", description: "Paquetes cerrados de fideo y arroz con fecha de consumo preferente próxima. Envases íntegros. Contiene gluten.", category: "Despensa", unit: "unidades", amount: 8, regular: 14, price: 9, end: -140, entered: -240, published: -150, pickupFrom: -149, image: "/images/pantry.webp", dateType: "Consumo preferente", alert: 1440 },
];

const seedReservations: SeedReservation[] = [
  { id: "res-demo-retirada", code: "ECO-A104B2", offerId: "pan-artesanal", quantity: 2, status: "Retirada", created: -0.4, closed: -0.2 },
  { id: "res-demo-pendiente", code: "ECO-C205D3", offerId: "pan-artesanal", quantity: 1, status: "Reservada", created: -0.2 },
  { id: "res-demo-bowl", code: "ECO-E306F4", offerId: "bowl-del-dia", quantity: 2, status: "Retirada", created: -0.25, closed: -0.1 },
  { id: "res-demo-fruta", code: "ECO-G407H5", offerId: "caja-de-huerta", quantity: 1.5, status: "Retirada", created: -0.3, closed: -0.1 },
  { id: "res-sillpancho-1", code: "ECO-K510M2", offerId: "sillpancho-casero", quantity: 2, status: "Retirada", created: -0.6, closed: -0.3 },
  { id: "res-sillpancho-2", code: "ECO-K511N3", offerId: "sillpancho-casero", quantity: 1, status: "Reservada", created: -0.15 },
  { id: "res-tallarin-1", code: "ECO-P612Q4", offerId: "tallarin-de-la-casa", quantity: 2, status: "Reservada", created: -0.35 },
  { id: "res-verduras-1", code: "ECO-R713S5", offerId: "verduras-semana", quantity: 2.5, status: "Retirada", created: -0.6, closed: -0.4 },
  { id: "res-verduras-2", code: "ECO-R714T6", offerId: "verduras-semana", quantity: 1, status: "Reservada", created: -0.1 },
  { id: "res-medialunas-1", code: "ECO-U815V7", offerId: "medialunas-cafe", quantity: 4, status: "Retirada", created: -0.55, closed: -0.35 },
  { id: "res-medialunas-2", code: "ECO-U816W8", offerId: "medialunas-cafe", quantity: 1, status: "Cancelada", created: -0.5, closed: -0.4 },
  { id: "res-postres-1", code: "ECO-X917Y9", offerId: "postres-lacteos", quantity: 3, status: "Retirada", created: -0.5, closed: -0.25 },
  { id: "res-sopa-1", code: "ECO-Z118A1", offerId: "sopa-de-mani", quantity: 3, status: "Retirada", created: -0.6, closed: -0.3 },
  { id: "res-sopa-2", code: "ECO-Z119B2", offerId: "sopa-de-mani", quantity: 1, status: "Reservada", created: -0.2 },
  { id: "res-hist-pan-1", code: "ECO-H201C3", offerId: "hist-pan-ayer", quantity: 6, status: "Retirada", created: -24, closed: -21 },
  { id: "res-hist-pan-2", code: "ECO-H202D4", offerId: "hist-pan-ayer", quantity: 4, status: "Retirada", created: -23, closed: -19 },
  { id: "res-hist-pan-3", code: "ECO-H203E5", offerId: "hist-pan-ayer", quantity: 2, status: "Cancelada", created: -23.5, closed: -22.5 },
  { id: "res-hist-pan-4", code: "ECO-H204F6", offerId: "hist-pan-ayer", quantity: 1, status: "No retirada", created: -20, closed: -18 },
  { id: "res-hist-alm-1", code: "ECO-H305G7", offerId: "hist-almuerzo-ayer", quantity: 5, status: "Retirada", created: -23.5, closed: -22 },
  { id: "res-hist-alm-2", code: "ECO-H306J8", offerId: "hist-almuerzo-ayer", quantity: 3, status: "Retirada", created: -22.5, closed: -21 },
  { id: "res-hist-alm-3", code: "ECO-H307K9", offerId: "hist-almuerzo-ayer", quantity: 2, status: "No retirada", created: -22, closed: -20 },
  { id: "res-hist-queru-1", code: "ECO-H408L1", offerId: "hist-queru-ayer", quantity: 4, status: "Retirada", created: -24.5, closed: -23 },
  { id: "res-hist-queru-2", code: "ECO-H409M2", offerId: "hist-queru-ayer", quantity: 2, status: "Retirada", created: -24, closed: -22 },
  { id: "res-hist-fruta-1", code: "ECO-H510N3", offerId: "hist-frutas-temporada", quantity: 3.5, status: "Retirada", created: -49.5, closed: -47 },
  { id: "res-hist-fruta-2", code: "ECO-H511P4", offerId: "hist-frutas-temporada", quantity: 2, status: "Retirada", created: -48, closed: -46 },
  { id: "res-hist-fruta-3", code: "ECO-H512Q5", offerId: "hist-frutas-temporada", quantity: 1, status: "Cancelada", created: -47, closed: -46.5 },
  { id: "res-hist-lasana-1", code: "ECO-H613R6", offerId: "hist-pasta-recoleta", quantity: 4, status: "Retirada", created: -48.5, closed: -47 },
  { id: "res-hist-lasana-2", code: "ECO-H614S7", offerId: "hist-pasta-recoleta", quantity: 2, status: "Retirada", created: -48, closed: -46 },
  { id: "res-hist-lasana-3", code: "ECO-H615T8", offerId: "hist-pasta-recoleta", quantity: 1, status: "No retirada", created: -47, closed: -45 },
  { id: "res-hist-prado-1", code: "ECO-H716U9", offerId: "hist-prado-panaderia", quantity: 8, status: "Retirada", created: -70.5, closed: -69 },
  { id: "res-hist-prado-2", code: "ECO-H717V1", offerId: "hist-prado-panaderia", quantity: 5, status: "Retirada", created: -70, closed: -68 },
  { id: "res-hist-prado-3", code: "ECO-H718W2", offerId: "hist-prado-panaderia", quantity: 3, status: "Cancelada", created: -69.5, closed: -69 },
  { id: "res-hist-sarco-1", code: "ECO-H819X3", offerId: "hist-sarco-lacteos", quantity: 6, status: "Retirada", created: -94, closed: -90 },
  { id: "res-hist-sarco-2", code: "ECO-H820Y4", offerId: "hist-sarco-lacteos", quantity: 2, status: "Cancelada", created: -93, closed: -92 },
  { id: "res-hist-muyu-1", code: "ECO-H921Z5", offerId: "hist-muyurina-despensa", quantity: 5, status: "Retirada", created: -148, closed: -145 },
];

const customerNames = ["Ana Rojas", "Luis Fernández", "Carla Vargas", "Diego Mamani", "Sofía Céspedes", "Mateo Arze", "Valeria Quiroga", "Jorge Torrico"];

/** Relative dates keep the sample data current whenever it is generated. */
export function createSeed(now = Date.now()): SiteState {
  const iso = (hours: number) => new Date(now + hours * 3_600_000).toISOString();
  const items = [...currentItems, ...pastItems];
  const state: SiteState = {
    establishments: [...establishments], selectedEstablishmentId: "est-espiga",
    lots: items.map((item) => ({
      id: `lot-${item.id}`, establishmentId: item.establishmentId, name: item.name, description: item.description,
      category: item.category, unit: item.unit, initialQuantity: item.amount, availableQuantity: item.amount,
      entryAt: iso(item.entered), dateType: item.dateType, foodDate: localDate(new Date(now + item.end * 3_600_000)),
      commercializationEndsAt: iso(item.end), pickupStartsAt: iso(item.pickupFrom ?? -0.5), pickupEndsAt: iso(item.end),
      alertMinutes: item.alert, suitabilityDeclared: true,
    })),
    offers: items.map((item) => ({ id: item.id, lotId: `lot-${item.id}`, regularPrice: item.regular, price: item.price, image: item.image, publishedAt: iso(item.published ?? -0.75), paused: item.paused ?? false })),
    reservations: seedReservations.map((item, index) => ({
      id: item.id, code: item.code, offerId: item.offerId, quantity: item.quantity,
      unitPrice: items.find((offer) => offer.id === item.offerId)!.price,
      createdAt: iso(item.created), status: item.status, closedAt: item.closed === undefined ? null : iso(item.closed),
      customerName: customerNames[index % customerNames.length], mine: false,
    })),
    movements: items.map((item) => ({ id: `mov-pub-${item.id}`, lotId: `lot-${item.id}`, reservationId: null, type: "Publicación", quantity: item.amount, createdAt: iso(item.published ?? -0.75), detail: `Se publicó ${item.name}.` })),
  };
  for (const reservation of state.reservations) {
    const offer = state.offers.find((item) => item.id === reservation.offerId)!;
    const lot = state.lots.find((item) => item.id === offer.lotId)!;
    // Cancelled and uncollected reservations released their quantity, so only active ones reduce stock.
    if (reservation.status === "Reservada" || reservation.status === "Retirada") lot.availableQuantity = Math.round((lot.availableQuantity - reservation.quantity) * 1000) / 1000;
    const movement = (type: Movement["type"], detail: string) => state.movements.push({ id: `mov-${type === "Reserva" ? "res" : "close"}-${reservation.id}`, lotId: lot.id, reservationId: reservation.id, type, quantity: reservation.quantity, createdAt: type === "Reserva" ? reservation.createdAt : reservation.closedAt!, detail });
    movement("Reserva", `Reserva ${reservation.code} registrada.`);
    if (reservation.status === "Retirada") movement("Retiro", `Retiro ${reservation.code} confirmado manualmente.`);
    if (reservation.status === "Cancelada") movement("Cancelación", `Reserva ${reservation.code} cancelada. Cantidad liberada.`);
    if (reservation.status === "No retirada") movement("Plazo finalizado", `La reserva ${reservation.code} terminó sin retiro. La oferta permanece cerrada.`);
  }
  state.reservations.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  state.movements.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return state;
}
