// sector.js

// const sectorid = document.getElementById("formProgramacion").SectorId.value;
// const socket = io(); // se conecta automáticamente al mismo host

// ==============================================================================================================================
const valvulaMarkers = {}; // clave: ValvulaId, valor: marker

async function obtenerSector() {
    try {
        const res = await fetch(`/api/sectores/${sectorid}`, { credentials: "include" });
        if (!res.ok) throw new Error("Error al obtener el sector");
        const sector = await res.json();
        return sector;
    } catch (err) {
        console.error(err);
    }
}

async function obtenerPlacas() {
    try {
        const res = await fetch(`/api/placas/${sectorid}`, { credentials: "include" });
        if (!res.ok) throw new Error("Error al obtener las placas");
        const placas = await res.json();
        return placas;
    } catch (err) {
        console.error(err);
    }
}

// ==============================================================================================================================
async function cargarDatos() {
    obtenerSector().then(sector => {
        // console.log(sector);
        // Mostrar información del sector
        document.getElementById("titulo").textContent = "Sector " + sector.Nombre;
        document.getElementById("NombreSector").textContent = "Sector: " + sector.Nombre;
        document.getElementById("DescripcionSector").textContent = "Descripción: " + sector.Descripcion;

        const geom = sector.GeoMetria;

        if (geom && geom.type === "Polygon") {
            // Invertir coordenadas de [lng, lat] a [lat, lng] para Leaflet
            const coords = geom.coordinates[0].map(([lng, lat]) => [lat, lng]);

            const map = L.map("map").setView(coords[0], 16);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
            }).addTo(map);

            const polygon = L.polygon(coords, {
            color: "blue",
            fillColor: "#3f8efc",
            fillOpacity: 0.4
            }).addTo(map);
            polygon.bindPopup(`Sector: ${sector.Nombre}`).openPopup();


            map.fitBounds(polygon.getBounds());

            // Agregar válvulas y sensores al mapa desde placas
            obtenerPlacas().then(placas => {
                const cuerpoValvulas = document.querySelector("#tablaValvulas tbody");
                const cuerpoSensores = document.querySelector("#tablaSensores tbody");
            
                cuerpoValvulas.innerHTML = "";
                cuerpoSensores.innerHTML = "";
            
                placas.forEach(placa => {
                    placa.Valvulas.forEach(valvula => {
                        // Agregar Historial Valvulas
                        cargarHistoriales(valvula);
                        // Agregar al mapa
                        if (valvula.Ubicacion) {
                            const marker = L.marker([valvula.Ubicacion.coordinates[1], valvula.Ubicacion.coordinates[0]])
                                .addTo(map)
                                .bindPopup(`Válvula: ${valvula.Descripcion}`);
                            valvulaMarkers[valvula.ValvulaId] = marker;
                        }
            
                        // Agregar a tabla de válvulas
                        const filaValvula = document.createElement("tr");
                        filaValvula.innerHTML = `
                            <td>${valvula.ValvulaId}</td>
                            <td>${valvula.Descripcion}</td>
                            <td>${placa.Descripcion}</td>
                            <td>
                                <span class="badge ${valvula.Estado ? "bg-success" : "bg-secondary"} estado-valvula">
                                    ${valvula.Estado ? "Activa" : "Inactiva"}
                                </span>
                            </td>
                            <td>${valvula.Ubicacion ? JSON.stringify(valvula.Ubicacion.coordinates) : "-"}</td>
                            <td>
                                <button class="btn btn-sm btn-${valvula.Estado ? "danger" : "success"} toggle-valvula"
                                        data-id="${valvula.ValvulaId}"
                                        data-estado="${valvula.Estado}">
                                ${valvula.Estado ? "Cerrar" : "Abrir"}
                                </button>
                                <button class="btn btn-sm btn-warning editar-valvula"
                                        data-id="${valvula.ValvulaId}"
                                        data-descripcion="${valvula.Descripcion}"
                                        data-ubicacion='${JSON.stringify(valvula.Ubicacion)}'
                                        data-placa-id="${placa.PlacaId}">
                                    Editar
                                </button>
                            </td>
                        `;
                        cuerpoValvulas.appendChild(filaValvula);
            
                        // Agregar sensores asociados
                        if (valvula.SensorFlujos && Array.isArray(valvula.SensorFlujos)) {
                            valvula.SensorFlujos.forEach(sensor => {
                                // Agregar Historial Sensores
                                cargarHistorialSensor(sensor);
                                // Agregar al mapa
                                if (sensor.Ubicacion) {
                                    L.marker([sensor.Ubicacion.coordinates[1], sensor.Ubicacion.coordinates[0]], {
                                        icon: L.divIcon({ className: 'text-info', html: '<b>📡</b>' })
                                    }).addTo(map)
                                    .bindPopup(`Sensor: ${sensor.Descripcion}`);
                                }
            
                                // Agregar a tabla de sensores
                                const filaSensor = document.createElement("tr");
                                filaSensor.setAttribute("data-sensor-id", sensor.SensorId);
                                filaSensor.innerHTML = `
                                    <td>${sensor.SensorId}</td>
                                    <td>${sensor.Descripcion}</td>
                                    <td>${placa.Descripcion}</td>
                                    <td>
                                        <span class="badge ${sensor.Estado ? "bg-success" : "bg-secondary"} estado-valvula">
                                            ${sensor.Estado ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>${sensor.Ubicacion ? JSON.stringify(sensor.Ubicacion.coordinates) : "-"}</td>
                                `;
                                cuerpoSensores.appendChild(filaSensor);
                            });
                        }
                    });
                });
            });
            

        } else {
            document.getElementById("map").innerHTML = "<p class='text-muted'>Este sector no tiene georreferenciación asignada.</p>";
        }
        const cuerpoProgramaciones = document.getElementById("tablaProgramaciones");
        cuerpoProgramaciones.innerHTML = "";

        sector.ProgramacionHorarios.forEach(p => {
        const dias = p.DiaProgramacions && p.DiaProgramacions.length
            ? p.DiaProgramacions.map(d => d.DiaSemana?.Dia).filter(Boolean).join(", ")
            : "-";

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${p.ProgramacionId}</td>
            <td>${dias}</td>
            <td>${p.HoraInicio}</td>
            <td>${p.HoraFinal}</td>
            <td>
                <span class="badge bg-${p.Estado ? "success" : "secondary"}">
                    ${p.Estado ? "Activa" : "Inactiva"}
                </span>
            </td>
            <td>
            <button class="btn btn-sm btn-${p.Estado ? "danger" : "success"} toggle-estado"
                    data-id="${p.ProgramacionId}"
                    data-estado="${p.Estado}">
                ${p.Estado ? "Desactivar" : "Activar"}
            </button>

            <button class="btn btn-sm btn-warning ms-2 editar-programacion"
                    data-id="${p.ProgramacionId}"
                    data-sector-id="${p.SectorId}"
                    data-hora-inicio="${p.HoraInicio}"
                    data-hora-final="${p.HoraFinal}"
                    data-estado="${p.Estado}"
                    data-dias='${JSON.stringify(p.DiaProgramacions.map(d => d.DiaId))}'>
                Editar
            </button>

            <button class="btn btn-sm btn-outline-danger ms-2 eliminar-programacion"
                    data-id="${p.ProgramacionId}">
                Eliminar
            </button>
            </td>
        `;
        cuerpoProgramaciones.appendChild(fila);
        });
    });

}

document.addEventListener("DOMContentLoaded", cargarDatos);

document.addEventListener("DOMContentLoaded", () => {
    let mapaModal;
    let markerModal;
    
    function inicializarMapaModal() {
        if (mapaModal) return; // ya inicializado
    
        mapaModal = L.map('mapaUbicacion').setView([14.0723, -87.1921], 13); // Coordenadas base en Tegucigalpa
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
        }).addTo(mapaModal);

        let lat = parseFloat(document.getElementById("editLatitud").value);
        let lng = parseFloat(document.getElementById("editLongitud").value);

        // Validar si son números válidos
        if (isNaN(lat) || isNaN(lng)) {
            // Asignar valores predeterminados (Tegucigalpa)
            lat = 13.5;
            lng = -89.2;
        }

        const coords = [lat, lng];
        markerModal = L.marker([coords[1], coords[0]], { draggable: true }).addTo(mapaModal);
    
        markerModal.on("dragend", () => {
            const coords = markerModal.getLatLng();
            document.getElementById("editLatitud").value = coords.lat;
            document.getElementById("editLongitud").value = coords.lng;
            mapaModal.setView([coords.lat, coords.lng]);
        });
    
        document.getElementById("editLatitud").addEventListener("input", (e) => {
            const lat = JSON.parse(e.target.value);
            const lng = parseFloat(document.getElementById("editLongitud").value);
            if (!isNaN(lat) && !isNaN(lng) && markerModal) {
                markerModal.setLatLng([lat, lng]);
                mapaModal.setView([lat, lng]);
            }
        });
        document.getElementById("editLongitud").addEventListener("input", (e) => {
            const lat = parseFloat(document.getElementById("editLatitud").value);
            const lng = JSON.parse(e.target.value);
            if (!isNaN(lat) && !isNaN(lng) && markerModal) {
                markerModal.setLatLng([lat, lng]);
                mapaModal.setView([lat, lng]);
            }
        });
    }
    
    document.getElementById("modalEditarValvula").addEventListener("shown.bs.modal", () => {
        setTimeout(() => {
        inicializarMapaModal();
        mapaModal.invalidateSize();
    
        // si hay ubicación previa, centrar marker
        const latitud = document.getElementById("editLatitud").value;
        const longitud = document.getElementById("editLongitud").value;
        try {
            if (latitud && longitud) {
            markerModal.setLatLng([latitud, longitud]);
            mapaModal.panTo([latitud, longitud]);
            }
        } catch {}
        }, 200);
    });
});

// ==============================================================================================================================

function actualizarSeleccion() {
    const seleccionados = [];
    const etiquetas = [];

    document.querySelectorAll("#listaDias input[type=checkbox]").forEach(cb => {
        if (cb.checked) {
            seleccionados.push(cb.value);
            etiquetas.push(`<span class="badge bg-primary me-1">${cb.nextSibling.textContent}</span>`);
        }
    });

    document.getElementById("DiasSeleccionados").innerHTML = etiquetas.join(" ");
    document.getElementById("DiasHidden").value = seleccionados.join(",");
}

async function cargarDias() {
    try {
        const res = await fetch("/api/dias", { credentials: "include" });
        const dias = await res.json();
        const lista = document.getElementById("listaDias");

        dias.forEach(d => {
            const li = document.createElement("li");
            li.className = "dropdown-item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = d.DiaId;
            checkbox.id = `dia-${d.DiaId}`;
            checkbox.className = "form-check-input me-2";
            checkbox.addEventListener("change", actualizarSeleccion);

            const label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = `dia-${d.DiaId}`;
            label.textContent = d.Dia;

            li.appendChild(checkbox);
            li.appendChild(label);
            lista.appendChild(li);
        });
    } catch (err) {
        console.error("Error al cargar días:", err);
    }
}

function actualizarDiasEdit() {
    const seleccionados = [];
    document.querySelectorAll("#editDiasContainer input[type=checkbox]").forEach(cb => {
        if (cb.checked) {
            seleccionados.push(cb.value);
        }
    });
    document.getElementById("editDiasHidden").value = seleccionados.join(",");
}

// ==============================================================================================================================

document.addEventListener("DOMContentLoaded", async () => {
    cargarDias();

    const form = document.getElementById("formProgramacion");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const datos = {
            SectorId: formData.get("SectorId"),
            HoraInicio: formData.get("HoraInicio"),
            HoraFinal: formData.get("HoraFinal"),
            Dias: document.getElementById("DiasHidden").value.split(",")
        };

        try {
            const res = await fetch("/api/programaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(datos)
            });

            if (!res.ok) throw new Error("Error al crear programación");
            // Limpiar el formulario
            form.reset();
            document.getElementById("DiasSeleccionados").innerHTML = "";
            document.getElementById("DiasHidden").value = "";
        } catch (err) {
            console.error("No se pudo guardar la programación", err);
        }
    });
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("toggle-estado")) {
        const btn = e.target;
        const id = btn.dataset.id;
        const estadoActual = btn.dataset.estado === "true";
        const nuevoEstado = !estadoActual;

        try {
            const res = await fetch(`/api/programaciones/${id}/estado`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                credentials: "include",
                body: `Estado=${nuevoEstado}`
            });

            if (!res.ok) throw new Error("Error al cambiar estado");
            
        } catch (err) {
            console.error("Error al cambiar estado:", err);
        }
    } else if (e.target.classList.contains("toggle-valvula")) {
        const btn = e.target;
        const id = btn.dataset.id;
        const estadoActual = btn.dataset.estado === "true";
        const nuevoEstado = !estadoActual;
      
        try {
          const res = await fetch(`/api/valvulas/${id}/estado`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            credentials: "include",
            body: `Estado=${nuevoEstado}`
          });
      
          if (!res.ok) throw new Error("No se pudo cambiar el estado de la válvula");
        } catch (err) {
          console.error("Error al cambiar estado de válvula:", err);
          alert("No se pudo cambiar el estado de la válvula.");
        }
      } else if (e.target.classList.contains("eliminar-programacion")) {
        const btn = e.target;
        const id = btn.dataset.id;

        if (!confirm("¿Estás seguro de eliminar esta programación?")) return;

        try {
            const res = await fetch(`/api/programaciones/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!res.ok) throw new Error("Error al eliminar");
            // Eliminar la fila de la tabla sin recargar
            const fila = btn.closest("tr");
            fila.remove();
        } catch (err) {
            console.error("Error al eliminar programación:", err);
        }
    } else if (e.target.classList.contains("editar-programacion")) {
        const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarProgramacion"));
        const btn = e.target;
        const id = btn.dataset.id;
        const sectorId = btn.dataset.sectorId;
        const horaInicio = btn.dataset.horaInicio;
        const horaFinal = btn.dataset.horaFinal;
        const estado = btn.dataset.estado;
        const dias = JSON.parse(btn.dataset.dias || "[]");

        document.getElementById("editProgramacionId").value = id;
        document.getElementById("editSectorId").value = sectorId;
        document.getElementById("editHoraInicio").value = horaInicio;
        document.getElementById("editHoraFinal").value = horaFinal;
        document.getElementById("editEstado").value = estado;

        const res = await fetch("/api/dias", { credentials: "include" });
        const diasSemana = await res.json();
        const container = document.getElementById("editDiasContainer");
        container.innerHTML = "";

        diasSemana.forEach(d => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "form-check-input";
            checkbox.value = d.DiaId;
            checkbox.id = `edit-dia-${d.DiaId}`;
            if (dias.includes(d.DiaId)) checkbox.checked = true;
            checkbox.addEventListener("change", actualizarDiasEdit);

            const label = document.createElement("label");
            label.className = "form-check-label me-3";
            label.htmlFor = checkbox.id;
            label.textContent = d.Dia;

            const div = document.createElement("div");
            div.className = "form-check form-check-inline";
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });

        actualizarDiasEdit();
        modalEditar.show();
    } else if (e.target.classList.contains("editar-valvula")) {
        const btn = e.target;
        const modal = new bootstrap.Modal(document.getElementById("modalEditarValvula"));
    
        document.getElementById("editValvulaId").value = btn.dataset.id;
        document.getElementById("editValvulaDescripcion").value = btn.dataset.descripcion;
        document.getElementById("editLatitud").value = btn.dataset.ubicacion ? JSON.parse(btn.dataset.ubicacion).coordinates[1] : "";
        document.getElementById("editLongitud").value = btn.dataset.ubicacion ? JSON.parse(btn.dataset.ubicacion).coordinates[0] : "";
    
        modal.show();
    }
});

document.getElementById("formEditarValvula").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editValvulaId").value;
    const descripcion = document.getElementById("editValvulaDescripcion").value;
    const latitud = document.getElementById("editLatitud").value;
    const longitud = document.getElementById("editLongitud").value;

    // crear ubicacion
    const ubicacion = JSON.stringify({
        type: "Point",
        coordinates: [parseFloat(longitud), parseFloat(latitud)]
    }
    );

    try {
        const res = await fetch(`/api/valvulas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                Descripcion: descripcion,
                Ubicacion: JSON.parse(ubicacion)
            })
        });

        if (!res.ok) throw new Error("Error al actualizar válvula");
        const modalElement = document.getElementById("modalEditarValvula");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    } catch (err) {
        console.error("Error al actualizar válvula:", err);
        alert("No se pudo actualizar la válvula. Verifica el formato de la ubicación.");
    }
});


document.getElementById("formEditarProgramacion").addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        ProgramacionId: document.getElementById("editProgramacionId").value,
        SectorId: document.getElementById("editSectorId").value,
        HoraInicio: document.getElementById("editHoraInicio").value,
        HoraFinal: document.getElementById("editHoraFinal").value,
        Estado: document.getElementById("editEstado").value === "true",
        Dias: document.getElementById("editDiasHidden").value.split(",").map(Number)
    };

    try {
        const res = await fetch(`/api/programaciones/${datos.ProgramacionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error("Error al actualizar programación");
        alert("Programación actualizada correctamente");
        location.reload();
    } catch (err) {
        console.error("Error actualizando programación", err);
        alert("No se pudo actualizar la programación.");
    }
});


// ==============================================================================================================================

async function cargarHistoriales(v) {
    // Historial de válvula
    const resV = await fetch(`/api/valvulas/${v.ValvulaId}/historial`, { credentials: 'include' });
    const historialValvula = await resV.json();
    
    const containerV = document.getElementById("fichasHistorialValvulas");
    const cardV = document.createElement("div");
    cardV.className = "col";
    cardV.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Historial de Válvula #${v.ValvulaId}</h5>
          <canvas id="grafico-valvula-${v.ValvulaId}" height="200"></canvas>
        </div>
      </div>`;
    containerV.appendChild(cardV);
  
    const fechasV = historialValvula.map(h => new Date(h.createdAt).toLocaleString());
    const estados = historialValvula.map(h => h.Estado ? 1 : 0);
  
    new Chart(document.getElementById(`grafico-valvula-${v.ValvulaId}`), {
      type: 'line',
      data: {
        labels: fechasV,
        datasets: [{
          label: 'Estado (1=Activa, 0=Inactiva)',
          data: estados,
          tension: 0.2,
          borderWidth: 2
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  
  async function cargarHistorialSensor(s) {
    const resS = await fetch(`/api/sensores/${s.SensorId}/historial`, { credentials: 'include' });
    const historialSensor = await resS.json();
  
    const containerS = document.getElementById("fichasHistorialSensores");
    const cardS = document.createElement("div");
    cardS.className = "col";
    cardS.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Historial de Sensor #${s.SensorId}</h5>
          <canvas id="grafico-sensor-${s.SensorId}" height="200"></canvas>
        </div>
      </div>`;
    containerS.appendChild(cardS);
  
    const fechasS = historialSensor.map(h => new Date(h.createdAt).toLocaleString());
    const valores = historialSensor.map(h => h.ValorFlujo);
  
    new Chart(document.getElementById(`grafico-sensor-${s.SensorId}`), {
      type: 'line',
      data: {
        labels: fechasS,
        datasets: [{
          label: 'Flujo',
          data: valores,
          tension: 0.3,
          borderWidth: 2
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  