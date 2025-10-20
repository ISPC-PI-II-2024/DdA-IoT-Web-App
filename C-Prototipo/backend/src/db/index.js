/* CONEXION A LA BASE DE DATOS, MARIADB */
/* se gregaran posiblemente mas conexiones como influx, u otra base, en caso que nos haga falta */


import mariadb from 'mariadb';
import { InfluxDB } from 'influx';
import { ENV } from "../config/env.js";

export const pool = mariadb.createPool({
  host: ENV.MYSQL_HOST,
  user: ENV.MYSQL_USER,
  password: ENV.MYSQL_ROOT_PASSWORD,
  database: 'WebAPP-DB',
  connectionLimit: 5
});

export const influxDB = new InfluxDB({
  host: ENV.INFLUXDB_HOST || 'localhost',
  port: ENV.INFLUXDB_PORT || 8086,
  database: ENV.INFLUXDB_DB,
  username: ENV.INFLUXDB_USER,
  password: ENV.INFLUXDB_USER_PASSWORD,
  protocol: 'http'
});