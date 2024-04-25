const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { fetchRssData, fetchTgData } = require('./src/utils');
const { getEnv } = require('./config/config');

const pathPrefix = getEnv('resultPathPrefix');

const main = async () => {
  const FIVE_MINUTES = 5 * 60 * 1000;

  const pathToDataDir = path.resolve(__dirname, pathPrefix);

  setInterval(async () => {
    let data = [];

    data = data.concat(await fetchRssData());
    data = data.concat(await fetchTgData());

    const pathToFile = `${pathToDataDir}/data_${uuidv4()}.json`;

    await fs.promises.writeFile(pathToFile, JSON.stringify(data));
  }, FIVE_MINUTES)
};

main();
