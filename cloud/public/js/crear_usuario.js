let mapa, capaPoligono;
let puntos = [];

// Mostrar sección de hogar y ocultar botón
const btnAgregarHogar = document.getElementById("btnAgregarHogar");
const seccionHogar = document.getElementById("seccionHogar");
const contenedorCoords = document.getElementById("coordenadasContainer");
const selectSector = document.getElementById("sectorHogar");

btnAgregarHogar.addEventListener("click", () => {
  seccionHogar.style.display = "block";
  btnAgregarHogar.style.display = "none";
  document.getElementById("mapaHogar").style.display = "block";
  inicializarMapa();
  cargarSectores();
});

// Inicializar Leaflet
function inicializarMapa() {
  mapa = L.map("mapaHogar").setView([13.455, -87.11], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapa);
}

// Agregar punto manual
const btnAgregarPunto = document.getElementById("btnAgregarPunto");
btnAgregarPunto.addEventListener("click", () => {
    const { lat, lng } = mapa.getCenter();
  const marker = L.marker([lat, lng], { draggable: true }).addTo(mapa);

  const idx = puntos.length;
  puntos.push(marker);

  const div = document.createElement("div");
  div.className = "coordenada-input";
  div.innerHTML = `
    <input type="number" step="any" class="form-control lat" placeholder="Latitud" value="${lat}">
    <input type="number" step="any" class="form-control lng" placeholder="Longitud" value="${lng}">
  `;
  contenedorCoords.appendChild(div);

  const inputLat = div.querySelector(".lat");
  const inputLng = div.querySelector(".lng");

  // Drag actualizar input
  marker.on("drag", (e) => {
    const pos = e.target.getLatLng();
    inputLat.value = pos.lat.toFixed(6);
    inputLng.value = pos.lng.toFixed(6);
    actualizarPoligono();
  });

  // Input actualizar marker
  inputLat.addEventListener("input", () => {
    const nuevaLat = parseFloat(inputLat.value);
    const nuevaLng = parseFloat(inputLng.value);
    if (!isNaN(nuevaLat) && !isNaN(nuevaLng)) {
      marker.setLatLng([nuevaLat, nuevaLng]);
      actualizarPoligono();
    }
  });
  inputLng.addEventListener("input", () => {
    const nuevaLat = parseFloat(inputLat.value);
    const nuevaLng = parseFloat(inputLng.value);
    if (!isNaN(nuevaLat) && !isNaN(nuevaLng)) {
      marker.setLatLng([nuevaLat, nuevaLng]);
      actualizarPoligono();
    }
  });

  actualizarPoligono();
});

function actualizarPoligono() {
  const coords = puntos.map(m => m.getLatLng());
  if (capaPoligono) {
    mapa.removeLayer(capaPoligono);
  }
  if (coords.length >= 3) {
    capaPoligono = L.polygon(coords).addTo(mapa);
  }
}

// Cargar sectores al select
async function cargarSectores() {
  const res = await fetch("/api/sectores_usuario");
  const data = await res.json();
  data.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.SectorId;
    opt.textContent = s.Nombre;
    selectSector.appendChild(opt);
  });
}

// Enviar datos
document.getElementById("formCrearUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = e.target.nombre.value;
  const correo = e.target.correo.value;
  const contrasenia = e.target.contrasenia.value;

  const datos = { nombre, correo, contrasenia };

  if (seccionHogar.style.display === "block") {
    const descripcion = document.getElementById("descripcionHogar").value;
    const sectorId = selectSector.value;
    const geometria = puntos.map(m => [m.getLatLng().lng, m.getLatLng().lat]);
    if (geometria.length < 3) {
      alert("Un hogar necesita al menos 3 puntos para formar un polígono.");
      return;
    }
    geometria.push(geometria[0]); // cerrar el polígono

    datos.hogar = {
      descripcion,
      sectorId,
      geometria
    };
  }

  const res = await fetch("/api/crear_usuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(datos)
  });

  if (res.ok) {
    alert("Usuario creado correctamente");
    window.location.href = "/panel";
  } else {
    const err = await res.text();
    alert("Error: " + err);
  }
});
