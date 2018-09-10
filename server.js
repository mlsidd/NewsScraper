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

// Require Article models
var Article = require("./models/Article");

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var dbUrl = "mongodb://localhost/mongoHeadlines";

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(dbUrl);
};

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;

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
app.get("/", function(req, res) {
    res.render("index")
})


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.nytimes.com/section/us").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        
        // Now, we grab every h2 within an article tag, and do the following:
        $("div.story-body").each(function(i, element) {
                      
            // Add the text and href of every link, and save them as properties of the result object
            var article = {
                title: $(this).find("h2.headline").text().trim(),
                link: $(this).find("a").attr("href"),
                summary: $(this).find("p.summary").text().trim(),
            }
           
            console.log(`Result ${article}`);
            
      
        // If we were able to successfully scrape and save an Article, send a message to the client
        res.render('index', {article: article});
    });
});
})

// route to to home page
app.get("/articles", function(req, res) {
    Article.find({}).then(function(dbArticle) {
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

//route for getting saved articles
app.get("/savedarticles", function(req, res) {
	Article.find({saved: true}, null, function(err, data) {
		if(data.length === 0) {
			res.render("You have not saved any articles yet.");
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});





app.get("/savedarticles/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		if (data.saved == true) {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: false, status: "Save Article"}}, {new: true}, function(err, data) {
				res.redirect("/");
			});
		}
		else {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: true, status: "Saved"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
