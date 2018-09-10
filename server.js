var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models/Article");

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
// set up handlebbars view engine
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");


// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.nytimes.com/section/us").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        
        // Now, we grab every h2 within an article tag, and do the following:
        $("div.story-body").each(function(i, element) {
            
            // Save an empty result object
            var result = {};
            
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).find("h2.headline").text().trim();
            result.link = $(this).find("a").attr("href");
            result.summary = $(this).find("p.summary").text().trim();
            console.log(`Result ${result}`);
            
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                return res.json(err);
            });
        });
        
        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});

// route to to home page
app.get("/articles", function(req, res) {
    db.Article.find({}).then(function(dbArticle) {
        if(data.length === 0) {
            res.render("Click the scrape button to get new articles.");
		}
		else{
            res.render("index");
		}
	});
});

// route for clearing articles from page
app.get("/clear")
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
