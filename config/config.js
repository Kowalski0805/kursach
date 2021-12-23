const dotenv = require('dotenv');

dotenv.config({ path: 'env/.env' });

const envVars = {
  tg: {
    apiId: +process.env.TG_API_ID,
    apiHash: process.env.TG_API_HASH,
    phoneNumber: process.env.TG_PHONE_NUMBER,
    password: process.env.TG_PASSWORD,
    defaultDcId: +process.env.TG_DEFAULT_DC_ID,
  },
  resultPathPrefix: process.env.RESULT_PATH_PREFIX,
};

const getEnv = (variable) => envVars[variable];

module.exports = {
  getEnv,
};
