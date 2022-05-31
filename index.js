const fs = require('fs');
const path = require('path');
const { fetchRssData, fetchTgData } = require('./src/utils');
const { getEnv } = require('./config/config');

const pathPrefix = getEnv('resultPathPrefix');

const main = async () => {
  const FIVE_MINUTES = 5 * 60 * 1000;

  const pathToDataDir = path.resolve(__dirname, pathPrefix);
  console.log({pathToDataDir});
  let lastFileIndex = 1;

  setInterval(async () => {
    let data = [];
    
    data = data.concat(await fetchRssData());
    data = data.concat(await fetchTgData());
    
    const dataFileNames = fs.readdirSync(pathToDataDir).sort();
    if (dataFileNames.length > 0) {
      lastFileIndex = +dataFileNames[dataFileNames.length - 1].split('')[0];
    }
    
    const pathToFile = `${pathToDataDir}/data_${(new Date()).getTime()}.json`;

    fs.writeFileSync(pathToFile, JSON.stringify(data));
  }, FIVE_MINUTES)
};

main();
