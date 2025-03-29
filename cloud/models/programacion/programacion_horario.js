const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("ProgramacionHorario", {
    ProgramacionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SectorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    HoraInicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    HoraFinal: {
      type: DataTypes.TIME,
      allowNull: false
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: "ProgramacionHorario",
    timestamps: false
  });
};
