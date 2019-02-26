(function(window){

	// Defaults
	//var SERVER = "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/speech";
	//var SERVER_STATUS = "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/status";
	//var REFERENCE_HANDLER = "http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference";
	//var CONTENT_TYPE = "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1";
	var SERVER = "wss://speech.deltaww.com/client/ws/speech";
	var SERVER_STATUS = "wss://speech.deltaww.com/client/ws/status";
	var REFERENCE_HANDLER = "http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference";
	var CONTENT_TYPE = "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1";
	// Send blocks 4 x per second as recommended in the server doc.
	//var INTERVAL = 512;
	//var INTERVAL = 256;
	var INTERVAL = 250;
    	console.log("modified INTERVAL=" + INTERVAL);
	var TAG_END_OF_SENTENCE = "EOS";
	var RECORDER_WORKER_PATH = 'recorderWorker.js';

	// Error codes (mostly following Android error names and codes)
	var ERR_NETWORK = 2;
	var ERR_AUDIO = 3;
	var ERR_SERVER = 4;
	var ERR_CLIENT = 5;

	// Event codes
	var MSG_WAITING_MICROPHONE = 1;
	var MSG_MEDIA_STREAM_CREATED = 2;
	var MSG_INIT_RECORDER = 3;
	var MSG_RECORDING = 4;
	var MSG_SEND = 5;
	var MSG_SEND_EMPTY = 6;
	var MSG_SEND_EOS = 7;
	var MSG_WEB_SOCKET = 8;
	var MSG_WEB_SOCKET_OPEN = 9;
	var MSG_WEB_SOCKET_CLOSE = 10;
	var MSG_STOP = 11;
	var MSG_SERVER_CHANGED = 12;
	var MSG_MEDIA_STREAM_RESUMED = 13;
	var MSG_EXPORT_WAV = 14;

	// Server status codes
	// from https://github.com/alumae/kaldi-gstreamer-server
	var SERVER_STATUS_CODE = {
		0: 'Success', // Usually used when recognition results are sent
		1: 'No speech', // Incoming audio contained a large portion of silence or non-speech
		2: 'Aborted', // Recognition was aborted for some reason
		9: 'No available', // recognizer processes are currently in use and recognition cannot be performed
	};

	// Initialized by init()
	var audioContext;
	var recorder;
	var processor;	
	// Initialized by startListening()
	var ws;
	var intervalKey;
	// Initialized during construction
	var wsServerStatus;

	// ------Display a sound microphone volume visualization bar -------
	var instantMeter = document.querySelector('#instant meter');
	var instantValueDisplay = document.querySelector('#instant .value');
	var soundMeter;
	var intervalKeySoundMeter;
	// ---------------------------------------------

	var Dictate = function(cfg) {
		var config = cfg || {};
		config.server = config.server || SERVER;
		config.serverStatus = config.serverStatus || SERVER_STATUS;
		config.referenceHandler = config.referenceHandler || REFERENCE_HANDLER;
		config.contentType = config.contentType || CONTENT_TYPE;
		config.interval = config.interval || INTERVAL;
		config.recorderWorkerPath = config.recorderWorkerPath || RECORDER_WORKER_PATH;
		config.onReadyForSpeech = config.onReadyForSpeech || function() {};
		config.onEndOfSpeech = config.onEndOfSpeech || function() {};
		config.onPartialResults = config.onPartialResults || function(data) {};
		config.onResults = config.onResults || function(data) {};
		config.onEndOfSession = config.onEndOfSession || function() {};
		config.onEvent = config.onEvent || function(e, data) {};
		config.onError = config.onError || function(e, data) {};
		config.onServerStatus = config.onServerStatus || {};
		config.rafCallback = config.rafCallback || function(time) {};
		if (config.onServerStatus) {
			monitorServerStatus();
		}

		// Returns the configuration
		this.getConfig = function() {
			return config;
		}

		// Set up the recorder (incl. asking permission)
		// Initializes audioContext
		// Can be called multiple times.
		// TODO: call something on success (MSG_INIT_RECORDER is currently called)
		this.init = function() {
			config.onEvent(MSG_WAITING_MICROPHONE, "Waiting for approval to access your microphone ...");
			try {
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
				window.URL = window.URL || window.webkitURL;
				audioContext = new AudioContext();

			        processor = audioContext.createScriptProcessor(8192, 1, 1);
			        processor.connect(audioContext.destination);
			} catch (e) {
				// Firefox 24: TypeError: AudioContext is not a constructor
				// Set media.webaudio.enabled = true (in about:config) to fix this.
				config.onError(ERR_CLIENT, "Error initializing Web Audio browser: " + e);
			}

			if (navigator.getUserMedia) {
				navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
					config.onError(ERR_CLIENT, "No live audio input in this browser: " + e);
				});
			} else if (navigator.mediaDevices.getUserMedia) {
				navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(startUserMedia).catch(function(e) {
					config.onError(ERR_CLIENT, "No live audio input in this browser: " + e);
				});
			} else {
				config.onError(ERR_CLIENT, "No user media support");
			}			
		}

		// Start recording and transcribing
		this.startListening = function() {
			if (! recorder) {
				config.onError(ERR_AUDIO, "Recorder undefined");
				return;
			}
			audioContext.resume();

			//str1 = parameter.value.trim();
			//str2 = words.value.trim();
			//strJson = str1.substr(0,str1.length-1) + ',"words":' + str2 + '}';
		    	//str2 = words.value.trim().split(',').join('","');
    			//strJson = str1.substr(0,str1.length-1) + ',"words":["' + str2 + '"]}';
			
			str1 = parameter.value.trim();
			str2 = words.value.trim().split(',').join('","');
    			str3 = '"user-define":{"user-id":"' + user_id.value.trim() + '","app-id":"' + app_id.value.trim() + '","microphone":"' + microphone.value.trim() + '"}';
			strJson = str1.substr(0,str1.length-1) + ',"words":["' + str2 + '"],' + str3 + '}';
			console.log(strJson);

            		parameters = encodeURI(strJson);
            		//parameters = encodeURI(parameter.value.trim())
            		console.log('parameters =' + parameters);

			if (ws) {
				//cancel();
				ws.close();
				ws = null;				
			}

			try {
				ws = createWebSocket(parameters);
			} catch (e) {
				config.onError(ERR_CLIENT, "No web socket support in this browser!");
			}

		}

		// Resume recording and transcribing
		this.resume = function() {
			audioContext.resume();
			config.onEvent(MSG_MEDIA_STREAM_RESUMED, 'Resume audio context');
		}
		
		// Stop listening, i.e. recording and sending of new input.
		this.stopListening = function() {
			// Stop the regular sending of audio
			clearInterval(intervalKey);
			clearInterval(intervalKeySoundMeter);
			// Stop recording
			if (recorder) {
				recorder.stop();
				// stop the recording stream
				// add by tommy 2017/11/13
				localStream.getAudioTracks()[0].stop();
				config.onEvent(MSG_STOP, 'Stopped recording');

				// Push the remaining audio to the server				
				//recorder.export16kMono(function(blob) {
				//console.log("export16kMono(), Push the remaining audio to the server");
				recorder.export16kMono(function(blob,resampler) {
					socketSend(blob);
					socketSend(TAG_END_OF_SENTENCE);
					//recorder.clear();
				}, 'audio/x-raw');
				
/*				// Export the recorded audio
				// add by tommy 2017/10/23, revise 2017/11/30, mark 2018/1/16
				if (this.enableExportWav) {
					setTimeout(function() {
						this.exportingWav();
					}, 1000);
				}
*/
				config.onEndOfSpeech();
			} else {
				config.onError(ERR_AUDIO, "Recorder undefined");
			}
		}

		// Export the recorded audio
		// add by tommy 2017/10/23, revise 2017/11/30
		this.enableExportWav = false;
		this.exportingWav = function() {
			config.onEvent(MSG_EXPORT_WAV, 'Export wav');
			recorder.exportWAV(function(blob) {
			      var url = URL.createObjectURL(blob);
			      var li = document.createElement('li');
			      var au = document.createElement('audio');
			      var hf = document.createElement('a');
			      
			      au.controls = true;
			      au.src = url;
			      hf.href = url;
			      hf.download = new Date().toISOString() + '.wav';
			      hf.innerHTML = hf.download;
			      li.appendChild(au);
			      li.appendChild(hf);
			      recordingslist.appendChild(li);
			    });		
			recorder.clear2();
				
		}

		// Cancel everything without waiting on the server
		this.cancel = function() {
			// Stop the regular sending of audio (if present)
			clearInterval(intervalKey);
			clearInterval(intervalKeySoundMeter);
			if (recorder) {
				recorder.stop();
				recorder.clear();
				
				// stop the recording stream
				// add by tommy 2018/1/16
				localStream.getAudioTracks()[0].stop();
				
				config.onEvent(MSG_STOP, 'Stopped recording inside cancel()');		
				// add by tommy 2017/10/20, mark 2018/1/16
				//recorder.clear2();
				config.onEvent(MSG_STOP, 'Stopped recording');
			}
			if (ws) {
				ws.close();
				ws = null;
			}
		}

		// Sets the URL of the speech server
		this.setServer = function(server) {
			config.server = server;
			config.onEvent(MSG_SERVER_CHANGED, 'Server changed: ' + server);
		}

		// Sets the URL of the speech server status server
		this.setServerStatus = function(serverStatus) {
			config.serverStatus = serverStatus;

			if (config.onServerStatus) {
				monitorServerStatus();
			}
            console.log('setServerStatus(' + serverStatus + ')')
			config.onEvent(MSG_SERVER_CHANGED, 'Server status server changed: ' + serverStatus);
		}

    // Sends reference text to speech server
    this.submitReference = function submitReference(text, successCallback, errorCallback) {
      var headers = {}
      if (config["user_id"]) {
        headers["User-Id"] = config["user_id"]
      }      
      if (config["content_id"]) {
        headers["Content-Id"] = config["content_id"]
      }      
      $.ajax({
        url: config.referenceHandler,
        type: "POST",
        headers: headers,
        data: text,
        dataType: "text",
        success: successCallback,
        error: errorCallback,
      });  
    }

		this.monitorServerStatusSync = function monitorServerStatusSync() {
			if (wsServerStatus) {
				wsServerStatus.close();
			}

			console.log('monitorServerStatus on ' + config.serverStatus);

			wsServerStatus = new WebSocket(config.serverStatus);
			wsServerStatus.onmessage = function(evt) {
				config.onServerStatus(JSON.parse(evt.data));
			};
		}


		// Private methods
		function startUserMedia(stream) {
			window.localStream = stream;
			var input = audioContext.createMediaStreamSource(stream);
			config.onEvent(MSG_MEDIA_STREAM_CREATED, 'Media stream created');

			// make the analyser available in window context
			window.userSpeechAnalyser = audioContext.createAnalyser();
			input.connect(window.userSpeechAnalyser);

			config.rafCallback();

			recorder = new Recorder(input, processor, { workerPath : config.recorderWorkerPath });
			config.onEvent(MSG_INIT_RECORDER, 'Recorder initialized');	

			// ------Display a sound microphone volume visualization bar -------
			if (soundmeterEnable) {
				soundMeter = window.soundMeter = new SoundMeter(audioContext);
				soundMeter.connectToSource(stream, function(e) {
					if (e) {
					  alert(e);
					  return;
					}
					intervalKeySoundMeter = setInterval(function() {
					  instantMeter.value = instantValueDisplay.innerText =
						  soundMeter.instant.toFixed(2);
						  //soundMeter.instant.toFixed(0);
					}, 200);
				});
			}
			// ---------------------------------------------

			// Start recording
			// add by tommy 2017/11/13
			//this.startListening();
			startListeningAfterInit();
		}

		function socketSend(item) {
			if (ws) {
				var state = ws.readyState;
				if (state == 1) {
					// If item is an audio blob
					if (item instanceof Blob) {
						if (item.size > 0) {
							ws.send(item);
							config.onEvent(MSG_SEND, 'Send: blob: ' + item.type + ', ' + item.size);
							//console.log('setInterval - SocketSend - item.size:    ' + (item.size*3/2) + ' (' + item.size + ')');

						} else {
							config.onEvent(MSG_SEND_EMPTY, 'Send: blob: ' + item.type + ', EMPTY');
						}
					// Otherwise it's the EOS tag (string)
					} else {
						ws.send(item);
						config.onEvent(MSG_SEND_EOS, 'Send tag: ' + item);
					}
				} else {
					config.onError(ERR_NETWORK, 'WebSocket: readyState!=1: ' + state + ": failed to send: " + item);
				}
			} else {
				config.onError(ERR_CLIENT, 'No web socket connection: failed to send: ' + item);
			}
		}


		function createWebSocket(parameters) {
			// TODO: do we need to use a protocol?
			//var ws = new WebSocket("ws://127.0.0.1:8081", "echo-protocol");
            var url = config.server + '?' + config.contentType;
            if ( parameters.length > 0 ) {
                url += '&parameters=' + parameters;
            }
            if (config["user_id"]) {
                url += '&user-id=' + config["user_id"]
            }
            if (config["content_id"]) {
                url += '&content-id=' + config["content_id"]
            }
            console.log('createWebSocket(' + url +')')
			var ws = new WebSocket(url);

			ws.onmessage = function(e) {
				var data = e.data;
				//if (data.indexOf('"final":true')==-1) {
				//	config.onEvent(MSG_WEB_SOCKET, "not final=true, escape");
				//	return;
				//}
				config.onEvent(MSG_WEB_SOCKET, data);
				if (data instanceof Object && ! (data instanceof Blob)) {
					config.onError(ERR_SERVER, 'WebSocket: onEvent: got Object that is not a Blob');
				} else if (data instanceof Blob) {
					config.onError(ERR_SERVER, 'WebSocket: got Blob');
				} else {
					try {
						var res = JSON.parse(data);
					}
					catch (e) {
						console.log("json=>\n"+data);
						console.log("return json error: " + e);
						config.onError(ERR_SERVER, 'Server error: ' + e);
						return;
					}
					
					//var res = JSON.parse(data);
					if (res.status == 0) {
						if (res.result.final) {
							config.onResults(res.result.hypotheses);
						} else {
							config.onPartialResults(res.result.hypotheses);
						}
					} else {
						config.onError(ERR_SERVER, 'Server error: ' + res.status + ': ' + getDescription(res.status));
					}
				}
			}

			// Start recording only if the socket becomes open
			ws.onopen = function(e) {
			
				//console.log('fromSampleRate : ' + recorder.fromSampleRate + ', toSampleRate : ' + recorder.toSampleRate + ' , channels : ' + recorder.channels + ' , outputBufferSize : ' + recorder.outputBufferSize);
				recorder.infoLog(function(){
					
				});
				intervalKey = setInterval(function() {
					recorder.export16kMono(function(blob,resampler) {
						socketSend(blob);
						//console.log(recorder);
						//recorder.forceDownload(blob);
						//recorder.clear();
					}, 'audio/x-raw');
				}, config.interval);

				// Start recording
				recorder.record();
				config.onReadyForSpeech();
				config.onEvent(MSG_WEB_SOCKET_OPEN, e);
			};

			// This can happen if the blob was too big
			// E.g. "Frame size of 65580 bytes exceeds maximum accepted frame size"
			// Status codes
			// http://tools.ietf.org/html/rfc6455#section-7.4.1
			// 1005:
			// 1006:
			ws.onclose = function(e) {
				var code = e.code;
				var reason = e.reason;
				var wasClean = e.wasClean;
				// The server closes the connection (only?)
				// when its endpointer triggers.
				config.onEndOfSession();
				config.onEvent(MSG_WEB_SOCKET_CLOSE, e.code + "/" + e.reason + "/" + e.wasClean);

				// Export the recorded audio
				// add by tommy 2017/10/23, revise 2017/11/30, 2018/1/16
				if (dictate.enableExportWav) {
					dictate.exportingWav();
				}

				//release audio context object, by tommy 2017/11/21
				audioContext.close();
				audioContext = null;
				processor = null;	
				if (soundMeter !== void 0) soundMeter.stop();	
				config.onEvent(MSG_WEB_SOCKET_CLOSE, "Close audio context");
			};

			ws.onerror = function(e) {
				var data = e.data;
				config.onError(ERR_NETWORK, data);
			}

			return ws;
		}

		function monitorServerStatus() {
			if (wsServerStatus) {
				wsServerStatus.close();
			}

			console.log('monitorServerStatus on ' + config.serverStatus);

			wsServerStatus = new WebSocket(config.serverStatus);
			wsServerStatus.onmessage = function(evt) {
				config.onServerStatus(JSON.parse(evt.data));
			};
		}


		function getDescription(code) {
			if (code in SERVER_STATUS_CODE) {
				return SERVER_STATUS_CODE[code];
			}
			return "Unknown error";
		}
    


	};

	// Simple class for persisting the transcription.
	// If isFinal==true then a new line is started in the transcription list
	// (which only keeps the final transcriptions).
	var Transcription = function(cfg) {
		var index = 0;
		var list = [];

		this.add = function(text, isFinal) {
			list[index] = text;
			if (isFinal) {
				index++;
			}
		}

		this.update = function(text) {
			index--;
			list[index] = text;
			index++;
		}


		this.toString = function() {
            var objOption = window.document.getElementById('do-not-put-dot');
            var separatorUtterance = '. ';
            if (objOption !== void 0 && objOption.checked) {
                separatorUtterance = ' ';
            }
			return list.join(separatorUtterance);
		}
	}

	window.Dictate = Dictate;
	window.Transcription = Transcription;

})(window);