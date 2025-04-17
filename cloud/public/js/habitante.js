document.addEventListener("DOMContentLoaded", async () => {
    const mapaContainer = document.getElementById("mapaHogar");
    const listaHorarios = document.getElementById("listaHorarios");
    const coordenadasRaw = mapaContainer.dataset.coordenadas;
  
    if (coordenadasRaw) {
        const coordenadas = JSON.parse(coordenadasRaw);
        const latlngs = coordenadas.map(coord => [coord[1], coord[0]]);

        const centro = latlngs[0];
        const mapa = L.map("mapaHogar").setView(centro, 20);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
        }).addTo(mapa);

        L.polygon(latlngs, { color: "blue" }).addTo(mapa);
    }
  
    // Obtener horarios si hay sectorId asociado
    const sectorId = document.getElementById("sectorNombre")?.dataset?.sector;
  
    if (sectorId) {
        try {
        const res = await fetch(`/api/sectores/horarios/${sectorId}`, {
            credentials: 'include'
            });
        const horarios = await res.json();

        if (horarios.length === 0) {
            tablaHorarios.innerHTML = "<tr><td colspan='3' class='text-muted'>No hay horarios programados para este sector.</td></tr>";
          } else {
            horarios.forEach(h => {
              const tr = document.createElement("tr");
              tr.innerHTML = `<td>${h.dia}</td><td>${h.fecha}</td><td>${h.HoraInicio}</td><td>${h.HoraFinal}</td>`;
              tablaHorarios.appendChild(tr);
            });
          }
        } catch (err) {
          console.error("Error al cargar horarios:", err);
          tablaHorarios.innerHTML = "<tr><td colspan='3' class='text-danger'>Error al obtener los horarios</td></tr>";
        }
    }
  });
  