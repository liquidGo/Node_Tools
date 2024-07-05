const fs = require("fs");
const request=require('request');
const cheerio=require('cheerio');

// 写一个爬虫爬取百度

request('http://10.206.137.229/spice/application/management/detail/206/iteration/detail/5500',(err,res,body)=>{
  if(err||!body) return console.log("请求失败");

  const $=cheerio.load(body);
  const result=[];
  const titles=$("script");
  titles.each((index)=>{
    result.push($(titles[index]).text())
    console.log('%c [ $(titles[index]).text() ]-16', 'font-size:13px; background:#2b9d32; color:#6fe176;', $(titles[index]).text())
  })

  fs.writeFileSync("result.json",JSON.stringify(result))
})