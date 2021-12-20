const { XMLParser } = require('fast-xml-parser');
const fetch = require('node-fetch');
const { sources } = require('./sources.json');


(async () => {
  const results = [];
  const parser = new XMLParser();

  const sourceParsingPromises = sources.map(async (source) => {
    const response = await fetch(source.link);
    const xml = await response.textConverted();
    const feed = parser.parse(xml);

    feed.rss.channel.item.forEach(item => {
      results.push({
        title: item.title,
        link: item.link,
        author: item.author ?? null,
        category: item.category,
        date: item.pubDate,
      });
    });
  });
  
  await Promise.all(sourceParsingPromises)

  console.log('results', results);
})();