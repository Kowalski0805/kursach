const { XMLParser } = require('fast-xml-parser');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { rssSources } = require('../../sources.json');

const getArticleBody = async (url, sourceSelector) => {
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    response = null;
  }

  if (!response) return null;

  const html = await response.textConverted();
  const querySelector = cheerio.load(html);

  return querySelector(sourceSelector).toArray().map((e) => querySelector(e).text()).join('\n');
};

const fetchRssData = async () => {
  const results = [];
  const parser = new XMLParser();

  const sourceParsingPromises = rssSources.map(async (source) => {
    try {
      const response = await fetch(source.link);
      const xml = await response.textConverted();
      const feed = parser.parse(xml);

      const sourceItemParsingPromises = feed.rss.channel.item.map(async (item) => {
        const link = item.link;

        const articleBody = await getArticleBody(link, source.selector);

        if (!articleBody) return;

        try {
          results.push({
            title: item.title,
            link,
            body: articleBody,
            author: item.author ?? null,
            category: item.category,
            date: new Date(item.pubDate),
          });
        } catch (error) {
          console.error(error)
        }
      });

      await Promise.all(sourceItemParsingPromises);
    } catch (error) {
      console.error(error);
    }
  });
  
  await Promise.all(sourceParsingPromises);

  return results;
};

module.exports = {
  fetchRssData,
};
