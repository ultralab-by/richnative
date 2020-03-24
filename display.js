
(function() {

    var endpoint = '//am-display.hb.adx1.com/',
        scriptParams = {},
        adElem = document.querySelectorAll('.adsbyplatform[data-size]') || undefined,
        scriptElem = document.getElementById('ortbdisplayjs'),
        domain = window.location.hostname,
        pageURL = window.location.href,
        ua = window.navigator.userAgent,
        width = window.screen.width || window.innerWidth,
        height = window.screen.height || window.innerHeigh,
        language = window.navigator.language || window.navigator.userLanguage;

    (function() {

        if (adElem !== undefined) {

            var script = document.createElement("script");
            script.src = "//rtb.adx1.com/system/ip/get?callback=processIP_d";
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

    window.processIP_d = function(ip) {
        
        if (scriptParams.endpoint && scriptParams.endpoint.length > 1) {
            endpoint = decodeURIComponent(scriptParams.endpoint);
        }
        
        rtbRequestJSON(endpoint, ip, rtbResponse);

    };

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
                            console.log("No bid");
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

                (function() {


                    var el = adElem[i];
                    
                        var bannerSize = el.getAttribute("data-size").split("x");
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
                                    "banner": {
                                        "w": parseInt(bannerSize[0]),
                                        "h": parseInt(bannerSize[1])
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
        } catch (e) {}
    };

    var rtbResponse = function(data, el) {

        try {

            if (data != "No bid" ) {

                data = JSON.parse(data);

                var ad = data.seatbid[0].bid[0].adm;
                    ad = ad.replace("${AUCTION_PRICE}", data.seatbid[0].bid[0].price);

                    renderAd(el, ad);

            } else if (data == "No bid" && el.innerHTML.length > 10) {

                var ad = el.innerHTML;
                    ad = ad.replace(/<!--|-->/gi, '');

                    renderAd(el, ad);

            }

        } catch (e) {}

    };

    var renderAd = function(el, ad) {

        try {

            var size = el.getAttribute("data-size").split("x");
            el.setAttribute("style", "line-height: 0;");

            var sFrameName = "sf-"+ new Date().valueOf();
            var sFrame = document.createElement("iframe");
                sFrame.setAttribute("name", sFrameName);
                sFrame.setAttribute("scrolling", "no");
                sFrame.style.border = "0";
                sFrame.style.width = size[0] + "px";
                sFrame.style.height = size[1] + "px";
                el.appendChild(sFrame);
            var css = "" +
                '<style type="text/css">' +
                'body{margin:0;padding:0;background:transparent}' +
                '</style>';
            var sFrameDocument = window.frames[sFrameName].document;
                sFrameDocument.open();
                sFrameDocument.write(css);
                sFrameDocument.write(ad);
                sFrameDocument.close();

        } catch (e) {}

    };

})();
