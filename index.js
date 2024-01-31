// Node.js file system module to read and write files on the server.
const fs = require("fs"); // to read and write files
const http = require("http"); // to create a web server
const url = require("url"); // to parse variables from a url
const replaceTemplate = require("./modules/replaceTemplate");
const { default: slugify } = require("slugify");

// Server
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempFound = fs.readFileSync(
  `${__dirname}/templates/Not-found.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

// ------------------------------------------------------------------------------------------

// replaceTemplate function to replace the placeholders with the actual data

/*
  replaceTemplate = (temp, product) 
  temp -> template file (html) that we want to replace the placeholders with the actual data
  product -> the actual data that we want to replace the placeholders with
  replace() -> method returns a new string with some or all matches of a pattern replaced by a replacement.

*/

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    // map() method creates a new array with the results of calling a function for every array element.
    // join() method returns the array as a string.
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join(""); // el -> element

    let output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
  }

  // Product page
  else if (pathname === "/product" && query.id < dataObj.length) {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  // API
  else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);
  }

  // Not found
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world", // this is a custom header
    });
    res.end(tempFound);
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
