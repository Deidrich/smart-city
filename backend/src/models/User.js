const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  kota: {
    type: DataTypes.STRING(100),
    defaultValue: 'Medan'
  },
  telepon: {
    type: DataTypes.STRING(30),
    defaultValue: null
  },
  role: {
    type: DataTypes.ENUM('warga', 'admin'),
    defaultValue: 'warga'
  },
  foto_profil: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  security_question: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  security_answer: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  remember_token: {
    type: DataTypes.STRING(255),
    defaultValue: null
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
