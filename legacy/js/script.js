// =========================================================
// DATOS INICIALES DEL PILOTO EN COCHABAMBA
// =========================================================
let lotesOfertas = [
  {
    idLote: "LOT-101",
    nombre: "Pack Panadería Artesanal (Surtido 6 u.)",
    establecimiento: "Panadería & Café Tupuraya",
    zona: "Tupuraya",
    cantidadInicial: 8,
    cantidadDisponible: 5,
    unidad: "porciones",
    precioBase: 30,
    precioOferta: 18,
    fechaIngreso: "2026-10-22",
    fechaLimite: "2026-10-23",
    tipoLimite: "Límite de oferta",
    horarioRetiro: "19:30 a 21:30",
    estado: "Activa"
  },
  {
    idLote: "LOT-102",
    nombre: "Bandeja Almuerzo Ejecutivo del Día",
    establecimiento: "Restaurante Sabores del Valle",
    zona: "Cala Cala",
    cantidadInicial: 10,
    cantidadDisponible: 4,
    unidad: "porciones",
    precioBase: 35,
    precioOferta: 20,
    fechaIngreso: "2026-10-23",
    fechaLimite: "2026-10-23",
    tipoLimite: "Límite de oferta",
    horarioRetiro: "15:00 a 16:30",
    estado: "Activa"
  },
  {
    idLote: "LOT-103",
    nombre: "Pack Yogurt Griego y Queso Fresco",
    establecimiento: "Supermercado Mercantil Centro",
    zona: "Centro",
    cantidadInicial: 12,
    cantidadDisponible: 6,
    unidad: "unidades",
    precioBase: 45,
    precioOferta: 27,
    fechaIngreso: "2026-10-18",
    fechaLimite: "2026-10-25",
    tipoLimite: "Vencimiento próximo",
    horarioRetiro: "09:00 a 20:00",
    estado: "Activa"
  },
  {
    idLote: "LOT-104",
    nombre: "Caja Frutas y Verduras Apariencia Subóptima",
    establecimiento: "Minimarket EcoFresco Recoleta",
    zona: "La Recoleta",
    cantidadInicial: 6,
    cantidadDisponible: 3,
    unidad: "unidades",
    precioBase: 40,
    precioOferta: 22,
    fechaIngreso: "2026-10-20",
    fechaLimite: "2026-10-24",
    tipoLimite: "Consumo preferente",
    horarioRetiro: "10:00 a 19:00",
    estado: "Activa"
  }
];

let historialReservas = [
  {
    codigo: "RES-801",
    idLote: "LOT-101",
    producto: "Pack Panadería Artesanal (Surtido 6 u.)",
    establecimiento: "Panadería & Café Tupuraya",
    cantidad: 3,
    horario: "19:30 a 21:30",
    estado: "Retirado"
  },
  {
    codigo: "RES-802",
    idLote: "LOT-102",
    producto: "Bandeja Almuerzo Ejecutivo del Día",
    establecimiento: "Restaurante Sabores del Valle",
    cantidad: 6,
    horario: "15:00 a 16:30",
    estado: "Reservado"
  }
];

// =========================================================
// 1. RENDERIZAR CATÁLOGO DE OFERTAS (CONSUMIDOR)
// =========================================================
function renderizarOfertas() {
  const contenedor = document.getElementById("contenedor-ofertas");
  const filtroZona = document.getElementById("filtro-zona").value;
  const filtroTipo = document.getElementById("filtro-tipo").value;

  contenedor.innerHTML = "";

  const ofertasFiltradas = lotesOfertas.filter(item => {
    const coincideZona = filtroZona === "todas" || item.zona === filtroZona;
    const coincideTipo = filtroTipo === "todos" || item.tipoLimite === filtroTipo;
    return coincideZona && coincideTipo;
  });

  ofertasFiltradas.forEach(oferta => {
    const descuentoPct = Math.round(((oferta.precioBase - oferta.precioOferta) / oferta.precioBase) * 100);
    const claseEstado = oferta.cantidadDisponible > 0 ? "activa" : "agotada";
    const textoEstado = oferta.cantidadDisponible > 0 ? "Oferta Activa" : "Agotada";

    const card = document.createElement("div");
    card.className = "offer-card";
    card.innerHTML = `
      <div>
        <div class="offer-card__header">
          <span class="zone-tag">📍 ${oferta.zona}</span>
          <span class="status-tag ${claseEstado}">${textoEstado} (-${descuentoPct}%)</span>
        </div>
        <h3 class="offer-card__title">${oferta.nombre}</h3>
        <p class="offer-card__vendor">🏪 ${oferta.establecimiento}</p>
        <div class="offer-card__details">
          <p><strong>Disponibles:</strong> ${oferta.cantidadDisponible} de ${oferta.cantidadInicial} ${oferta.unidad}</p>
          <p><strong>Criterio:</strong> ${oferta.tipoLimite} (${oferta.fechaLimite})</p>
          <p><strong>Horario retiro en local:</strong> ${oferta.horarioRetiro}</p>
        </div>
      </div>
      <div class="offer-card__footer">
        <div class="price-box">
          <span class="old-price">Bs ${oferta.precioBase}</span>
          <span class="new-price">Bs ${oferta.precioOferta}</span>
        </div>
        <button class="btn btn--primary btn--small" 
          ${oferta.cantidadDisponible === 0 ? "disabled" : ""}
          onclick="reservarOferta('${oferta.idLote}')">
          ${oferta.cantidadDisponible > 0 ? "Reservar 1 u." : "Sin Stock"}
        </button>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

// =========================================================
// 2. RESERVAR OFERTA (CONTROL DE DISPONIBILIDAD)
// =========================================================
function reservarOferta(idLote) {
  const lote = lotesOfertas.find(l => l.idLote === idLote);
  if (!lote || lote.cantidadDisponible <= 0) return;

  // Reducir stock disponible para evitar sobre-reserva
  lote.cantidadDisponible -= 1;
  if (lote.cantidadDisponible === 0) {
    lote.estado = "Agotada";
  }

  // Crear registro en el historial de reservas
  const nuevoCodigo = "RES-" + Math.floor(100 + Math.random() * 900);
  historialReservas.unshift({
    codigo: nuevoCodigo,
    idLote: lote.idLote,
    producto: lote.nombre,
    establecimiento: lote.establecimiento,
    cantidad: 1,
    horario: lote.horarioRetiro,
    estado: "Reservado"
  });

  actualizarTodo();
  alert(`Reserva confirmada (${nuevoCodigo}). Recuerda pasar por ${lote.establecimiento} de ${lote.horarioRetiro}.`);
}

// =========================================================
// 3. TABLA DE LOTES (ORDEN PEPS VS FECHA LÍMITE)
// =========================================================
function renderizarTablaLotes(criterio = "limite") {
  const tbody = document.getElementById("tabla-lotes-body");
  tbody.innerHTML = "";

  const lotesOrdenados = [...lotesOfertas].sort((a, b) => {
    if (criterio === "peps") {
      return new Date(a.fechaIngreso) - new Date(b.fechaIngreso);
    } else {
      return new Date(a.fechaLimite) - new Date(b.fechaLimite);
    }
  });

  lotesOrdenados.forEach(lote => {
    const hoy = new Date("2026-10-23");
    const limite = new Date(lote.fechaLimite);
    const diffDias = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));

    let alertaBadge = `<span style="color:#74c69d;">En plazo (${diffDias} d)</span>`;
    if (diffDias <= 0) {
      alertaBadge = `<span style="color:#ff758f; font-weight:700;">⚠️ Prioridad Hoy</span>`;
    } else if (diffDias <= 2) {
      alertaBadge = `<span style="color:#f4a261; font-weight:700;">⚡ Próximo (${diffDias} d)</span>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${lote.idLote}</strong></td>
      <td>${lote.nombre}<br><small style="color:#a3b8aa">${lote.establecimiento}</small></td>
      <td>${lote.cantidadDisponible} / ${lote.cantidadInicial}</td>
      <td>${lote.fechaIngreso}</td>
      <td>${lote.fechaLimite} <br><small>(${lote.tipoLimite})</small></td>
      <td>${alertaBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =========================================================
// 4. HISTORIAL DE RESERVAS Y CONFIRMACIÓN MANUAL DE RETIRO
// =========================================================
function renderizarReservasYReportes() {
  const tbody = document.getElementById("tabla-reservas-body");
  tbody.innerHTML = "";

  historialReservas.forEach((res, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${res.codigo}</strong></td>
      <td>${res.producto}<br><small style="color:#a3b8aa">${res.establecimiento}</small></td>
      <td>${res.cantidad}</td>
      <td>${res.horario}</td>
      <td><strong>${res.estado}</strong></td>
      <td>
        ${res.estado === "Reservado" ? `
          <button class="btn btn--primary btn--small" onclick="confirmarRetiro(${index})">Confirmar Retiro</button>
          <button class="btn btn--outline btn--small" onclick="cancelarReserva(${index})">Cancelar</button>
        ` : `<span style="color:#a3b8aa">Operación cerrada</span>`}
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Cálculo de Indicadores del Piloto (Apartado 8.1 del Informe)
  const totalPublicado = lotesOfertas.reduce((acc, l) => acc + l.cantidadInicial, 0);
  const totalReservado = historialReservas
    .filter(r => r.estado === "Reservado")
    .reduce((acc, r) => acc + r.cantidad, 0);
  const totalRetirado = historialReservas
    .filter(r => r.estado === "Retirado")
    .reduce((acc, r) => acc + r.cantidad, 0);

  const proporcion = totalPublicado > 0 ? ((totalRetirado / totalPublicado) * 100).toFixed(1) : 0;

  document.getElementById("kpi-publicado").textContent = totalPublicado;
  document.getElementById("kpi-reservado").textContent = totalReservado;
  document.getElementById("kpi-retirado").textContent = totalRetirado;
  document.getElementById("kpi-proporcion").textContent = `${proporcion}%`;
}

function confirmarRetiro(index) {
  historialReservas[index].estado = "Retirado";
  actualizarTodo();
}

function cancelarReserva(index) {
  const reserva = historialReservas[index];
  reserva.estado = "Cancelada";

  // Devolver stock al lote si sigue vigente
  const lote = lotesOfertas.find(l => l.idLote === reserva.idLote);
  if (lote) {
    lote.cantidadDisponible += reserva.cantidad;
    lote.estado = "Activa";
  }
  actualizarTodo();
}

// =========================================================
// 5. EVENTOS Y FORMULARIO DE NUEVO LOTE
// =========================================================
document.getElementById("form-lote").addEventListener("submit", function(e) {
  e.preventDefault();
  const cant = parseInt(document.getElementById("prod-cantidad").value);

  const nuevoLote = {
    idLote: "LOT-" + (100 + lotesOfertas.length + 1),
    nombre: document.getElementById("prod-nombre").value,
    establecimiento: document.getElementById("prod-local").value,
    zona: document.getElementById("prod-zona").value,
    cantidadInicial: cant,
    cantidadDisponible: cant,
    unidad: document.getElementById("prod-unidad").value,
    precioBase: parseFloat(document.getElementById("prod-precio-base").value),
    precioOferta: parseFloat(document.getElementById("prod-precio-oferta").value),
    fechaIngreso: document.getElementById("prod-ingreso").value,
    fechaLimite: document.getElementById("prod-limite").value,
    tipoLimite: document.getElementById("prod-categoria-limite").value,
    horarioRetiro: document.getElementById("prod-horario").value,
    estado: "Activa"
  };

  lotesOfertas.unshift(nuevoLote);
  this.reset();
  actualizarTodo();
});

document.getElementById("filtro-zona").addEventListener("change", renderizarOfertas);
document.getElementById("filtro-tipo").addEventListener("change", renderizarOfertas);
document.getElementById("btn-sort-peps").addEventListener("click", () => renderizarTablaLotes("peps"));
document.getElementById("btn-sort-limite").addEventListener("click", () => renderizarTablaLotes("limite"));

// Cambio de vista según Perfil seleccionado
document.getElementById("perfil-select").addEventListener("change", function() {
  const rol = this.value;
  document.querySelector(".vista-consumidor").style.display = (rol === "todos" || rol === "consumidor") ? "block" : "none";
  document.querySelector(".vista-establecimiento").style.display = (rol === "todos" || rol === "establecimiento") ? "block" : "none";
  document.querySelector(".vista-admin").style.display = (rol === "todos" || rol === "establecimiento" || rol === "admin") ? "block" : "none";
});

function actualizarTodo() {
  renderizarOfertas();
  renderizarTablaLotes("limite");
  renderizarReservasYReportes();
}

// Inicializar al cargar la página
 actualizarTodo();