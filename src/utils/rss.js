const { XMLParser } = require('fast-xml-parser');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { sources } = require('../../sources.json');

const getArticleBody = async (url, sourceSelector) => {
  const response = await fetch(url);
  const html = await response.textConverted();
  const querySelector = cheerio.load(html);

  return querySelector(sourceSelector).toArray().map((e) => querySelector(e).text()).join('\n');
};

const fetchRssData = async () => {
  const results = [];
  const parser = new XMLParser();

  const sourceParsingPromises = sources.map(async (source) => {
    const response = await fetch(source.link);
    const xml = await response.textConverted();
    const feed = parser.parse(xml);

    const sourceItemParsingPromises = feed.rss.channel.item.map(async (item) => {
      const link = item.link;

      try {
        results.push({
          title: item.title,
          link,
          body: await getArticleBody(link, source.selector),
          author: item.author ?? null,
          category: item.category,
          date: new Date(item.pubDate),
        });
      } catch (error) {
        console.error(error)
      }
    });

    await Promise.all(sourceItemParsingPromises);
  });
  
  await Promise.all(sourceParsingPromises);

  return results;
};

module.exports = {
  fetchRssData,
};
