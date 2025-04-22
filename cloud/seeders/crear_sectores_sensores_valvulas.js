const { sequelize, Sector, Placa, Valvula, SensorFlujo } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");

    const pinesSensores = [2, 3, 18];

    const sectores = [
      {
        nombre: "Sector A",
        descripcion: "Primer sector de distribución",
        ubicacion: [ [ [ -87.11, 13.45 ], [ -87.10, 13.45 ], [ -87.10, 13.46 ], [ -87.11, 13.46 ], [ -87.11, 13.45 ] ] ] // Polygon
      },
      {
        nombre: "Sector B",
        descripcion: "Segundo sector de distribución",
        ubicacion: [ [ [ -87.12, 13.45 ], [ -87.11, 13.45 ], [ -87.11, 13.46 ], [ -87.12, 13.46 ], [ -87.12, 13.45 ] ] ]
      },
      {
        nombre: "Sector C",
        descripcion: "Tercer sector de distribución",
        ubicacion: [ [ [ -87.13, 13.45 ], [ -87.12, 13.45 ], [ -87.12, 13.46 ], [ -87.13, 13.46 ], [ -87.13, 13.45 ] ] ]
      }
    ];

    for (const s of sectores) {
      // Crear sector
      const [sector] = await Sector.findOrCreate({
        where: { Nombre: s.nombre },
        defaults: {
          Nombre: s.nombre,
          Descripcion: s.descripcion,
          GeoMetria: { type: "Polygon", coordinates: s.ubicacion }
        }
      });

      console.log(`✔ Sector: ${sector.Nombre}`);

      // Crear placa asociada
      const [placa] = await Placa.findOrCreate({
        where: { PuertoSerie: `COM-${sector.SectorId}` },
        defaults: {
          SectorId: sector.SectorId,
          Descripcion: `Placa del ${sector.Nombre}`,
          Ubicacion: { type: "Point", coordinates: [-87.11, 13.455] },
          Estado: false,
          PuertoSerie: `COM-${sector.SectorId}`
        }
      });

      // Crear válvula asociada a la placa
      const [valvula] = await Valvula.findOrCreate({
        where: { PlacaId: placa.PlacaId },
        defaults: {
          PlacaId: placa.PlacaId,
          Descripcion: `Válvula de ${sector.Nombre}`,
          Pin: placa.PlacaId + 9,
          Estado: false,
          Ubicacion: { type: "Point", coordinates: [-87.11, 13.455] }
        }
      });

      // Crear sensor asociado a la válvula
      await SensorFlujo.findOrCreate({
        where: { ValvulaId: valvula.ValvulaId },
        defaults: {
          ValvulaId: valvula.ValvulaId,
          Descripcion: `Sensor de flujo para ${sector.Nombre}`,
          Pin: pinesSensores[valvula.ValvulaId - 1],
          Estado: false,
          Ubicacion: { type: "Point", coordinates: [-87.11, 13.455] }
        }
      });

      console.log(`→ Placa, válvula y sensor creados para ${sector.Nombre}`);
    }

    await sequelize.close();
    console.log("Inserción completada.");
  } catch (err) {
    console.error("Error al insertar sectores:", err);
    await sequelize.close();
  }
})();
