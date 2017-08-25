var ua;
var pc_config = "";
var currentSession;
var remoteStream = document.getElementById("remoteView");
var selfStream = document.getElementById("selfView");
//var call_option_buttons = document.getElementById("call-option-buttons");
var mute_audio_button = document.getElementById("mute-audio");
var hide_video_button = document.getElementById("hide-video");
var mute_audio_icon = document.getElementById("mute-audio-icon");
var hide_video_icon = document.getElementById("hide-video-icon");
var hold_button = document.getElementById("hold-call");
var debug = false; //console logs event info if true
var jssip_debug = false; //enables debugging logs from jssip library if true NOTE: may have to refresh a lot to update change


//setup for the call. creates and starts the User Agent (UA) and registers event handlers
function register_jssip(ws_server, my_sip_uri, sip_password, stunServer) {
	if (stunServer)
		pc_config = stunServer;

	if (jssip_debug) JsSIP.debug.enable('JsSIP:*');
	else JsSIP.debug.disable('JsSIP:*');

	// Create our JsSIP instance and run it:
	var socket = new JsSIP.WebSocketInterface(ws_server);

	var configuration = {
		sockets: [socket],
		uri: my_sip_uri,
		password: sip_password
	};

	ua = new JsSIP.UA(configuration);
	ua.start();

	//the event handlers for UA events
	ua.on('connecting', function (e) {
		if (debug) console.log("\nUA - CONNECTING");
	});
	ua.on('connected', function (e) {
		if (debug) console.log("\nUA - CONNECTED:  \nTRANSPORT:\n" + e.via_transport + "\nURL:\n" + e.url + "\nSIP_URI:\n" + e.sip_uri);
	});
	ua.on('disconnected', function (e) {
		if (debug) console.log("\nUA - DISCONNECTED: \nREASON:\n" + e.reason);
	});
	ua.on('registered', function (e) {
		if (debug) console.log("\nUA - REGISTERED:\n RESPONSE:\n" + e.response);
	});
	ua.on('unregistered', function (e) {
		if (debug) console.log("\nUA - UNREGISTERED:\n CAUSE:\n" + e.cause);
	});
	ua.on('registrationFailed', function (e) {
		if (debug) console.log("\nUA - REGISTRATIONFAILED : \nCAUSE:\n" + e.cause);
	});
	ua.on('newMessage', function (e) {
		if (debug) console.log("\nUA - NEWMESSAGE");
	});
	ua.on('newRTCSession', function (e) {
		//e.request.body = edit_request(e.request.body);
		currentSession = e.session;

		if (debug) console.log("\nUA - NEWRTCSESSION : \nORIGINATOR:\n" + e.originator + "\nSESSION:\n" + e.session + "\nREQUEST:\n" + e.request);

		//the event handlers for the rtcpeerconnection events
		currentSession.on('peerconnection', function (e) {
			if (debug) console.log('\nCURRENTSESSION - PEER CONNECTION');
		});
		currentSession.on('connecting', function (e) {
			//e.request.body = edit_request(e.request.body);
			if (debug) console.log('\nCURRENTSESSION -  CONNECTING:\nREQUEST: \n' + e.request);
		});
		currentSession.on('sending', function (e) {
			//e.request.body = edit_request(e.request.body);
			if (debug) console.log('\nCURRENTSESSION - SENDING: \nREQUEST: \n' + e.request);
		});
		currentSession.on('progress', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  PROGRESS: \nRESPONSE: \n' + e.response);
		});
		currentSession.on('accepted', function (e) {
			//e.response = edit_response(e.response);
			if (debug) console.log('\nCURRENTSESSION -  ACCEPTED: \nRESPONSE: \n' + e.response + "\nORIGINATOR:\n" + e.originator);
			//toggle_incall_buttons(true);
			start_self_video();
		});
		currentSession.on('confirmed', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  CONFIRMED: \nRESPONSE:\n' + e.response + "\nORIGINATOR:\n" + e.originator);
		});
		currentSession.on('ended', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  ENDED: \nMESSAGE:\n' + e.message + "CAUSE:\n" + e.cause);
			terminate_call();
		});
		currentSession.on('failed', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  FAILED: \nMESSAGE:\n' + e.message + "\nCAUSE:\n" + e.cause + "\nORIGINATOR:\n" + e.originator);
			terminate_call();
		});
		currentSession.on('newDTMF', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  NEWDTMF: \nREQUEST:\n ' + e.request + "\nDTMF:\n" + e.dtmf);
		});
		currentSession.on('newInfo', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  NEWINFO: \nINFO:\n' + e.info + "\nrequest:\n" + e.request);
		});
		currentSession.on('hold', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  HOLD ');
		});
		currentSession.on('unhold', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  UNHOLD ');
		});
		currentSession.on('muted', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  MUTED ');
		});
		currentSession.on('unmuted', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  UNMUTED ');
		});
		currentSession.on('reinvite', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  REINVITE ');
		});
		currentSession.on('refer', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  REFER ');
		});
		currentSession.on('replaces', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  REPLACES ');
		});
		currentSession.on('sdp', function (e) {
			//e.sdp = edit_request(e.sdp);
			if (debug) console.log('\nCURRENTSESSION -  SDP \nORIGINATOR:\n' + e.originator + "\nTYPE:\n" + e.type + "\nSDP:\n" + e.sdp);

		});
		currentSession.on('getusermediafailed', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  GET USER MEDIA FAILED ');
		});
		currentSession.on('peerconnection:createofferfailed', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  PEERCONNECTION : CREATEOFFER FAILED ');
		});
		currentSession.on('peerconnection:createanswerfailed', function (e) {
			if (debug) console.log('\nCURRENTSESSION -  PEERCONNECTION : CREATE ANSWER FAILED ');
		});
		currentSession.on('peerconnection:setlocaldescriptionfailed', function (e) {
			if (debug) console.log('\nCURRENTSESSION - PEERCONNECTION : SET LOCAL DESCRIPTION FAILED ');
		});
		currentSession.on('peerconnection:setremotedescriptionfailed', function (e) {
			if (debug) console.log('\nCURRENTSESSION - PEERCONNECTION : SET REMOTE DESCRIPTION FAILED ');
		});

		//event listener for remote video. Adds to html page when ready. 
		//NOTE: has to be both here and in accept_call() because currentSession.connection is not established until after ua.answer() for incoming calls
		if (currentSession.connection) currentSession.connection.ontrack = function (e) {
			if (debug) console.log("STARTING REMOTE VIDEO\ne.streams: " + e.streams + "\ne.streams[0]: " + e.streams[0]);
			remoteStream.srcObject = e.streams[0];
			remoteStream.play();
		};

	});

	//if (debug) console.log("CONNECTED\nws_server: " + ws_servers.getAttribute("name") + "\nsip_uri: " + my_sip_uri.getAttribute("name"));
	if (debug) console.log("CONNECTED\nws_server: " + ws_server + "\nsip_uri: " + my_sip_uri);

}

//makes a call
//@param other_sip_uri: is the sip uri of the person to call
/*
function start_call(other_sip_uri)
{
	var options = {
	  'mediaConstraints' : { 'audio': true, 'video': true },
	  'pcConfig': {
      'rtcpMuxPolicy': 'negotiate',
	   	'iceServers': [{
	   		'urls': [
	   			pc_config
	   		]
	   	}]
	   }
	};
	 
	ua.call(other_sip_uri, options);
}*/

function onRemoteStreamAdded(event) {

	console.log("************ ON REMOTE STREAM DDED *****************");

}

//answers an incoming call
function accept_call() {
	console.log("ICE Server: |" + pc_config + "|")
	if (currentSession) {
		var options = {
			'mediaConstraints': {
				'audio': true,
				'video': true
			},
			'pcConfig': {
				'rtcpMuxPolicy': 'negotiate',
				'iceServers': [{
					'urls': [
						pc_config
					]
				}]
			}
		};
		currentSession.answer(options);


		//event listener for remote video. Adds to html page when ready. 
		//NOTE: needs to be both here and in the newRTCSession event listener because currentSession.connection is not established until after ua.answer() for incoming calls
		if (currentSession.connection) currentSession.connection.ontrack = function (e) {
			//if(debug) console.log("STARTING REMOTE VIDEO\ne.streams: " + e.streams + "\ne.streams[0]: " + e.streams[0]);

			console.log('ontrack:' + JSON.stringify(e));
			remoteStream.srcObject = e.streams[0];
			remoteStream.play();
			record_call();
		};
	}
}


//starts the local streaming video. Works with some older browsers, if it is incompatible it logs an error message, and the selfStream html box stays hidden
function start_self_video() {
	console.log("Start Self Video");
	if (selfStream.hasAttribute("hidden")) //then the video wasn't already started
	{
		// Older browsers might not implement mediaDevices at all, so we set an empty object first
		if (navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {};
		}

		// Some browsers partially implement mediaDevices. We can't just assign an object
		// with getUserMedia as it would overwrite existing properties.
		// Here, we will just add the getUserMedia property if it's missing.
		if (navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = function (constraints) {
				// First get ahold of the legacy getUserMedia, if present
				var getUserMedia = navigator.msGetUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
				//var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

				// Some browsers just don't implement it - return a rejected promise with an error
				// to keep a consistent interface
				if (!getUserMedia) {
					return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
				}

				// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
				return new Promise(function (resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject);
				});
			}
		}

		navigator.mediaDevices.getUserMedia({
				audio: true,
				video: true
			})
			//navigator.mediaDevices.getUserMedia({ audio: false, video: true }) 
			.then(function (stream) {
				selfStream.removeAttribute("hidden");
				// Older browsers may not have srcObject
				if ("srcObject" in selfStream) {
					selfStream.srcObject = stream;
				} else {
					// Avoid using this in new browsers, as it is going away.
					selfStream.src = window.URL.createObjectURL(stream);
				}
				window.self_stream = stream;
				selfStream.onloadedmetadata = function (e) {
					selfStream.play();
				};
			})
			.catch(function (err) {
				console.log(err.name + ": " + err.message);
			});
	}
}

//toggles showing the call option buttons at the bottom of the video window (ie end call, mute, etc).
//The buttons themselves are in acedirect and the complaint_form, this simply un-hides them
//@param make_visible: boolean whether or not to show the call option buttons
function toggle_incall_buttons(make_visible) {
	if (make_visible) call_option_buttons.style.display = "block";
	else call_option_buttons.style.display = "none";
}

//handles cleanup from jssip call. removes the session if it is active and removes video.
function terminate_call() {
	if (currentSession) {
		if (!currentSession.isEnded()) currentSession.terminate();
	}
	console.log('terminate_call()');
	remove_video();
	upload_call();
	// if(ua) ua.stop(); 
}

//terminates the call (if present) and unregisters the ua
function unregister_jssip() {
	terminate_call();
	if (ua) ua.stop();
}

//removes both the remote and self video streams and replaces it with default image. stops allowing camera to be active. also hides call_options_buttons.
function remove_video() {
	selfStream.setAttribute("hidden", true);
	selfStream.pause();
	remoteStream.pause();
	selfStream.src = "";
	remoteView.src = "";

	//stops remote track
	if (remoteView.srcObject) {
		if (remoteView.srcObject.getTracks()) {
			if (remoteView.srcObject.getTracks()[0]) remoteView.srcObject.getTracks()[0].stop();
			if (remoteView.srcObject.getTracks()[1]) remoteView.srcObject.getTracks()[1].stop();
		}
	}

	//stops the camera from being active
	if (window.self_stream) {
		if (window.self_stream.getVideoTracks()) {
			if (window.self_stream.getVideoTracks()[0]) window.self_stream.getVideoTracks()[0].stop();
		}
	}
	navigator.mediaDevices.getUserMedia({
		audio: false,
		video: false
	});

	//toggle_incall_buttons(false);
}

//mutes self audio so remote cannot hear you
function mute_audio() {
	if (currentSession) {
		currentSession.mute({
			audio: true,
			video: false
		});
		mute_audio_button.setAttribute("onclick", "javascript: unmute_audio();");
		mute_audio_icon.classList.add("fa-microphone-slash");
		mute_audio_icon.classList.remove("fa-microphone");
	}
}

//unmutes self audio so remote can hear you
function unmute_audio() {
	if (currentSession) {
		currentSession.unmute({
			audio: true,
			video: false
		});
		mute_audio_button.setAttribute("onclick", "javascript: mute_audio();");
		mute_audio_icon.classList.add("fa-microphone");
		mute_audio_icon.classList.remove("fa-microphone-slash");
	}
}


//hides self video so remote cannot see you
function hide_video() {

	if (currentSession) {
		currentSession.mute({
			audio: false,
			video: true
		});
		hide_video_button.setAttribute("onclick", "javascript: unhide_video();");
		selfStream.setAttribute("hidden", true);
		hide_video_icon.style.display = "block";
	}
}

//unhides self video so remote can see you
function unhide_video() {
	if (currentSession) {
		currentSession.unmute({
			audio: false,
			video: true
		});
		hide_video_button.setAttribute("onclick", "javascript: hide_video();");
		selfStream.removeAttribute("hidden");
		hide_video_icon.style.display = "none";
	}
}


//*** TODO times out and ends call after 30 or so seconds. agent gets event "ended" with cause "RTP Timeout". 
// puts session on hold
function hold() {
	if (currentSession) {
		var options = {
			'useUpdate': true
		};
		currentSession.hold(options);
		hold_button.setAttribute("onclick", "javascript: unhold();");
		hold_button.innerHTML = "Unhold";
	}
}

//resumes session
function unhold() {
	if (currentSession) {
		currentSession.unhold();
		hold_button.setAttribute("onclick", "javascript: hold();");
		hold_button.innerHTML = "Hold";
	}
}

//TODO: this function may or may not solve our H264 codec issue. Calls to this function are currently commented out as it seems to not be helping.
//Edits the request to remove H264 modes other than 97, and adds H264 mode 97
//@ param request is the request message to edit
//@ return request_lines.join(' ') the edited request
function edit_request(request) {
	console.log("EDITING REQUEST");
	var video_section = false; //if we've reached the "m=video" section. Don't want to add H264 to the audio section
	var added_new_codec = false; //if we've added the new codec. If we reach the end and havent added it, we append it to the end of the file (possibly in the wrong order)

	if (request !== undefined) {
		var request_lines = request.split('\n');
		for (var i = 0; i < request_lines.length; i++) {
			if (request_lines[i].includes("m=video")) {
				request_lines[i] = request_lines[i].replace(" 126", ""); //getting rid of other h264
				request_lines[i] = request_lines[i].replace(" 99", ""); //getting rid of other h264
				request_lines[i] = request_lines[i].replace(" 97", ""); //getting rid of 97 so we don't have it twice
				request_lines[i] = request_lines[i] + " 97"; //adding h264 97
				video_section = true;
			}

			//getting rid of h264 
			if (request_lines[i].includes("H264/90000")) {
				request_lines.splice(i, 1);
				i--; //preventing wrong index because line was deleted
			}
			if ((request_lines[i].includes("a=rtcp-fb:99")) || (request_lines[i].includes("a=rtcp-fb:126")) || (request_lines[i].includes("a=rtcp-fb:97"))) {
				request_lines.splice(i, 1);
				i--;
			}
			if ((request_lines[i].includes("a=fmtp:99")) || (request_lines[i].includes("a=fmtp:126")) || (request_lines[i].includes("a=fmtp:97"))) {
				request_lines.splice(i, 1);
				i--;
			}

			//adding h264 97
			if (video_section) {
				//we want to add the lines in the correct order. "a=fmtp" lines should be added where all the other "a=fmtp" lines are
				if (request_lines[i].includes("a=fmtp")) {
					//we want to add the new line at the end of all the "a=fmtp" lines 
					if (request_lines[i + 1].includes("a=fmtp") == false) {
						request_lines[i] = request_lines[i] + "\na=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1";
						added_new_codec = true;
					}
				}
				if (request_lines[i].includes("a=rtcp")) {
					if (request_lines[i + 1].includes("a=rtcp") == false) {
						request_lines[i] = request_lines[i] + "\na=rtcp-fb:97 nack\na=rtcp-fb:97 nack pli\na=rtcp-fb:97 ccm fir\na=rtcp-fb:97 goog-remb";
						added_new_codec = true;
					}
				}
				if (request_lines[i].includes("a=rtpmap")) {
					if (request_lines[i + 1].includes("a=rtpmap") == false) {
						request_lines[i] = request_lines[i] + "\na=rtpmap:97 H264/90000";
						added_new_codec = true;
					}
				}
			}
		}
		var new_request = request_lines.join('\n');
		if (!added_new_codec) {
			new_request = new_request + "a=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1\na=rtcp-fb:97 nack\na=rtcp-fb:97 nack pli\na=rtcp-fb:97 ccm fir\na=rtcp-fb:97 goog-remb\na=rtpmap:97 H264/90000";
		}
	} else {
		var new_request = request;
	}

	return new_request;
}


//Record video code:
var videoElement = document.querySelector('#remoteView');

var recorder;
// this function submits recorded blob to nodejs server
function postFiles() {
	console.log('Post the file');
	var blob = recorder.getBlob();
	if (blob.size > 0) {
		console.log("Call Data: " + JSON.stringify(calldata));
		var fileName = generateRandomString() + '.webm';
		var file = new File([blob], fileName, {
			type: 'video/webm'
		});

		xhr('/uploadFile', file, function (responseText) {
			console.info('FileUploaded: ' + responseText);
		});
	} else {
		console.log("no data in video record");
	}

}
// XHR2/FormData
function xhr(url, data, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		if (request.readyState == 4 && request.status == 200) {
			callback(request.responseText);
		}
	};

	request.open('POST', url);
	console.log("URL is: " + url);
	var formData = new FormData();
	formData.append('file', data);
	request.send(formData);
}
// generating random string
function generateRandomString() {
	if (window.crypto) {
		var a = window.crypto.getRandomValues(new Uint32Array(3)),
			token = '';
		for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
		return token;
	} else {
		return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
	}
}

function record_call() {
	recorder = RecordRTC(remoteStream.srcObject, {
		type: 'video'
	});
	recorder.startRecording();
};

function upload_call() {
	recorder.stopRecording(postFiles);
};