$(function() { // Same as document.addEventListener("DOMContentLoaded"...

    // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
    $("#navbarToggle").blur(function(event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            $("#collapsable-nav").collapse('hide');
        }
    });
});

(function(global) {
    $(document).on('click', '.number-spinner button', function() {
        var btn = $(this),
            oldValue = btn.closest('.number-spinner').find('input').val().trim(),
            newVal = 0;

        if (btn.attr('data-dir') == 'up') {
            newVal = parseInt(oldValue) + 1;
        } else {
            if (oldValue > 1) {
                newVal = parseInt(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }
        btn.closest('.number-spinner').find('input').val(newVal);
    });

    var dc = {};
    var homeHtmlUrl = "snippets/home-snippet.html";
    var allCategoriesUrl = "Others/categories.json";
    var categoriesTitleHtml = "snippets/title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemsUrl =
        "Others/";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";
    var itemUrl = "snippets/item-snippet.html";
    var aboutMeHtmlUrl = "snippets/aboutMe-snippet.html";
    var mailMeHtmlUrl = "snippets/mailMe-snippet.html";
    var orderRuleHtmlUrl = "snippets/orderRule-snippet.html";
    var logInHtmlUrl = "snippets/logIn-snippet.html";
    var shopCarHtmlUrl = "snippets/shopCar-title.html";
    var shopCarItemHtmlUrl = "snippets/shopCar-snippet.html";

    function insertHtml(selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    function loadHomePhoto(selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
        var screenWidth = window.innerWidth;
        var size = "";

        if (screenWidth <= 767)
            size = "xxs";
        else
            size = "1000";
        for (let i = 0; i < 3; i++) {
            let idName = "homePhoto" + (i + 1);
            let filename = "images/pexels" + (i + 1) + "_" + size + ".jpg";
            document.getElementById(idName).src = filename;
        }
    }

    function showLoading(selector) {
        var html = "<div class='text-center'>";
        html += "<img src='images/loading.gif'></div>";
        insertHtml(selector, html);
    };

    function changeBackgroundColor(change) {
        var dom = document.querySelector("body");
        if (change) {
            dom.style.background = "-webkit-linear-gradient(white, #ff9966)";
            /* For Safari 5.1 to 6.0 */
            dom.style.background = "-o-linear-gradient(white, #ff9966)";
            /* For Opera 11.1 to 12.0 */
            dom.style.background = "-moz-linear-gradient(white, #ff9966)";
            /* For Firefox 3.6 to 15 */
            dom.style.background = "linear-gradient(white, #ff9966)";
        } else {
            dom.style.background = "linear-gradient(white, white)";
            dom.style.background = "-webkit-linear-gradient(white, white)";
            dom.style.background = "-o-linear-gradient(white, white)";
            dom.style.background = "-moz-linear-gradient(white, white)";
        }
    };

    var insertProperty = function(string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string
            .replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    };

    document.addEventListener("DOMContentLoaded", function(event) {
        showLoading("#main-content");
        changeBackgroundColor(true);
        $ajaxUtils.sendGetRequest(
            homeHtmlUrl,
            function(homeHtml) {
                loadHomePhoto("#main-content", homeHtml);
            },
            false); // False here because we are getting just regular HTML from the server, so no need to process JSON.
    });

    // Load the menu categories view
    dc.loadMenuCategories = function() {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            allCategoriesUrl, //categories json file path
            buildAndShowCategoriesHTML);
    };

    function buildAndShowCategoriesHTML(categories) {
        // Load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml, //title-snippet.html: catergory title content
            function(categoriesTitleHtml) {
                // Retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    categoryHtml, //category-snippet.html
                    function(categoryHtml) {
                        // Switch CSS class active to menu button
                        switchMenuToActive();

                        var categoriesViewHtml =
                            buildCategoriesViewHtml(categories,
                                categoriesTitleHtml,
                                categoryHtml);
                        insertHtml("#main-content", categoriesViewHtml);
                    },
                    false);
            },
            false);
    }

    var switchMenuToActive = function() {
        // Remove 'active' from home button
        var classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;

        // Add 'active' to menu button if not already there
        classes = document.querySelector("#navMenuButton").className;
        if (classes.indexOf("active") === -1) {
            classes += " active";
            document.querySelector("#navMenuButton").className = classes;
        }
    };

    function buildCategoriesViewHtml(categories,
        categoriesTitleHtml,
        categoryHtml) {

        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";

        // Loop over categories
        for (var i = 0; i < categories.length; i++) {
            // Insert category values
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html =
                insertProperty(html, "name", name);
            html =
                insertProperty(html, "short_name", short_name);
            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }

    // Appends price with '$' if price exists
    function insertItemPrice(html,
        pricePropName,
        priceValue) {
        // If not specified, replace with empty string
        if (!priceValue) {
            return insertProperty(html, pricePropName, "");
        }

        priceValue = "$" + priceValue;
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }

    // Load the menu items view
    // 'categoryShort' is a short_name for a category
    dc.loadMenuItems = function(categoryShort) {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            menuItemsUrl + categoryShort + ".json",
            buildAndShowMenuItemsHTML);
    };

    // Builds HTML for the single category page based on the data
    // from the server
    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        // Load title snippet of menu items page
        $ajaxUtils.sendGetRequest(
            menuItemsTitleHtml,
            function(menuItemsTitleHtml) {
                // Retrieve single menu item snippet
                $ajaxUtils.sendGetRequest(
                    menuItemHtml,
                    function(menuItemHtml) {
                        // Switch CSS class active to menu button
                        switchMenuToActive();

                        var menuItemsViewHtml =
                            buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml);
                        insertHtml("#main-content", menuItemsViewHtml);
                    },
                    false);
            },
            false);
    }


    // Using category and menu items data and snippets html
    // build menu items view HTML to be inserted into page
    function buildMenuItemsViewHtml(categoryMenuItems,
        menuItemsTitleHtml,
        menuItemHtml) {

        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                "name",
                categoryMenuItems.category.name);
        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                "special_instructions",
                categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";

        // Loop over menu items
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for (var i = 0; i < menuItems.length; i++) {
            // Insert menu item values
            var html = menuItemHtml;
            html =
                insertProperty(html, "short_name", menuItems[i].short_name);
            html =
                insertProperty(html,
                    "catShortName",
                    catShortName);
            html =
                insertItemPrice(html,
                    "price",
                    menuItems[i].price);
            html =
                insertProperty(html,
                    "name",
                    menuItems[i].name);
            // Add clearfix after every second menu item
            /*if (i % 2 !== 0) {
              html +=
                "<div class='clearfix visible-lg-block visible-md-block'></div>";
            }*/

            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }



    // Load the item view
    // 'categoryShort' is a short_name for a category
    dc.loadItem = function(categoryShort, shortName) {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            menuItemsUrl + categoryShort + ".json",
            // Builds HTML for the single category page based on the data
            // from the server
            function buildAndShowItemHTML(categoryMenuItems) {
                console.log("categoryMenuItems= " + categoryMenuItems);
                // Load title snippet of menu items page
                $ajaxUtils.sendGetRequest(
                    menuItemsTitleHtml,
                    function(menuItemsTitleHtml) {
                        // Retrieve single menu item snippet
                        $ajaxUtils.sendGetRequest(
                            itemUrl,
                            function(itemUrl) {
                                // Switch CSS class active to menu button
                                switchMenuToActive();

                                var menuItemsViewHtml =
                                    buildItemViewHtml(categoryMenuItems,
                                        menuItemsTitleHtml,
                                        itemUrl, shortName);
                                insertHtml("#main-content", menuItemsViewHtml);
                            },
                            false);
                    },
                    false);
            }
        );
    };



    // Using category and menu items data and snippets html
    // build menu items view HTML to be inserted into page
    function buildItemViewHtml(categoryMenuItems,
        menuItemsTitleHtml,
        menuItemHtml, shortName) {

        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                "name",
                categoryMenuItems.category.name);
        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                "special_instructions",
                categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";

        // Loop over menu items
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for (var i = 0; i < menuItems.length; i++) {
            if (menuItems[i].short_name === shortName) {
                // Insert menu item values
                var html = menuItemHtml;
                html =
                    insertProperty(html, "short_name", menuItems[i].short_name);

                html =
                    insertProperty(html,
                        "catShortName",
                        catShortName);

                html =
                    insertItemPrice(html,
                        "price",
                        menuItems[i].price);

                html =
                    insertProperty(html,
                        "id",
                        menuItems[i].id);

                html =
                    insertProperty(html,
                        "name",
                        menuItems[i].name);

                html =
                    insertProperty(html,
                        "description",
                        menuItems[i].description);

                // Add clearfix after every second menu item
                if (i % 2 !== 0) {
                    html +=
                        "<div class='clearfix visible-lg-block visible-md-block'></div>";
                }

                finalHtml += html;
            }
        }

        finalHtml += "</section>";
        return finalHtml;
    }


    dc.loadAboutMe = function() {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            aboutMeHtmlUrl,
            function(aboutMeHtmlUrl) {
                insertHtml("#main-content", aboutMeHtmlUrl);
            },
            false);
    };

    dc.loadMailMe = function() {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            mailMeHtmlUrl,
            function(mailMeHtmlUrl) {
                insertHtml("#main-content", mailMeHtmlUrl);
            },
            false);
    };

    dc.loadOrderRule = function() {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            orderRuleHtmlUrl,
            function(orderRuleHtmlUrl) {
                insertHtml("#main-content", orderRuleHtmlUrl);
            },
            false);
    };

    dc.loadlogIn = function() {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            logInHtmlUrl,
            function(logInHtmlUrl) {
                insertHtml("#main-content", logInHtmlUrl);
            },
            false);
    };

    dc.loadShopCar = function() {
        showLoading("#main-content");
        changeBackgroundColor(false);
        $ajaxUtils.sendGetRequest(
            shopCarHtmlUrl,
            function(shopCarHtmlUrl) {
                $ajaxUtils.sendGetRequest(
                    shopCarItemHtmlUrl,
                    function(shopCarItemHtmlUrl) {
                        var menuItemsViewHtml =
                            buildAndShowShopList(shopCarHtmlUrl, shopCarItemHtmlUrl);
                        insertHtml("#main-content", menuItemsViewHtml);
                    },
                    false);
            },
            false);
    };

    function itemInfo(id_, qt_, name_, imgSrc_, price_, totalPrice_) {
        this.id = id_;
        this.name = name_;
        this.qt = Number(qt_);
        this.imgSrc = imgSrc_;
        this.price = price_;
        this.totalPrice = totalPrice_;
    }

    function buildAndShowShopList(shopCarHtmlUrl, shopCarItemHtmlUrl) {
        var boughtItems = JSON.parse(localStorage.getItem("additems"));
        var finalHtml = shopCarHtmlUrl;
        finalHtml += "<section class='row'>";
        
        for (var i in boughtItems) {
            var itemHtml = shopCarItemHtmlUrl;
            itemHtml =
                insertProperty(itemHtml,
                    "id",
                    boughtItems[i].id);

            itemHtml =
                insertProperty(itemHtml,
                    "name",
                    boughtItems[i].name);

            itemHtml =
                insertProperty(itemHtml,
                    "qt",
                    boughtItems[i].qt);

            itemHtml =
                insertProperty(itemHtml,
                    "price",
                    boughtItems[i].totalPrice);

            itemHtml =
                insertProperty(itemHtml,
                    "imgSrc",
                    boughtItems[i].imgSrc);
            
            finalHtml += itemHtml;
        }
        finalHtml += "</section>";
        return finalHtml;
    }


    var addNewItem = function(items, currentItemInfo) {
        var isExist = false;
        var idx = 0;
        var len = items.length;

        for (var i = 0; i < len; i++) {
            if (items[i].id == currentItemInfo.id) {
                isExist = true;
                idx = i;
                break;
            }
        }

        if (isExist){
            items[idx].qt += Number(currentItemInfo.qt);
            items[idx].totalPrice = "$" + Number(items[idx].price.slice(1)) * items[idx].qt;
        } else {
            items[len] = new itemInfo(
                currentItemInfo.id,
                currentItemInfo.qt,
                currentItemInfo.name,
                currentItemInfo.imgSrc,
                currentItemInfo.price,
                currentItemInfo.totalPrice
                );
        }
        return items;
    }

    dc.clickBuy = function() {
        if (0) {
            localStorage.removeItem("additems");
        } else {

            var items = [];
            if (localStorage.additems) {
                items = JSON.parse(localStorage.getItem("additems"));
            }

            var currentItemInfo = new itemInfo();
            currentItemInfo.id = document.getElementById("buyNo").innerHTML;
            currentItemInfo.name = document.getElementById("buyName").innerHTML;
            var idxOfImg = document.getElementById("itemImg").src.indexOf("images");
            currentItemInfo.imgSrc = document.getElementById("itemImg").src.slice(idxOfImg);
            currentItemInfo.qt = document.getElementById("quantity").value;
            currentItemInfo.price = document.getElementById("buyPrice").innerHTML;
            currentItemInfo.totalPrice = "$" + Number(currentItemInfo.price.slice(1)) * currentItemInfo.qt;
            items = addNewItem(items, currentItemInfo);
            console.log(items);
            localStorage.setItem("additems", JSON.stringify(items));
        }
    };

    function reCalculate(stat, id, value) {
        var boughtItems = JSON.parse(localStorage.getItem("additems"));
        var len = boughtItems.length;

        for (var i = 0; i < len; i++) {
            if (boughtItems[i].id == id) {
                idx = i;
                break;
            }
        }
        var qt = document.getElementById("modifiedQt" + id).value;
        if(stat == "up")
       　    boughtItems[idx].qt = Number(qt) + 1;
        else if (stat == "dwn")
            boughtItems[idx].qt = Number(qt) - 1;
        else if(stat == "qt")
            boughtItems[idx].qt = qt;

        boughtItems[idx].totalPrice = "$" + Number(boughtItems[idx].price.slice(1)) * boughtItems[idx].qt;
        if( boughtItems[idx].totalPrice == "$0")
            boughtItems[idx].totalPrice = boughtItems[idx].price;
        console.log(　boughtItems[idx].totalPrice );
        document.getElementById("buyPrice" + id).innerHTML = boughtItems[idx].totalPrice;
        localStorage.setItem("additems", JSON.stringify(boughtItems));
    }

    dc.reCalulatePriceUp = function(id, value) {
        reCalculate("up", id, value);
    }

    dc.reCalulatePriceDwn = function(id, value) {
        reCalculate("dwn", id, value);
    }

    dc.modiefingPrice = function(id, value) {
        reCalculate("qt", id, value);
        
    }

    global.$dc = dc;

})(window);