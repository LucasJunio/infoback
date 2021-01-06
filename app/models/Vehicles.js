/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Vehicles', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },

    placa: {
      type: DataTypes.STRING(250),
      allowNull: false
    },

    chassi: {
      type: DataTypes.STRING(250),
      allowNull: false
    },

    renavam: {
      type: DataTypes.STRING(250),
      allowNull: false
    },

    modelo: {
      type: DataTypes.STRING(250),
      allowNull: false
    },

    marca: {
      type: DataTypes.STRING(250),
      allowNull: false
    },

    ano: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revision: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'vehicles'
  });
};
