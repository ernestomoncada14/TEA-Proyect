'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // Sector
    await queryInterface.createTable('Sector', {
      SectorId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      Nombre: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      GeoMetria: {
        type: Sequelize.GEOMETRY('POLYGON')
      },
      Descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });

    // Rol
    await queryInterface.createTable('Rol', {
      RolId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      NombreRol: {
        type: Sequelize.STRING(15),
        allowNull: false
      }
    });

    // Permiso
    await queryInterface.createTable('Permiso', {
      PermisoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      NombrePermiso: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      }
    });

    // RolPermiso
    await queryInterface.createTable('RolPermiso', {
      PermisoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Permiso',
          key: 'PermisoId'
        },
        onDelete: 'CASCADE'
      },
      RolId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Rol',
          key: 'RolId'
        },
        onDelete: 'CASCADE'
      }
    });

    // Usuario
    await queryInterface.createTable('Usuario', {
      UsuarioId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      RolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rol',
          key: 'RolId'
        },
        onDelete: 'CASCADE'
      },
      NombreCompleto: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      Correo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      Contrasenia: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    });

    // Placa
    await queryInterface.createTable('Placa', {
      PlacaId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      SectorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sector',
          key: 'SectorId'
        },
        onDelete: 'CASCADE'
      },
      Descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Ubicacion: {
        type: Sequelize.GEOMETRY('POINT')
      },
      Estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      PuertoSerie: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true
      }
    });

    // Valvula
    await queryInterface.createTable('Valvula', {
      ValvulaId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      PlacaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Placa',
          key: 'PlacaId'
        },
        onDelete: 'CASCADE'
      },
      Ubicacion: {
        type: Sequelize.GEOMETRY('POINT')
      },
      Descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Pin: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false
      },
      Estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    });

    // SensorFlujo
    await queryInterface.createTable('SensorFlujo', {
      SensorId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      ValvulaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Valvula',
          key: 'ValvulaId'
        },
        onDelete: 'CASCADE'
      },
      Ubicacion: {
        type: Sequelize.GEOMETRY('POINT')
      },
      Descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Pin: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false
      },
      Estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    });

    // Hogar
    await queryInterface.createTable('Hogar', {
      HogarId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      SectorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sector',
          key: 'SectorId'
        },
        onDelete: 'CASCADE'
      },
      Descripcion: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      GeoMetria: {
        type: Sequelize.GEOMETRY('POLYGON')
      }
    });

    // UsuarioHogar
    await queryInterface.createTable('UsuarioHogar', {
      HogarId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Hogar',
          key: 'HogarId'
        },
        onDelete: 'CASCADE'
      },
      UsuarioId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Usuario',
          key: 'UsuarioId'
        },
        onDelete: 'CASCADE'
      }
    });

    // DiaSemana
    await queryInterface.createTable('DiaSemana', {
      DiaId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      Dia: {
        type: Sequelize.STRING(12),
        allowNull: false,
        unique: true
      }
    });

    // ProgramacionHorario
    await queryInterface.createTable('ProgramacionHorario', {
      ProgramacionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      SectorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sector',
          key: 'SectorId'
        },
        onDelete: 'CASCADE'
      },
      UsuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuario',
          key: 'UsuarioId'
        },
        onDelete: 'CASCADE'
      },
      HoraInicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      HoraFinal: {
        type: Sequelize.TIME,
        allowNull: false
      },
      Estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    });

    // DiaProgramacion
    await queryInterface.createTable('DiaProgramacion', {
      DiaHorarioId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      DiaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DiaSemana',
          key: 'DiaId'
        },
        onDelete: 'CASCADE'
      },
      ProgramacionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProgramacionHorario',
          key: 'ProgramacionId'
        },
        onDelete: 'CASCADE'
      }
    });

    // HistorialFlujo
    await queryInterface.createTable('HistorialFlujo', {
      HistorialId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      SensorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SensorFlujo',
          key: 'SensorId'
        },
        onDelete: 'CASCADE'
      },
      ValorFlujo: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      Fecha: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // HistorialValvula
    await queryInterface.createTable('HistorialValvula', {
      HistorialId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ValvulaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Valvula',
          key: 'ValvulaId'
        },
        onDelete: 'CASCADE'
      },
      Estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      Fecha: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HistorialValvula');
    await queryInterface.dropTable('HistorialFlujo');
    await queryInterface.dropTable('DiaProgramacion');
    await queryInterface.dropTable('ProgramacionHorario');
    await queryInterface.dropTable('DiaSemana');
    await queryInterface.dropTable('UsuarioHogar');
    await queryInterface.dropTable('Hogar');
    await queryInterface.dropTable('SensorFlujo');
    await queryInterface.dropTable('Valvula');
    await queryInterface.dropTable('Placa');
    await queryInterface.dropTable('Usuario');
    await queryInterface.dropTable('RolPermiso');
    await queryInterface.dropTable('Permiso');
    await queryInterface.dropTable('Rol');
    await queryInterface.dropTable('Sector');
  }
};
