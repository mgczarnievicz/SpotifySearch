(function () {
    console.log("Hola", $);
    const $submit = $(".submit-button");
    const $input = $("input");
    const $dropDown = $("select");
    const $result = $(".results-container");
    const $moreButton = $(".more-button");
    const $resultText = $(".result-text");

    $moreButton.hide();

    let $text = "";
    let $artisOrAlbum = "";
    let nextUrl = "";

    console.log("$resultText", $resultText);

    const imageDefualt =
        "https://ps.w.org/replace-broken-images/assets/icon-256x256.png?rev=2561727";

    // DO NOT TOUCH ----------------------------------------------------------------

    // 1. Initialize a handlebars.templates object in case it does not exist
    Handlebars.templates = Handlebars.templates || {};

    // 2. Select the handlebars templates from your HTML document
    var templates = document.querySelectorAll(
        'script[type="text/x-handlebars-template"]'
    );

    // 3. Loop over the templates and compile them
    Array.prototype.slice.call(templates).forEach(function (script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });
    // -----------------------------------------------------------------------------

    function filteringData(items) {
        /* We need the name of the artist, images (url), and href.  */
        let result = items.map(function (each) {
            let resObj = {};
            resObj.name = each.name;
            resObj.image =
                each.images.length > 0 ? each.images[0].url : imageDefualt;
            // resObj.image = each.images[0].url || imageDefualt;

            resObj.spotify_url = each.external_urls.spotify;
            return resObj;
        });

        let resultHtml = Handlebars.templates.resultTemplate({
            items: result,
        });

        $result.append(resultHtml);
    }

    function getData(url, firstGet) {
        $.ajax({
            method: "GET",
            url: url,
            data: {
                query: $text,
                type: $artisOrAlbum,
            },
            success: function (data) {
                data = data.artists || data.albums;

                if (firstGet) {
                    let restultText = $("<p></p>");
                    restultText.addClass("results-text");
                    parseInt(data.total) === 0
                        ? restultText.text("No results")
                        : restultText.text("Results for " + $text);
                    $result.append(restultText);
                }
                // displayingResult(data.items);
                console.log("data.items", data.items);
                filteringData(data.items);

                nextUrl =
                    data.next &&
                    data.next.replace(
                        "api.spotify.com/v1/search",
                        "spicedify.herokuapp.com/spotify"
                    );

                if (location.search === "" && nextUrl) {
                    $moreButton.show();
                } else {
                    // null = false
                    $moreButton.hide();
                    infiniteCheck();
                }
                // nextUrl ? $moreButton.show() : $moreButton.hide();
            },
        });
    }

    $submit.click(function () {
        console.log("Clicked");
        $text = $input.val();
        $artisOrAlbum = $dropDown.val();

        console.log("$text", $text, "\n$artisOrAlbum", $artisOrAlbum);

        $moreButton.hide();
        $result.empty();
        getData("https://spicedify.herokuapp.com/spotify", true);
    });

    $moreButton.click(function () {
        getData(nextUrl, false);
    });

    /* Part 2 - adding the scrolling.*/
    function infiniteCheck() {
        console.log("Infinite Check");

        /* 
        When the height of the window plus the scroll top is equal to the height of the page, 
        the user has reached the bottom, so this is the moment in time where we want to go get more results

            $(window).scrollTop(); //how much i have scroll
            window.innerHeight; //To know the heigh of the window.
            $(document).height(); // how much is the document height.
        
        */

        if (
            $(window).scrollTop() + window.innerHeight >=
            $(document).height() - 200
        ) {
            getData(nextUrl, false);
        } else {
            setTimeout(infiniteCheck, 500);
        }
    }
})();
