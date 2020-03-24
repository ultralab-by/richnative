
(function() {

    var endpoint = '//am-native.hb.adx1.com/',
        scriptParams = {},
        adElem = document.querySelectorAll('.adsbyplatform[data-rows]') || undefined,
        scriptElem = document.getElementById('ortbnativejs'),
        domain = window.location.hostname,
        pageURL = window.location.href,
        ua = window.navigator.userAgent,
        width = window.screen.width || window.innerWidth,
        height = window.screen.height || window.innerHeigh,
        language = window.navigator.language || window.navigator.userLanguage;



    (function() {

        if (adElem !== undefined) {

            var script = document.createElement("script");
            script.src = "//rtb.adx1.com/system/ip/get?callback=processIP_n";
            script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(script);

            var pa = scriptElem.src.split("?").pop().split("&");
            for (var j = 0; j < pa.length; j++) {
                var kv = pa[j].split("=");
                scriptParams[kv[0]] = kv[1];
            }
            return scriptParams;

        } else {
            console.log("No ad container tag");
        }

    })();

    window.processIP_n = function(ip) {

        if (scriptParams.endpoint && scriptParams.endpoint.length > 1) {
            endpoint = decodeURIComponent(scriptParams.endpoint);
        }

        rtbRequestJSON(endpoint, ip, rtbResponse);

    };



    function onResize() {
        for (var w = 0; w < adElem.length; w++) {
            var holder = adElem[w].querySelectorAll('.am-holder-ad'),
                collCount = (adElem[w].parentNode.offsetWidth / 180 ^ 0),
                holderWidth = (100 / collCount);
            for (var i = 0; i < holder.length; i++) {
                holder[i].style.width = holderWidth + '%';
            }
        }
    }
    window.onresize = onResize;


    var rtbRequest = function(url, requestJSON, callback) {

        try {

            var xmlhttp;

            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();

                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            callback(xmlhttp.responseText);
                        } else {
                            console.log(xmlhttp.status);
                            callback("No bid");
                        }
                    }
                };
                xmlhttp.open("POST", url, true);
                xmlhttp.send(JSON.stringify(requestJSON));
            }

        } catch (e) {}

    };

    var rtbRequestJSON = function(url, ip, rtbResponse) {

        try {

            for (var i = 0; i < adElem.length; i++) {

                var adCount = ((adElem[i].parentNode.offsetWidth / 180 ^ 0) * adElem[i].getAttribute("data-rows"));

                for (var r = 0; r < adCount; r++) {

                    (function() {

                        var el = adElem[i];
                        var bidFloor = el.getAttribute("data-bidfloor") || "0.000001";
                        var placement = el.getAttribute("data-placement") || "0";

                        var requestJSON = {
                            "id": new Date().valueOf(),
                            "at": 2,
                            "site": {
                                "id": scriptParams.site_id,
                                "page": pageURL,
                                "publisher": {
                                    "id": scriptParams.publisher_id,
                                    "domain": domain
                                }
                            },
                            "device": {
                                "w": width,
                                "h": height,
                                "ip": ip,
                                "language": language,
                                "ua": ua
                            },
                            "imp": [{
                                "native": {
                                    "request": "{\"native\":{\"ver\":\"1.1\",\"assets\":[{\"id\":1,\"required\":1,\"title\":{\"len\":140}},{\"id\":2,\"required\":1,\"img\":{}}, {\"id\":3,\"required\":1,\"data\":{\"type\":2}}, {\"id\":4,\"required\":1,\"data\":{\"type\":1}}, {\"id\":5,\"required\":1,\"img\":{\"type\":3}}]}}"
                                },
                                "bidfloor": bidFloor,
                                "tagid": placement,
                                "id": "1"
                            }]
                        };

                        var callback = function(responseText) {
                            rtbResponse(responseText, el);
                        };
                        rtbRequest(url, requestJSON, callback);
                        

                    })();
                }
            }

        } catch (e) {}
    };

    var rtbResponse = function(data, el) {

        try {

            var holderWidth = (100 / (el.parentNode.offsetWidth / 180 ^ 0));

            el.setAttribute("style", "clear: both; overflow: hidden;");

            if (data != "No bid") {

                data = JSON.parse(data);
                var adm = JSON.parse(data.seatbid[0].bid[0].adm),
                    nurl = data.seatbid[0].bid[0].nurl.replace("${AUCTION_PRICE}", data.seatbid[0].bid[0].price);


                var markup = "<div style='float:left; width:" + holderWidth + "%; font-family:Arial; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; padding-right: 4px;' class='am-holder-ad'><a href='" + adm.native.link.url +
                    "' target='_blank' style='text-decoration:none;'><img src='" + adm.native.assets[4].img.url +
                    "' style='width:100%;'/><img src = '" + nurl + "' style='display: none;' /><div style='height:100px;'><div style='color: #000; font-size: 15px; font-weight: bold; padding-top: 10px; padding-bottom: 5px;'>" + adm.native.assets[2].data.value +
                    "</div><div style='font-size: 11px; color: #6a6a6a; font-weight: bold; margin-bottom:5px;'>" + adm.native.assets[3].data.value + "</div></div></a></div>";

                el.innerHTML = el.innerHTML + markup;

            } else if (data == "No bid" && el.innerHTML.indexOf("<!--") !== -1 && el.innerHTML.indexOf("-->") !== -1) {

                var match, postback = "",
                    regex = /<!--(.*?)-->/ig;
                while (match = regex.exec(el.innerHTML)) {
                    postback += match[1];
                }

                var markup = "<div style='float:left; width:" + holderWidth + "%; font-family:Arial; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; padding-right: 4px;' class='am-holder-ad'>" + postback + "</div>";

                el.innerHTML = el.innerHTML + markup;

            }

        } catch (e) {}

    };

})();
