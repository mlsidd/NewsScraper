// 4 click events for displaying new articles, clearing all articles, and saving an article
$(".newArticles").on("click", scrapeNYTSite());
$(".clearArticles").on("click", clearArticles());
$(".savedArticles").on("click", viewSavedArticles());
$(".saveArticle").on("click", saveArticle());
$(".remove").on("click", removeArticle());
var articleHolder = $(".article-holder");

// function for displaying appropriate thing on the home page
function displayOnPage() {
    // Request to get any unsaved articles from NYT site
    $.get("/articles?saved=false").then(function (data) {
        articleHolder.empty();
        // If there are new articles that have not been saved already, render them to the page
        if (data && data.length) {
           
            // for each article, create the variables to go into index.handlebars
            for (var i = 0; i < data.length; i++) {
                // create a new card to hold article info
                articles = {
                    title: data[i].title,
                    link: data[i].link,
                    summary: data[i].summary,
                    id: data[i].id
                }
            }        
    } else {
        // if there are no new unsaved articles, display message
        articleHolder.append("There are no new articles at this time")
    }
})
} // end of display new articles function

// function for scraping new articles from New York Times site
function scrapeNYTSite() {
    $.get("/scrape").then(function (data) {
        // If scraping of NYT site is successful, render the new articles using the function created above
        displayOnPage();
    });
}

// when click clear button, clear out the articles
function clearArticles() {
    $.get("/clear").then(function () {
        articleHolder.empty();
        displayOnPage();
    });
}

// function attached to save article button - for saving article to db
function saveArticle() {

    var whichArticle = $(this) // attached to whichver button/article user is clicking
      .parents(".card")
      .data(); // retrieve that id that was attached in the function above

    // Remove article card from page
    $(this)
      .parents(".card")
      .remove();

    whichArticle.saved = true; // set value to true 

    // update the article in the db by changing the default saved value of false to true
    $.ajax({
      method: "PUT",
      url: "/articles" + whichArticle.id,
      data: whichArticle
    }).then(function(data) {
      // If data is successfully saved 
      if (data.saved) {
        // reload all articles 
        displayOnPage();
      }
    });
  }

  function removeArticle () {

  }