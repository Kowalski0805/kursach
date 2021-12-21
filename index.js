const Elastic = require('./src/elastic');
const { fetchRssData, fetchTgData } = require('./src/utils');

const main = async () => {
  const rssData = await fetchRssData();
  console.log('main -> rssData', rssData);
};

main();
