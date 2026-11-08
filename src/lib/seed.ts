import { type DemoState, type Establishment, type Category, type Unit, localDate } from "./domain";

export const establishments: readonly Establishment[] = [
  { id: "est-espiga", name: "La Espiga de Tupuraya", type: "Restaurante", zone: "Tupuraya", address: "Av. Pando, zona Tupuraya, Cochabamba", initials: "LE", color: "#e5b07b" },
  { id: "est-barrio", name: "Cocina de Barrio", type: "Restaurante", zone: "Cala Cala", address: "Av. América, zona Cala Cala, Cochabamba", initials: "CB", color: "#a9bf94" },
  { id: "est-verde", name: "Mercado Verde", type: "Supermercado", zone: "Centro", address: "Calle España, zona Centro, Cochabamba", initials: "MV", color: "#d7bd76" },
  { id: "est-recoleta", name: "Mesa de la Recoleta", type: "Restaurante", zone: "La Recoleta", address: "Av. Potosí, zona La Recoleta, Cochabamba", initials: "MR", color: "#d7a797" },
];

export const categoryImages: Record<Category, string> = {
  "Cocina del día": "/images/bowl.webp", "Panadería": "/images/bread.webp",
  "Frutas y verduras": "/images/produce.webp", "Lácteos": "/images/yogurt.webp", "Despensa": "/images/pantry.webp",
};

/** Relative dates make the same demonstration usable on presentation day. All businesses are fictional. */
export function createSeed(now = Date.now()): DemoState {
  const iso = (hours: number) => new Date(now + hours * 3_600_000).toISOString();
  const items: { id: string; establishmentId: string; name: string; description: string; category: Category; unit: Unit; amount: number; regular: number; price: number; end: number; entered: number; image: string; dateType: "Límite de oferta" | "Consumo preferente" | "Vencimiento"; alert: number }[] = [
    { id: "pan-artesanal", establishmentId: "est-espiga", name: "Una bolsa de cosas buenas", description: "Una selección de seis panes artesanales del día: marraquetas, pan integral y un toque dulce. El surtido depende de los excedentes disponibles. Conservar en un lugar fresco y seco. Contiene gluten; puede contener leche y huevo.", category: "Panadería", unit: "unidades", amount: 12, regular: 35, price: 18, end: 5, entered: -4, image: "/images/bread.webp", dateType: "Consumo preferente", alert: 360 },
    { id: "bowl-del-dia", establishmentId: "est-barrio", name: "Tu almuerzo, con otra oportunidad", description: "Bowl preparado con arroz, vegetales de temporada y pollo. Una porción completa elaborada hoy, conservada bajo refrigeración. Retirar para consumo inmediato; consultar al establecimiento por alérgenos.", category: "Cocina del día", unit: "porciones", amount: 10, regular: 38, price: 22, end: 3, entered: -2, image: "/images/bowl.webp", dateType: "Consumo preferente", alert: 240 },
    { id: "caja-de-huerta", establishmentId: "est-verde", name: "De la huerta, igual de buenas", description: "Mix de frutas y verduras de temporada con pequeñas imperfecciones de apariencia. Se comercializa por kilogramo. Los productos se seleccionan y revisan en el establecimiento; lavar antes de consumir y conservar según el producto.", category: "Frutas y verduras", unit: "kg", amount: 8, regular: 28, price: 15, end: 25, entered: -24, image: "/images/produce.webp", dateType: "Consumo preferente", alert: 1440 },
    { id: "merienda-dulce", establishmentId: "est-espiga", name: "Una pausa que sabe mejor", description: "Pack de dos croissants y una pieza de repostería de la producción del día. Ideal para compartir la merienda. Conservar en lugar fresco. Contiene gluten, leche y huevo; puede contener frutos secos.", category: "Panadería", unit: "unidades", amount: 8, regular: 40, price: 24, end: 7, entered: -3, image: "/images/pastry.webp", dateType: "Consumo preferente", alert: 240 },
    { id: "yogurt-natural", establishmentId: "est-verde", name: "Yogurt natural para tu desayuno", description: "Pack de dos yogures naturales de 200 g en su envase original. Producto próximo a su fecha declarada de vencimiento. Mantener refrigerado y trasladar sin interrumpir la cadena de frío. Contiene leche.", category: "Lácteos", unit: "unidades", amount: 10, regular: 30, price: 18, end: 30, entered: -48, image: "/images/yogurt.webp", dateType: "Vencimiento", alert: 1440 },
    { id: "pasta-de-la-casa", establishmentId: "est-recoleta", name: "El último plato de la casa", description: "Porción de pasta con salsa de tomates y vegetales preparada hoy. Se entrega refrigerada y en envase para llevar. Retirar para consumo inmediato, siguiendo las indicaciones de recalentado del establecimiento. Contiene gluten.", category: "Cocina del día", unit: "porciones", amount: 6, regular: 45, price: 25, end: 4, entered: -3, image: "/images/pasta.webp", dateType: "Consumo preferente", alert: 300 },
  ];
  const state: DemoState = {
    version: 1, startedAt: iso(0), selectedEstablishmentId: "est-espiga",
    lots: items.map((item) => ({
      id: `lot-${item.id}`, establishmentId: item.establishmentId, name: item.name, description: item.description,
      category: item.category, unit: item.unit, initialQuantity: item.amount, availableQuantity: item.amount,
      entryAt: iso(item.entered), dateType: item.dateType, foodDate: localDate(new Date(now + item.end * 3_600_000)),
      commercializationEndsAt: iso(item.end), pickupStartsAt: iso(-0.5), pickupEndsAt: iso(item.end),
      alertMinutes: item.alert, suitabilityDeclared: true,
    })),
    offers: items.map((item) => ({ id: item.id, lotId: `lot-${item.id}`, regularPrice: item.regular, price: item.price, image: item.image, publishedAt: iso(-0.75), paused: false })),
    reservations: [
      { id: "res-demo-retirada", code: "ECO-A104B2", offerId: "pan-artesanal", quantity: 2, unitPrice: 18, createdAt: iso(-0.4), status: "Retirada", closedAt: iso(-0.2) },
      { id: "res-demo-pendiente", code: "ECO-C205D3", offerId: "pan-artesanal", quantity: 1, unitPrice: 18, createdAt: iso(-0.2), status: "Reservada", closedAt: null },
      { id: "res-demo-bowl", code: "ECO-E306F4", offerId: "bowl-del-dia", quantity: 2, unitPrice: 22, createdAt: iso(-0.25), status: "Retirada", closedAt: iso(-0.1) },
      { id: "res-demo-fruta", code: "ECO-G407H5", offerId: "caja-de-huerta", quantity: 1.5, unitPrice: 15, createdAt: iso(-0.3), status: "Retirada", closedAt: iso(-0.1) },
    ],
    movements: items.map((item) => ({ id: `mov-pub-${item.id}`, lotId: `lot-${item.id}`, reservationId: null, type: "Publicación", quantity: item.amount, createdAt: iso(-0.75), detail: `Se publicó ${item.name}.` })),
  };
  for (const reservation of state.reservations) {
    const offer = state.offers.find((item) => item.id === reservation.offerId)!;
    const lot = state.lots.find((item) => item.id === offer.lotId)!;
    lot.availableQuantity -= reservation.quantity;
    state.movements.unshift({ id: `mov-res-${reservation.id}`, lotId: lot.id, reservationId: reservation.id, type: "Reserva", quantity: reservation.quantity, createdAt: reservation.createdAt, detail: `Reserva ${reservation.code} registrada.` });
    if (reservation.status === "Retirada") state.movements.unshift({ id: `mov-ret-${reservation.id}`, lotId: lot.id, reservationId: reservation.id, type: "Retiro", quantity: reservation.quantity, createdAt: reservation.closedAt!, detail: `Retiro ${reservation.code} confirmado manualmente.` });
  }
  state.movements.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return state;
}
