const socket = io();
socket.on("connect", () => {
    console.log("🟢 Conectado a WebSocket desde monitor");
    });
socket.on("disconnect", () => {
    console.log("🔴 Desconectado de WebSocket desde monitor");
});

socket.on("nueva_programacion", (data) => {
    const nuevaProgramacion = typeof data === "string" ? JSON.parse(data) : data;
    const dias = nuevaProgramacion.Dia;
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${nuevaProgramacion.ProgramacionId}</td>
        <td>${dias}</td>
        <td>${nuevaProgramacion.HoraInicio}</td>
        <td>${nuevaProgramacion.HoraFinal}</td>
        <td>
        <span class="badge bg-${nuevaProgramacion.Estado ? "success" : "secondary"}">
            ${nuevaProgramacion.Estado ? "Activa" : "Inactiva"}
        </span>
        </td>
        <td>
        <button class="btn btn-sm btn-${nuevaProgramacion.Estado ? "danger" : "success"} toggle-estado"
                data-id="${nuevaProgramacion.ProgramacionId}"
                data-estado="${nuevaProgramacion.Estado}">
            ${nuevaProgramacion.Estado ? "Desactivar" : "Activar"}
        </button>
        <button class="btn btn-sm btn-warning ms-2 editar-programacion"
                data-id="${nuevaProgramacion.ProgramacionId}"
                data-sector-id="${nuevaProgramacion.SectorId}"
                data-hora-inicio="${nuevaProgramacion.HoraInicio}"
                data-hora-final="${nuevaProgramacion.HoraFinal}"
                data-estado="${nuevaProgramacion.Estado}"
                data-dias='${JSON.stringify(nuevaProgramacion.DiasProgramacion.map(d => d.DiaId))}'>
            Editar
        </button>
        <button class="btn btn-sm btn-outline-danger ms-2 eliminar-programacion"
                data-id="${nuevaProgramacion.ProgramacionId}">
            Eliminar
        </button>
        </td>
    `;
    document.getElementById("tablaProgramaciones").appendChild(fila);
});

socket.on("estado_programacion_actualizado", ({ ProgramacionId, NuevoEstado }) => {
    const boton = document.querySelector(`button.toggle-estado[data-id="${ProgramacionId}"]`);
    if (!boton) return;

    const fila = boton.closest("tr");
    if (!fila) return;

    const celdas = fila.querySelectorAll("td");
    const celdaEstado = celdas[4]; // Quinta columna
    const spanEstado = celdaEstado.querySelector("span");

    // Forzar booleano real
    const estadoBooleano = NuevoEstado === true || NuevoEstado === "true";

    if (spanEstado) {
        spanEstado.textContent = estadoBooleano ? "Activa" : "Inactiva";
        spanEstado.className = `badge bg-${estadoBooleano ? "success" : "secondary"}`;
    }

    boton.textContent = estadoBooleano ? "Desactivar" : "Activar";
    boton.className = `btn btn-sm btn-${estadoBooleano ? "danger" : "success"} toggle-estado`;
    boton.dataset.estado = estadoBooleano;
});

socket.on("estado_valvula_actualizado", ({ ValvulaId, NuevoEstado }) => {
    const boton = document.querySelector(`button.toggle-valvula[data-id="${ValvulaId}"]`);
    if (!boton) return;
  
    const fila = boton.closest("tr");
    if (!fila) return;
  
    const celdas = fila.querySelectorAll("td");
    const celdaEstado = celdas[3]; // Cuarta columna (Estado)
    const spanEstado = celdaEstado.querySelector("span");
  
    const estadoBooleano = NuevoEstado === true || NuevoEstado === "true";
  
    if (spanEstado) {
      spanEstado.textContent = estadoBooleano ? "Activa" : "Inactiva";
      spanEstado.className = `badge bg-${estadoBooleano ? "success" : "secondary"}`;
    }
  
    boton.textContent = estadoBooleano ? "Cerrar" : "Abrir";
    boton.className = `btn btn-sm btn-${estadoBooleano ? "danger" : "success"} toggle-valvula`;
    boton.dataset.estado = estadoBooleano;
  });

  socket.on("estado_sensor_actualizado", ({ SensorId, NuevoEstado }) => {
    const fila = document.querySelector(`tr[data-sensor-id="${SensorId}"]`);
    if (!fila) return;
  
    const span = fila.querySelector("span.estado-valvula");
    if (!span) return;
  
    const estadoBool = NuevoEstado === true || NuevoEstado === "true";
    span.textContent = estadoBool ? "Activo" : "Inactivo";
    span.className = `badge ${estadoBool ? "bg-success" : "bg-secondary"} estado-valvula`;
  });

  socket.on("valvula_actualizada", ({ ValvulaId, Descripcion, Ubicacion }) => {
    const filas = document.querySelectorAll("#tablaValvulas tbody tr");
  
    for (const fila of filas) {
      const idCelda = fila.children[0]?.textContent?.trim();
      if (idCelda === String(ValvulaId)) {
        // Actualizar descripción
        fila.children[1].textContent = Descripcion;
  
        // Actualizar ubicación como texto
        fila.children[4].textContent = Ubicacion ? JSON.stringify(Ubicacion.coordinates) : "-";
  
        // Actualizar botón de edición (busca dentro de la fila)
        const botonEditar = fila.querySelector("button.editar-valvula");
        if (botonEditar) {
          botonEditar.dataset.descripcion = Descripcion;
          botonEditar.dataset.ubicacion = JSON.stringify(Ubicacion);
        }
  
        // Actualizar ubicación en el mapa
        if (valvulaMarkers[ValvulaId]) {
          valvulaMarkers[ValvulaId].setLatLng([Ubicacion.coordinates[1], Ubicacion.coordinates[0]]);
          valvulaMarkers[ValvulaId].bindPopup(`Válvula: ${Descripcion}`);
        }
  
        break;
      }
    }
  });

  socket.on("programacion_actualizada", ({ ProgramacionId, HoraInicio, HoraFinal, Dias }) => {
    const filas = document.querySelectorAll("#tablaProgramaciones tr");
  
    for (const fila of filas) {
      const idCelda = fila.children[0]?.textContent?.trim();
      if (idCelda === String(ProgramacionId)) {
        // crear un solo texto de todos los dias separados por ,
        const diasTextoUnido = Dias.map(d => d.Dia).join(", ");
        // Actualizar días
        const diasCelda = fila.children[1];
        diasCelda.textContent = diasTextoUnido;
  
        // Actualizar hora de inicio
        const horaInicioCelda = fila.children[2];
        horaInicioCelda.textContent = HoraInicio;
  
        // Actualizar hora final
        const horaFinalCelda = fila.children[3];
        horaFinalCelda.textContent = HoraFinal;

        // Actualizar botón de edición (busca dentro de la fila)
        const botonEditar = fila.querySelector("button.editar-programacion");
        if (botonEditar) {
          botonEditar.dataset.horainicio = HoraInicio;
          botonEditar.dataset.horafinal = HoraFinal;
          botonEditar.dataset.dias = JSON.stringify(Dias.map(d => d.DiaId));
        }
  
        break;
      }
    }
  }
  );
  
  
  
  

