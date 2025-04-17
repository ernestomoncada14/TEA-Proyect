async function cargarResumen(desde = null, hasta = null) {
    const res = await fetch('/api/valvulas-con-sensor', {
      credentials: 'include'
    });
    const datos = await res.json();

    const contenedor = document.getElementById("contenedorResumen");

    if (desde && hasta && desde > hasta) {
        alert("La fecha de inicio no puede ser posterior a la fecha final.");
        return;
      }      

    datos.forEach(async (item) => {
        const card = document.createElement("div");
        card.className = "col";
        card.innerHTML = `
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Válvula #${item.ValvulaId}</h5>
              <p><strong>Ubicación:</strong> ${item.Descripcion || 'N/A'}</p>
              <p><strong>Frecuencia de activación:</strong> <span id="activaciones-${item.ValvulaId}">Calculando...</span></p>
              <p><strong>Tiempo activa:</strong> <span id="tiempo-${item.ValvulaId}">Calculando...</span></p>
              <p><strong>Sensor:</strong> ${item.SensorId ? `#${item.SensorId}` : 'No asignado'}</p>
              <p><strong>Flujo total:</strong> <span id="flujo-total-${item.SensorId}">Calculando...</span></p>
              <p><strong>Flujo promedio:</strong> <span id="flujo-prom-${item.SensorId}">Calculando...</span></p>
            </div>
          </div>`;
        contenedor.appendChild(card);

        const params = new URLSearchParams();
        if (desde) params.append('desde', desde);
        if (hasta) params.append('hasta', hasta);

        // 1. Obtener historial de válvula
        const resHist = await fetch(`/api/valvulas/${item.ValvulaId}/historial?${params}`, {
          credentials: 'include'
        });
        const historial = await resHist.json();
      
        if (!historial || historial.length === 0) {
          document.getElementById(`activaciones-${item.ValvulaId}`).textContent = "Sin datos";
          document.getElementById(`tiempo-${item.ValvulaId}`).textContent = "Sin datos";
          return;
        }
      
        // 2. Calcular frecuencia de activación (cambios de false a true)
        let frecuencia = 0;
        for (let i = 1; i < historial.length; i++) {
          if (!historial[i - 1].Estado && historial[i].Estado) {
            frecuencia++;
          }
        }
        document.getElementById(`activaciones-${item.ValvulaId}`).textContent = `${frecuencia} veces`;
      
        // 3. Calcular tiempo activa total (sumando lapsos entre true → false)
        let tiempoActivoMs = 0;
        let inicioActivo = null;
      
        historial.forEach((h, i) => {
          const fecha = new Date(h.Fecha);
          if (h.Estado) {
            if (!inicioActivo) inicioActivo = fecha;
          } else {
            if (inicioActivo) {
              tiempoActivoMs += fecha - inicioActivo;
              inicioActivo = null;
            }
          }
          // Si termina en estado true, asumimos está activo hasta "ahora"
          if (i === historial.length - 1 && inicioActivo) {
            tiempoActivoMs += new Date() - inicioActivo;
          }
        });
      
        const minutos = Math.floor(tiempoActivoMs / 60000);
        document.getElementById(`tiempo-${item.ValvulaId}`).textContent = `${minutos} min`;

        // 4. Si tiene sensor asociado, calcular métricas de flujo
        if (item.SensorId) {
            const resSensor = await fetch(`/api/sensores/${item.SensorId}/historial?${params}`, {
            credentials: 'include'
            });
            const historialSensor = await resSensor.json();
        
            if (!historialSensor || historialSensor.length === 0) {
            document.getElementById(`flujo-total-${item.SensorId}`).textContent = "Sin datos";
            document.getElementById(`flujo-prom-${item.SensorId}`).textContent = "Sin datos";
            } else {

            const calculoConsumo = calcularConsumoTotalReal(historialSensor);
            const totalFlujo = calculoConsumo.total;
            const promedio = totalFlujo / calculoConsumo.cant;
              
        
            document.getElementById(`flujo-total-${item.SensorId}`).textContent = `${totalFlujo.toFixed(2)} ml`;
            document.getElementById(`flujo-prom-${item.SensorId}`).textContent = `${promedio.toFixed(2)} ml/registro`;
            }
        }
  
    }); 
  }

function filtrarValvulas() {
    const desde = document.getElementById("filtroFechaInicio").value;
    const hasta = document.getElementById("filtroFechaFin").value;

    // Limpiar contenedor antes de cargar nuevos datos
    const contenedor = document.getElementById("contenedorResumen");
    contenedor.innerHTML = "";

    cargarResumen(desde, hasta);
  }

  function calcularConsumoTotalReal(historialSensor) {
    let total = 0;
    let picoActual = 0;
    let cant = 0;
  
    for (let i = 0; i < historialSensor.length; i++) {
      const valor = historialSensor[i].ValorFlujo;
  
      // Si detecta reinicio (o 0), acumula el pico anterior
      if (valor === 0) {
        if (picoActual > 0) {
          total += picoActual;
          picoActual = 0;
          cant++;
        }
      } else {
        picoActual = Math.max(picoActual, valor);
      }
    }
  
    // Por si el último valor no fue cero
    if (picoActual > 0) {
      total += picoActual;
    }
  
    // retornar un json con el total y la cantidad de picos
    return {'total': total, 'cant': cant};
  }
  
  async function cargarProximosHorarios() {
    const res = await fetch('/api/proximas', { credentials: 'include' });
    const horarios = await res.json();
  
    const tabla = document.getElementById('tablaHorarios');
    tabla.innerHTML = '';
  
    horarios.forEach(h => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${h.Fecha}</td>
        <td>${h.Dia}</td>
        <td>${h.HoraInicio}</td>
        <td>${h.HoraFinal}</td>
        <td>${h.Sector}</td>
      `;
      tabla.appendChild(fila);
    });
  }
  
  cargarProximosHorarios();  
  cargarResumen();