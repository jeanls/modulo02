require('dotenv/config');

module.exports = {
  dialect: process.env.NODE_ENV !== 'test' ? process.env.DB_DIALECT : 'sqlite',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  storage: './__tests__/database.sqlite',
  logging: process.env.NODE_ENV !== 'test',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
