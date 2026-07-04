const { Sequelize } = require("sequelize");
require("dotenv").config();

const dialectOptions = {};
if (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com'))) {
  dialectOptions.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    dialect: "mysql",
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL terhubung");
    try {
      const [results] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'is_verified'");
      if (results.length === 0) {
        console.log("Menambahkan kolom is_verified ke tabel users...");
        await sequelize.query("ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0");
      }
      const [resultsOtp] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'verification_otp'");
      if (resultsOtp.length === 0) {
        console.log("Menambahkan kolom verification_otp ke tabel users...");
        await sequelize.query("ALTER TABLE users ADD COLUMN verification_otp VARCHAR(10) DEFAULT NULL");
      }
      const [resultsExp] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'otp_expires_at'");
      if (resultsExp.length === 0) {
        console.log("Menambahkan kolom otp_expires_at ke tabel users...");
        await sequelize.query("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME DEFAULT NULL");
      }
      const [resultsPoin] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'poin'");
      if (resultsPoin.length === 0) {
        console.log("Menambahkan kolom poin ke tabel users...");
        await sequelize.query("ALTER TABLE users ADD COLUMN poin INT DEFAULT 450");
      }
    } catch (columnError) {
      console.warn("Info: Melompati penambahan kolom manual (tabel belum terbentuk atau kolom sudah ada):", columnError.message);
    }
    try {
      await sequelize.sync({ alter: true });
      console.log("Tabel MySQL tersinkronisasi (alter: true)");
    } catch (alterError) {
      console.warn("Sinkronisasi dengan 'alter: true' gagal (kemungkinan karena batasan DDL database, seperti TiDB), mencoba sinkronisasi standar:", alterError.message);
      try {
        await sequelize.sync();
        console.log("Tabel MySQL tersinkronisasi");
      } catch (syncError) {
        console.error("Sinkronisasi standar juga gagal (kemungkinan karena tabel sudah ada dan ada batasan DDL TiDB), melanjutkan jalannya server:", syncError.message);
      }
    }
  } catch (error) {
    console.error("Gagal koneksi MySQL:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };
