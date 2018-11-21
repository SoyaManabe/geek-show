'use strict';
/**
 * sequelizeの読み込みの定義を書く部分
 */
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/geek_show',
    {
        logging: true,
        operatorsAliases: false
    });

module.exports = {
    database: sequelize,
    Sequelize: Sequelize
};