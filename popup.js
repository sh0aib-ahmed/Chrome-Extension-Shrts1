function copyToClipboard() {
	var copyText = document.getElementById("outputText");
	copyText.select();
	document.execCommand("copy");
}

function pasteToInputBox(shorternURL) {
	$("#outputText")
		.val(shorternURL)
}


function generateQRCode(surl) {
	let image = $("<img/>", {
		id: "qrImage",
		class: "qrImage",
		src: 'http://chart.apis.google.com/chart?cht=qr&chs=180x180&choe=UTF-8&chld=H|0&chl=' + surl
	});
	$("#qrImage")
		.remove();
	$(document.body)
		.append(image);
}


function loadingState() {
	$(".loading")
		.removeClass("hide");
}

function removeLoader() {
	$(".loading")
		.addClass("hide");
}

function addUrlContainer() {
	$(".url-container")
		.removeClass("hide");
}

function handleActions(lurl, resp) {
	if(!resp.success) {
        removeLoader();
        $('#.error').text(resp.message).removeClass('hide');
        return 0;
    }
	$(".error")
		.addClass("hide");
	saveToStorage(lurl, resp.shortUrl);
	pasteToInputBox(resp.shortUrl);
	removeLoader();
	addUrlContainer();
	generateQRCode(resp.shortUrl);
}


function urlShorten(url) {
	var t;
	var xhr = $.ajax({
		type: 'POST',
		url: 'https://shrts1.herokuapp.com/api/url/',
		data: {
			longUrl: url
		},
		error: function (err) {
			clearTimeout(t);
			$(".error")
				.text("Server Not Responding, Try again later.")
				.removeClass("hide");
			removeLoader();
		},
		success: function (response) {
			clearTimeout(t);
			try {
				handleActions(url, response);
			} catch (e) {
				$(".error")
					.text(e.message)
					.removeClass("hide");
				removeLoader();
			}
		}
	});
	t = setTimeout(function(){
        xhr.abort();
        removeLoader();
        $('#.error').text('Server Not Responding, Try again later.').removeClass('hide');
        return 0;
    },8000)
}

function onWindowLoad() {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {
		var tablink = tabs[0].url;
		if (!checkForUrl(tablink)) {
			$(".error")
				.text("This URL can't be Shortened")
				.removeClass("hide");
			return 0;
		}
		if(isUrlShortened(tablink)) {
			$(".error")
				.text("shrts1.herokuapp.com/ URL can't be Shortened")
				.removeClass("hide");
			return 0;
		}
		$(".error")
			.addClass("hide");
		loadingState();
		urlShorten(tablink);
	});
	$("#copyBtn")
		.on("click", function () {
			copyToClipboard();
		});
	
	$("#history")
		.on("click", function () {
			chrome.tabs.create({
                url: "history.html"
            }, function(tab) { 
                targetId = tab.id;
                window.close();
            });
		});

	function checkForUrl(url) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		return regexp.test(url);
	}

	function isUrlShortened(url) {
		if (url.indexOf("https://shrts1.herokuapp.com") !== -1 || url.indexOf("http://shrts1.herokuapp.com") !== -1 || url.indexOf("shrts1.herokuapp.com") !== -1) {
			return true;
		}
		return false;
	}
}


function saveToStorage(lurl, surl) {
	chrome.storage.local.get({
		"url": []
	}, function (result) {
		if (typeof result.url === "undefined") {
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

window.onload = onWindowLoad();