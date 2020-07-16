require('dotenv').config();

import configCommon from './common.json';
// Using `require` as `import` does not support dynamic loading (yet).
const configEnv = require(`./${process.env.NODE_ENV}.json`);

const config = { ...configCommon, ...configEnv };
export default config;
