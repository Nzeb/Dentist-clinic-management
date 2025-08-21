// migrate.js
require('dotenv').config();
require('ts-node').register();
require('./src/server/db/migrate.ts');
