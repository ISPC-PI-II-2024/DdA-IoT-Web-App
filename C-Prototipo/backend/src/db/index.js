/* CONEXION A LA BASE DE DATOS, MARIADB */
/* se gregaran posiblemente mas conexiones como influx, u otra base, en caso que nos haga falta */


import mariadb from 'mariadb';
import { ENV } from "../config/env.js";

export const pool = mariadb.createPool({
  host: ENV.DB_HOST,
  user: ENV.DB_USER,
  password: ENV.DB_PASS,
  database: ENV.DB_NAME,
  connectionLimit: 5
});