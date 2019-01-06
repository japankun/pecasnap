/**
 *  pecasnap.js
 */

const reloadInterval = 30 * 1000;
const pecaSnapPort = "37144";

let menuState = false;
let status = {
	'albumMode': false
};
let app = {
	'peercastIP': '',
	'peercastPort': '',
};

appInitialize();
setInterval(getxml, reloadInterval);
setInterval(countDown, 1000);

function appInitialize () {

	getSetting();
	setTimeout(getxml, 500);
	album();

}

function getxml () {

	$.ajax({
		url:"http://" + app.peercastIP + ":" + app.peercastPort + "/admin?cmd=viewxml",
		type:'get',
		dataType:'xml',
		timeout: 3000,
		success: chlist
	});

	$("#countdown").text(reloadInterval / 1000);

}

function countDown () {

	$("#countdown").text($("#countdown").text()-1);
	return;

}

function capture (streamId) {

	$.ajax({
		url: "http://127.0.0.1:" + pecaSnapPort + "/capture/" + streamId,
		type: 'get',
		success: function () {
			setTimeout(album, 4000, "");
		}
	})

}

function album () {

	if (status.albumMode == true) {
		return;
	}

	$.ajax({
		url: "http://127.0.0.1:" + pecaSnapPort + "/album/all?" + Date.now(),
		type: 'get',
		success: function (data) {

			$('#album').text("");

			let album = [];

			if (12 < data.length) {
				while (album.length < 12) {
					album.push(data.shift());
				}
			} else {
				album = data;
			}

			album.forEach (function (img) {
				$('<a href="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + img + '"><img src="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + img + '" width="160" class="col-s-12 col-m-3 col-l-2" data-lity></a>').appendTo('#album');
			})
			
		}
	});

}

function past (streamId) {

	$.ajax({
		url: "http://127.0.0.1:" + pecaSnapPort + "/album/" + streamId + '?' + Date.now(),
		type: 'get',
		success: function (data) {

			status.albumMode = true;

			$('#album').text("");
			$('#albumname').html('アルバムモード <a href="#" onclick="disableAlbumMode();">解除</a>');

			let album = [];
			album = data;

			album.forEach (function (img) {
				$('<a href="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + img + '"><img src="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + img + '" width="160" class="col-s-12 col-m-3 col-l-2" data-lity></a>').appendTo('#album');
			})
			
		}
	});

}

function disableAlbumMode () {

	status.albumMode = false;
	$('#albumname').text('過去の画像');
	album();

}

function setSetting () {

	$('#progress').css('display', 'block');
	$('#progressbar').css('width', '50%');

	$.ajax({
		url: "http://127.0.0.1:" + pecaSnapPort + "/config",
		type: 'post',
		data: {
			'peercastIP': $("#peercastip").val(),
			'peercastPort': $("#peercastport").val()
		},
		success: function () {
			$('#progressbar').css('width', '100%');
			$('#progressbar').text("保存しました");
		}
	})

}

function getSetting () {

	$.ajax({
		url: "http://127.0.0.1:" + pecaSnapPort + "/config",
		type: 'get',
		success: function (data) {
			$("#peercastip").val(data.peercastIP);
			$("#peercastport").val(data.peercastPort);

			app.peercastIP = data.peercastIP;
			app.peercastPort = data.peercastPort;	
		}
	})

}

function chlist (xml, status) {
	
	let channels = $(xml).find('peercast>channels_found>channel');
	$('#chsum').text(channels.length);
	$('#chlist').text("");
	$('#live1').text("");
	$('#live2').text("");

	let chstatus;
	let chInfo = [];
	let args = Date.now();
	
	for (i=0;i<channels.length;i++) {

		chInfo['streamId'] = channels[i].attributes.id.value;
		chInfo['Name'] = channels[i].attributes.name.value;
		capture(chInfo['streamId']);

		switch (channels[i].children[1].attributes[3].value) {

			case 'RECEIVE':
				chstatus = '<span class="ms-notification ms-green ms-small" title="RECEIVE">RE</span> ';
			break;

			case'ERROR':
				chstatus = '<span class="ms-notification ms-small" title="ERROR">ER</span> ';
			break;

			case'SEARCH':
				chstatus = '<span class="ms-notification ms-small" title="SEARCH">SC</span> ';
			break;

			default:
				chstatus = '<span class="ms-notification ms-small" title="UNKNOWN">?</span> ';
			break;
			
		}

		$('<a href="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + chInfo['streamId'] + '.webp?'+ args +'"><img src="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + chInfo['streamId'] + '.webp?'+ args +'" width="180" title="'+ chInfo['Name'] +'" class="col-s-12 col-m-4 col-l-3 live1" data-lity></a>').appendTo('#live1');
		$('<a href="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + chInfo['streamId'] + '.webp?'+ args +'"><img src="http://127.0.0.1:' + pecaSnapPort + '/snapshot/' + chInfo['streamId'] + '.webp?'+ args +'" width="180" title="'+ chInfo['Name'] +'" data-lity></a>').appendTo('#live2');
		$('<li>' + chstatus + '<a href="javascript:void(0);" onclick="past(\''+ chInfo['streamId'] + '\');">' + chInfo['Name'] + '</a></li>').appendTo('#chlist');

	}

	album();
	
}

function minimum () {

	if (menuState) {
		$(".min").css("display","inline");
		$("#live1").css("display","none");
		$("body").css("background", "#fefefe");
	} else {
		$(".min").css("display","none");
		$("#live1").css("display","inline");
		$("body").css("background", "#222");
	}

	menuState = !menuState;

}