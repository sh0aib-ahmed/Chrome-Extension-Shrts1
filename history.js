window.onload = function() {
	document.getElementById("deleteHistory").onclick = function() {
		chrome.storage.local.set({
			"url": []
		});
		window.location.reload();
	};
	chrome.storage.local.get({
		"url": []
	}, function(result) {
		var loop = 0;
		for(loop = result.url.length - 1; loop >= 0; loop--) {
			appendValue(result.url[loop].lurl, result.url[loop].surl);
		}
		if(result.url.length > 0) {
			document.getElementById("noc").style.display = "none";
		}
	});
}

function appendValue(lurl, surl) {
	var tableRef = document.getElementById('tableBody');
	if(!surl) {
		return;
	}
	var newRow = tableRef.insertRow(tableRef.rows.length);
	var newCell = newRow.insertCell(0);
	var a = document.createElement('a');
	var linkText = document.createTextNode(lurl);
	var href = lurl;
	a.appendChild(linkText);
	a.target = "_blank";
	a.rel = "noreferrer";
	a.href = href;
	newCell.appendChild(a);
	newCell = newRow.insertCell(1);
	var a = document.createElement('a');
	var linkText = document.createTextNode(surl);
	var href = surl;
	a.appendChild(linkText);
	a.target = "_blank";
	a.rel = "noreferrer";
	a.href = href;
	newCell.appendChild(a);
}