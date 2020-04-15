var NativeAds = (function() {
	var publisher = {};

	var init = function() {
		if (arguments[0] && typeof arguments[0] === 'object') {
			publisher = arguments[0];
		} else {
			return;
		}
		_setup();
	}

	var _setup = function() {
		var script = document.createElement('script');
		script.src = 'https://rtb.adx1.com/system/ip/get?callback=NativeAds.processIP';
		document.getElementsByTagName('head')[0].appendChild(script);

		NativeAds.processIP = function(ip) {
			if (ip) {
				var adcontainer = document.querySelectorAll('.native-ads[data-rows]');
				if (adcontainer.length) {
					for (var i = 0; i < adcontainer.length; i++) {
						var adCount = ((adcontainer[i].parentNode.offsetWidth / 180 ^ 0) * adcontainer[i].getAttribute("data-rows"));
						for (var r = 0; r < adCount; r++) {
							(function() {
								if (publisher.test == '1') {
									_render('test', adcontainer[i]);
								} else {
									var reqBody = {
											'id': new Date().valueOf(),
											'at': 2,
											'site': {
												'id': publisher.siteid,
												'page': window.location.href,
												'publisher': {
													'id': publisher.pubid,
													'domain': window.location.hostname
												}
											},
											'device': {
												'w': window.screen.width,
												'h': window.screen.height,
												'ip': ip,
												'language': window.navigator.language,
												'ua': window.navigator.userAgent
											},
											'imp': [{
												'native': {
													'request': "{\"native\":{\"ver\":\"1.1\",\"assets\":[{\"id\":1,\"required\":1,\"title\":{\"len\":140}},{\"id\":2,\"required\":1,\"img\":{}}, {\"id\":3,\"required\":1,\"data\":{\"type\":2}}, {\"id\":4,\"required\":1,\"data\":{\"type\":1}}, {\"id\":5,\"required\":1,\"img\":{\"type\":3}}]}}"
												},
												'id': '1'
											}]
									};
									_req(reqBody, adcontainer[i]);
								}

							})();
						}
					}
				} else {
					return;
				}
			}
		}
	}

	var _req = function(reqBody, adcontainer) {
		try {
			var endpointURL = publisher.endpoint ? publisher.endpoint : 'https://am-native.hb.adx1.com/';
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status == 200) {
						console.log(`NativeAds response status: ${xmlhttp.status}`);
						_render(xmlhttp.responseText, adcontainer);
					} else {
						console.log(`NativeAds response status: ${xmlhttp.status}`);
						_render('no bid', adcontainer);
					}
				}
			};
			xmlhttp.open('POST', endpointURL, true);
			xmlhttp.send(JSON.stringify(reqBody));
		} catch (e) {
			console.log(e);
		}
	}

	var _render = function(data, adcontainer) {
		try {
			var holderWidth = (100 / (adcontainer.parentNode.offsetWidth / 180 ^ 0));
			adcontainer.setAttribute('style', 'clear: both; overflow: hidden;');

			if (data == 'test') {
				var markup = 
				`<div style='float:left; width: ${holderWidth}%; font-family:Arial; box-sizing: border-box; padding-right:4px; padding-bottom: 4px;' class='richnative-holder-ad'>
				<a href='' target='_blank' style='text-decoration:none; display: inline-block; background-color: #fff;'><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnUlEQVR42u3RQQ0AAAgEIO2f2NdZwzmoQE8qxRktRAhChCBECEKEIESIECEIEYIQIQgRghAhCEGIEIQIQYgQhAhBCEKEIEQIQoQgRAhCECIEIUIQIgQhQhCCECEIEYIQIQgRghCECEGIEIQIQYgQhCBECEKEIEQIQoQgBCFCECIEIUIQIgQhCBGCECEIEYIQIQgRIkQIQoQgRAhCvlshGSjwRjBGxwAAAABJRU5ErkJggg==" style='width:100%;'/>
				<img src='' style='display: none;' /><div style='height:100px; padding: 0 10px;'><div style='color: #000; font-size: 15px; font-weight: bold; padding-top: 10px; padding-bottom: 5px;'>
				Lorem Ipsum is simply dummy text of the printing and typesetting industry. </div><div style='font-size: 11px; color: #6a6a6a; font-weight: bold; margin-bottom:5px;'>Company name</div></div></a></div>`;

				adcontainer.innerHTML = adcontainer.innerHTML + markup;
			
			} else if (data != 'no bid') {
				data = JSON.parse(data);
				var adm = JSON.parse(data.seatbid[0].bid[0].adm);
				var nurl = data.seatbid[0].bid[0].nurl.replace('${AUCTION_PRICE}', data.seatbid[0].bid[0].price);

				var markup = 
				`<div style='float:left; width: ${holderWidth}%; font-family:Arial; box-sizing: border-box; padding-right:4px; padding-bottom: 4px;' class='richnative-holder-ad'>
				<a href='${adm.native.link.url}' target='_blank' style='text-decoration:none; display: inline-block; background-color: #fff;'><img src='${adm.native.assets[4].img.url}' style='width:100%;'/>
				<img src='${nurl}' style='display: none;' /><div style='height:100px; padding: 0 10px;'><div style='color: #000; font-size: 15px; font-weight: bold; padding-top: 10px; padding-bottom: 5px;'>
				${adm.native.assets[2].data.value}</div><div style='font-size: 11px; color: #6a6a6a; font-weight: bold; margin-bottom:5px;'>${adm.native.assets[3].data.value}</div></div></a></div>`;

				adcontainer.innerHTML = adcontainer.innerHTML + markup;

			} else if (data == 'no bid' && adcontainer.innerHTML.indexOf('<!--') !== -1 && adcontainer.innerHTML.indexOf('-->') !== -1) {
				var match, passback = '',
					regex = /<!--(.*?)-->/ig;
				while (match = regex.exec(adcontainer.innerHTML)) {
					passback += match[1];
				}
				var markup = `<div style='float:left; width: ${holderWidth}%; font-family:Arial; box-sizing: border-box; padding-right: 4px; padding-bottom: 4px;' class='richnative-holder-ad'>${passback}</div>`;
				
				adcontainer.innerHTML = adcontainer.innerHTML + markup;
			}
		} catch (e) {}
	};
	
	var _resize = function() {
		var adcontainer = document.querySelectorAll('.native-ads[data-rows]');
		for (var w = 0; w < adcontainer.length; w++) {
			var holder = adcontainer[w].querySelectorAll('.richnative-holder-ad'),
				collCount = (adcontainer[w].parentNode.offsetWidth / 180 ^ 0),
				holderWidth = (100 / collCount);
			for (var i = 0; i < holder.length; i++) {
				holder[i].style.width = holderWidth + '%';
			}
		}
	}
	window.onresize = _resize;

	return {
		init:init,
	}
})();
