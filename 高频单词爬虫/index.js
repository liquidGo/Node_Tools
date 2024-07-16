const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); 

const baseUrl = "http://dictall.com/"
const splitPageUrls = (page = 1) =>
  `http://dictall.com/dictall/newsList.jsp?PG=${page}&classId=2&category=0`
  // classId=2:World News
  // classId=0:China News

// 用于存储所有文本内容的数组
let allTextContent = [];
let detailsUrls = [];

// 异步函数，用于获取分页列表页面内容并提取详情页URL
async function fetchPage(pageMax = 1) {
  const pagePromises = [];
  for (let i = 1; i <= pageMax; i++) {
    pagePromises.push(axios.get(splitPageUrls(i)));
  }

  try {
    const responses = await Promise.all(pagePromises);
    responses.forEach(({ data }) => {
      const $ = cheerio.load(data);
      $('.list_tit a').each((index, element) => {
        const url = $(element).attr('href');
        detailsUrls.push(url);
      });
    });
    console.log('提取到的详情页URL数量:', detailsUrls.length);
    return detailsUrls;
  } catch (error) {
    console.error(`获取页面时出错: ${error}`);
  }
}

// 函数用于模拟延迟
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 异步函数，用于获取详情页内容
async function fetchDetail(url,index) {
  try {
    const response = await axios.get(baseUrl + url);
    const $ = cheerio.load(response.data);
    $('p').each((_index, element) => {
      const text = $(element).text();
      allTextContent.push(text);
    });
    console.log(`已抓取详情页: ${url}`,`进度: ${(index+1)/detailsUrls.length*100}%`);
  } catch (error) {
    console.error(`抓取详情页出错: ${error}`);
  }
}

// 主函数，用于运行爬虫
async function runCrawler() {
  console.log('开始爬取...');
  const detailsUrls = await fetchPage(20); // 假设我们爬取前5页的数据

  for (let i = 0; i < detailsUrls.length; i++) {
    await fetchDetail(detailsUrls[i],i);
    // 模拟手动点击操作的延迟
    await delay(2000); // 延迟5秒
  }

  // 爬虫完成后，找出频繁出现的单词
  const frequentWords = findFrequentWords(allTextContent);

  // 将频繁出现的单词写入到txt文件中
  fs.writeFile('frequent-words.txt', frequentWords.join('\n'), err => {
    if (err) {
          console.error('写入失败:', err);
        } else {
          console.log('写入成功！');
        }
  });
}

function findFrequentWords(arr) {
  const wordCount = arr.reduce((count, text) => {
    const words = text.trim().split(/\s+/);
    words.forEach(word => {
      count[word.toLowerCase()] = (count[word.toLowerCase()] || 0) + 1;
    });
    return count;
  }, {});

  return Object.keys(wordCount).filter(word => wordCount[word] >= 6);
}

// 运行爬虫
runCrawler().then(() => {
  console.log('爬虫运行完成！');
});