'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sector', {
      id_sector: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.STRING(225),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });

    await queryInterface.createTable('rol', {
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      nombre_rol: {
        type: Sequelize.STRING(15),
        allowNull: false
      }
    });

    await queryInterface.createTable('permiso', {
      id_permiso: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      permiso: {
        type: Sequelize.STRING(15),
        allowNull: false
      }
    });

    await queryInterface.createTable('rol_permiso', {
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'rol',
          key: 'id_rol'
        },
        onDelete: 'CASCADE'
      },
      id_permiso: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'permiso',
          key: 'id_permiso'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.createTable('usuario', {
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rol',
          key: 'id_rol'
        },
        onDelete: 'CASCADE'
      },
      nombre_completo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      contrasenia: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    });

    await queryInterface.createTable('sensor_flujo', {
      id_sensor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      id_sector: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sector',
          key: 'id_sector'
        },
        onDelete: 'CASCADE'
      },
      ubicacion: {
        type: Sequelize.STRING(225),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });

    await queryInterface.createTable('valvula', {
      id_valvula: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      id_sector: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sector',
          key: 'id_sector'
        },
        onDelete: 'CASCADE'
      },
      ubicacion: {
        type: Sequelize.STRING(225),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });

    await queryInterface.createTable('dia_semana', {
      id_dia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      dia: {
        type: Sequelize.STRING(12),
        allowNull: false,
        unique: true
      }
    });

    await queryInterface.createTable('programacion_horario', {
      id_programacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      minuto_final: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      id_sector: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sector',
          key: 'id_sector'
        },
        onDelete: 'CASCADE'
      },
      id_dia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dia_semana',
          key: 'id_dia'
        },
        onDelete: 'CASCADE'
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'CASCADE'
      },
      hora_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      hora_final: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.createTable('historial_flujo', {
      id_historial: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      id_sensor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sensor_flujo',
          key: 'id_sensor'
        },
        onDelete: 'CASCADE'
      },
      valor_flujo: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tiempo: {
        type: Sequelize.TIME,
        allowNull: false
      }
    });

    await queryInterface.createTable('historial_valvula', {
      id_historial: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      id_valvula: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'valvula',
          key: 'id_valvula'
        },
        onDelete: 'CASCADE'
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tiempo: {
        type: Sequelize.TIME,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historial_valvula');
    await queryInterface.dropTable('historial_flujo');
    await queryInterface.dropTable('programacion_horario');
    await queryInterface.dropTable('dia_semana');
    await queryInterface.dropTable('valvula');
    await queryInterface.dropTable('sensor_flujo');
    await queryInterface.dropTable('usuario');
    await queryInterface.dropTable('rol_permiso');
    await queryInterface.dropTable('permiso');
    await queryInterface.dropTable('rol');
    await queryInterface.dropTable('sector');
  }
};

