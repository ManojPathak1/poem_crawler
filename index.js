const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const app = express();

const baseUrl = "https://www.poemhunter.com";

app.get('/', function (req, resApi) {
  const name = "John Keats";
  const url = baseUrl + "/search/?q=" + name.split(' ').join('+');
  request(url, function (error, response, html) {
    const $ = cheerio.load(html);
    const text = $("#poetDiUz > div.content > ul > li > a").attr('href');
    console.log(text);
    const poetUrl = "https://www.poemhunter.com" + text;
    console.log("Poet Url: " + "https://www.poemhunter.com" + text);
    request(poetUrl, function (error, response, html) {
      const $2 = cheerio.load(html);
      const poetName = $2("#content > h1").text();
      const imageUrl = $2("#photoANDvote > div > img").attr('src');
      console.log("Poet Name: " + poetName);
      console.log("Poet Image url: " + baseUrl + imageUrl);
      console.log("end");
    });
    request(poetUrl + "/poems/", function (error, response, html) {
      const $3 = cheerio.load(html);
      const pages = $3("#solSDDiv > div:nth-child(1) > div > div.content > div.pagination.mb-15 > ul").children().last().text();
      console.log("No of pages " + pages);
      const promises = [];
      for (let page = 1; page <= pages; page++) {
        promises.push(getPromise(poetUrl + "/poems/" + "page-" + page + "/?a=a&l=3&y="));
      }
      Promise.all(promises).then(function (res) {
        console.log(res);
        const pp = [];
        res.forEach((el) => {
          el.forEach((url) => {
            pp.push(poemsPromises(url));
          });
        });
        Promise.all(pp).then(function (res1) {
          console.log(res1);
          console.log("Done");
          resApi.json(res1);
        });
      });
      console.log("End 2");
    })
  });
});

function getPromise(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, html) {
      const $ = cheerio.load(html);
      const poems = $("#solSDDiv > div:nth-child(1) > div > div.content > table > tbody").children().length;
      console.log(poems);
      const poemsText = [];
      for (let i = 1; i <= poems; i++) {
        poemsText.push(baseUrl + $("#solSDDiv > div:nth-child(1) > div > div.content > table > tbody > tr:nth-child(" + i + ") > td.title > a").attr('href'));
      }
      resolve(poemsText);
    })
  });
}

function poemsPromises(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, html) {
      if (error) {
        console.log(error);
      }
      const $ = cheerio.load(html);
      const val = $("#solSiirMetinDV > div.KonaBody > p").html();
      resolve(val.split('<br>'));
    })
  });
}

app.listen(3000);