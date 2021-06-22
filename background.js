function include(file) {
	var script = document.createElement('script');
	script.src = file;
	script.type = 'text/javascript';
	script.defer = true;
	document.getElementsByTagName('head').item(0).appendChild(script);
}
include('jquery-3.5.1.min.js');
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		title: 'Shorten the current hovered link and copy', //No i18n
		contexts: ["link"], //No i18n
		id: "shorternhoverlink" //No i18n
	});
	chrome.contextMenus.create({
		title: 'Shorten the current page link and copy', //No i18n
		contexts: ["all"], //No i18n
		id: "page" //No i18n
	});
	chrome.contextMenus.create({
		title: "Shorten the image url and copy",
		contexts: ["image"],
		id: "shorternlink"
	});
});

function saveToStorage(lurl, surl) {
	chrome.storage.local.get({
		"url": []
	}, function(result) {
		if(typeof result.url === "undefined") {
			result.url = [];
		}
		result.url.push({
			lurl: lurl,
			surl: surl
		});
		chrome.storage.local.set({
			url: result.url
		});
	});
}

function urlShorten(url) {
	$.ajax({
		type: 'POST',
		url: 'https://shrts1.herokuapp.com/api/url/',
		data: {
			longUrl: url
		},
		error: function() {
			reject(Error("Network Error"));
		},
		success: function(response) {
			try {
				if(response.success) {
					var shortUrl = response.shortUrl;
					saveToStorage(url, shortUrl);
					copyTextToClipboard(shortUrl);
				}
			} catch(e) {
				reject(Error(e));
			}
		}
	});
}
chrome.contextMenus.onClicked.addListener(onClickHandler);

function copyTextToClipboard(data) {
	console.trace(data);
	var copyFrom = document.createElement("textarea");
	copyFrom.textContent = data;
	var body = document.getElementsByTagName('body')[0];
	body.appendChild(copyFrom);
	copyFrom.select();
	document.execCommand('copy');
	body.removeChild(copyFrom);
}

function onClickHandler(info, tabs) {
	info.linkUrl = info.linkUrl || info.pageUrl;
	if(info.menuItemId !== "shorternhoverlink") {
		if(tabs.url) {
			info.linkUrl = tabs.url;
		}
		if(info.srcUrl) {
			info.linkUrl = info.srcUrl;
		}
	}
	urlShorten(info.linkUrl);
}