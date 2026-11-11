import { strict as assert } from "node:assert";
import { test } from "node:test";
import { effectiveEnd, getMetrics, localDate, lotUrgency, offerStatus, reportCsv, validateLot, type LotInput } from "../src/lib/domain";
import { createSeed } from "../src/lib/seed";

const now = Date.parse("2026-11-12T14:00:00.000Z");
const validLot = (): LotInput => ({ establishmentId: "est-espiga", name: "Pack de pan del día", description: "Seis panes de la producción del día. Conservar en lugar fresco. Contiene gluten.", category: "Panadería", unit: "unidades", quantity: 3, regularPrice: 30, price: 18, entryAt: "2026-11-12T04:00:00.000Z", dateType: "Límite de oferta", foodDate: "2026-11-12", commercializationEndsAt: "2026-11-12T22:00:00.000Z", pickupStartsAt: "2026-11-12T14:00:00.000Z", pickupEndsAt: "2026-11-12T21:00:00.000Z", alertMinutes: 120, suitabilityDeclared: true });

test("los datos de ejemplo cuadran existencias con las reservas activas", () => {
  const state = createSeed(now);
  for (const lot of state.lots) {
    const offer = state.offers.find((item) => item.lotId === lot.id)!;
    const active = state.reservations.filter((item) => item.offerId === offer.id && (item.status === "Reservada" || item.status === "Retirada")).reduce((total, item) => total + item.quantity, 0);
    assert.ok(Math.abs(active + lot.availableQuantity - lot.initialQuantity) < 0.001, `Existencias inconsistentes en ${lot.id}`);
    assert.ok(offer.price < offer.regularPrice);
  }
  assert.equal(new Set(state.reservations.map((item) => item.code)).size, state.reservations.length);
  assert.ok(state.reservations.every((item) => (item.status === "Reservada") === (item.closedAt === null)));
});

test("el estado de una oferta respeta plazo, pausa y existencias", () => {
  const state = createSeed(now);
  const lot = state.lots.find((item) => item.id === "lot-pan-artesanal")!;
  const offer = state.offers.find((item) => item.lotId === lot.id)!;
  assert.equal(offerStatus(offer, lot, now), "Disponible");
  assert.equal(offerStatus({ ...offer, paused: true }, lot, now), "Pausada");
  assert.equal(offerStatus(offer, { ...lot, availableQuantity: 0 }, now), "Agotada");
  assert.equal(offerStatus({ ...offer, paused: true }, lot, effectiveEnd(lot)), "Finalizada", "El plazo vencido prevalece sobre la pausa");
  assert.equal(lotUrgency(lot, effectiveEnd(lot) - lot.alertMinutes * 60_000), "pronto");
  assert.equal(lotUrgency(lot, effectiveEnd(lot) - lot.alertMinutes * 60_000 - 1), "en-plazo");
  assert.equal(lotUrgency(lot, effectiveEnd(lot)), "finalizada");
});

test("el plazo efectivo es el menor entre límite comercial, retiro y fecha alimentaria", () => {
  const lot = { ...createSeed(now).lots[0], commercializationEndsAt: "2026-11-13T10:00:00.000Z", pickupEndsAt: "2026-11-13T10:00:00.000Z", foodDate: "2026-11-12" };
  assert.equal(new Date(effectiveEnd(lot)).toISOString(), "2026-11-13T03:59:59.999Z");
});

test("la publicación rechaza fechas vencidas, horarios incoherentes y falta de declaración", () => {
  const input = validLot();
  validateLot(input, now);
  for (const changes of [
    { foodDate: "2026-11-11" }, { entryAt: "2026-11-13T04:00:00.000Z" },
    { pickupEndsAt: "2026-11-12T23:00:00.000Z" }, { commercializationEndsAt: "2026-11-12T13:00:00.000Z" },
    { suitabilityDeclared: false }, { quantity: 1.5 }, { price: 31 }, { name: "ab" },
    { commercializationEndsAt: "2026-11-13T06:00:00.000Z", pickupEndsAt: "2026-11-13T05:00:00.000Z", foodDate: "2026-11-13" },
  ]) assert.throws(() => validateLot({ ...input, ...changes }, now));
  validateLot({ ...input, unit: "kg", quantity: 1.5 }, now);
});

test("los reportes separan unidades y no cuentan reservas pendientes como retiros", () => {
  const state = createSeed(now);
  const metrics = getMetrics(state);
  assert.equal(metrics.length, 3);
  assert.deepEqual(metrics.find((item) => item.unit === "unidades"), { unit: "unidades", published: 149, reserved: 1, collected: 43, cancelled: 8, uncollected: 1, proportion: 28.9 });
  assert.deepEqual(metrics.find((item) => item.unit === "porciones"), { unit: "porciones", published: 72, reserved: 4, collected: 27, cancelled: 0, uncollected: 3, proportion: 37.5 });
  assert.equal(metrics.find((item) => item.unit === "kg")!.collected, 9.5);
  assert.equal(getMetrics(state, { establishmentId: "est-espiga" })[0].unit, "unidades");
  assert.deepEqual(getMetrics(state, { since: now + 1 }), []);
});

test("el CSV incluye unidades separadas y escapa comillas", () => {
  const csv = reportCsv(getMetrics(createSeed(now)), 'Local "de prueba"', new Date(now).toISOString());
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes('Local ""de prueba""'));
  assert.ok(csv.includes('"kg";"39";"1";"9.5"'));
  assert.ok(csv.includes("Reporte de aprovechamiento"));
});

test("las fechas usan la hora de Cochabamba aunque el equipo esté en UTC", () => {
  assert.equal(localDate(new Date("2026-11-12T02:00:00.000Z")), "2026-11-11");
});
