const fs = require('fs');
const path = require('path');
const { fetchRssData, fetchTgData } = require('./src/utils');
const { getEnv } = require('./config/config');

const pathPrefix = getEnv('resultPathPrefix');

const main = async () => {
  const FIVE_MINUTES = 5 * 60 * 1000;

  const pathToDataDir = path.resolve(__dirname, pathPrefix);
  let lastFileIndex = 1;

  setInterval(async () => {
    const data = [];
    
    data.push(await fetchRssData());
    data.push(await fetchTgData());
    
    const dataFileNames = fs.readdirSync(pathToDataDir).sort();
    if (dataFileNames.length > 0) {
      lastFileIndex = +dataFileNames[dataFileNames.length - 1].split('')[0];
    }
    
    const pathToFile = `${pathToDataDir}/${lastFileIndex + 1}.json`;

    fs.writeFileSync(pathToFile, JSON.stringify(data));
  }, FIVE_MINUTES)
};

main();
