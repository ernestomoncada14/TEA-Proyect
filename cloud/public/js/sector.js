// sector.js

// const sectorid = document.getElementById("formProgramacion").SectorId.value;

// ==============================================================================================================================

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
                        // Agregar al mapa
                        if (valvula.Ubicacion) {
                            L.marker([valvula.Ubicacion.coordinates[1], valvula.Ubicacion.coordinates[0]])
                                .addTo(map)
                                .bindPopup(`Válvula: ${valvula.Descripcion}`);
                        }
            
                        // Agregar a tabla de válvulas
                        const filaValvula = document.createElement("tr");
                        filaValvula.innerHTML = `
                            <td>${valvula.ValvulaId}</td>
                            <td>${valvula.Descripcion}</td>
                            <td>${placa.Descripcion}</td>
                            <td>${valvula.Estado ? "Activa" : "Inactiva"}</td>
                            <td>${valvula.Ubicacion ? JSON.stringify(valvula.Ubicacion.coordinates) : "-"}</td>
                        `;
                        cuerpoValvulas.appendChild(filaValvula);
            
                        // Agregar sensores asociados
                        if (valvula.SensorFlujos && Array.isArray(valvula.SensorFlujos)) {
                            valvula.SensorFlujos.forEach(sensor => {
                                // Agregar al mapa
                                if (sensor.Ubicacion) {
                                    L.marker([sensor.Ubicacion.coordinates[1], sensor.Ubicacion.coordinates[0]], {
                                        icon: L.divIcon({ className: 'text-info', html: '<b>📡</b>' })
                                    }).addTo(map)
                                    .bindPopup(`Sensor: ${sensor.Descripcion}`);
                                }
            
                                // Agregar a tabla de sensores
                                const filaSensor = document.createElement("tr");
                                filaSensor.innerHTML = `
                                    <td>${sensor.SensorId}</td>
                                    <td>${sensor.Descripcion}</td>
                                    <td>${placa.Descripcion}</td>
                                    <td>${sensor.Estado ? "Activo" : "Inactivo"}</td>
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

document.addEventListener("DOMContentLoaded", cargarDatos());

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
            location.reload();
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
            // Cambiar visualmente el botón y la etiqueta de estado
            const fila = btn.closest("tr");
            const celdaEstado = fila.querySelector("td:nth-child(5) span");
    
            // Cambiar badge de estado
            if (nuevoEstado) {
                celdaEstado.textContent = "Activa";
                celdaEstado.className = "badge bg-success";
                btn.textContent = "Desctivar";
                btn.className = "btn btn-sm btn-danger toggle-estado";
            } else {
                celdaEstado.textContent = "Inactiva";
                celdaEstado.className = "badge bg-secondary";
                btn.textContent = "Activar";
                btn.className = "btn btn-sm btn-success toggle-estado";
            }
    
            btn.dataset.estado = nuevoEstado;
        } catch (err) {
            console.error("Error al cambiar estado:", err);
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