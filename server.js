const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./db/queries.js");

const PORT = 3000;
app.set("view engine", "ejs");
// Express setup

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});

app.post("/crawl", async (req, res) => {
  const { urlId } = req.body;
  const result = db.storeData(await fetchData(urlId));
  res.status(201).json(await result);
});
app.get("/data", db.getData);

const getIdComparison = (url) => {
  const splitUrlDot = url.split(".");
  const partUrlId = splitUrlDot[splitUrlDot.length - 2];
  const splitUrlDash = partUrlId.split("-");
  const idComparison = splitUrlDash[splitUrlDash.length - 1];
  return idComparison;
};

const findData = async (element, domain) => {
  const { data } = await axios.get(domain);
  const arr = [];
  const $ = cheerio.load(data);
  $(element).each(function () {
    const link = $(this).find("a").attr("href");
    const id = getIdComparison(link);
    const title = $(this).text().replace(/\n/g, "");
    const obj = {
      id,
      domain,
      title,
      link
    };
    arr.push(obj);
  });
  return arr;
};

const fetchData = async (urlId) => {
  const VN_EXPRESS = "https://vnexpress.net";
  const URLS = {
    1: "https://vnexpress.net",
    2: "https://tuoitre.vn/",
    3: "https://thanhnien.vn/",
  };

  if (URLS[urlId] === VN_EXPRESS) {
    const data = findData("h3.title-news", URLS[urlId]);
    return data;
  }
  return findData(".box-title-text", URLS[urlId]);

};
