// Global UI elements:
//  - log: event log
//  - trans: transcription window

// Global objects:
//  - tt: simple structure for managing the list of hypotheses
//  - dictate: dictate object with control methods 'init', 'startListening', ...
//       and event callbacks onResults, onError, ...
var tt = new Transcription();
var soundmeterEnable;
var triggered = false;

//var asrTrans = document.getElementById("trans"); 
//var szAsrTrans;
var asrTopN = document.getElementById("asrTopN"); 

var objDictateConfig =
    {
        recorderWorkerPath: '../lib/recorderWorker.js',
        onReadyForSpeech: function () {
            __message("READY FOR SPEECH");
            __status("Ready for transcribing...");
        },
        onEndOfSpeech: function () {
            __message("END OF SPEECH");
            __status("Transcribing...");
        },
        onEndOfSession: function () {
            __message("END OF SESSION");
            __status("END OF SESSION");
        },
        onServerStatus: function (json) {
            __serverStatus("workers available :" + json.num_workers_available + ", requests processed:" + json.num_requests_processed);
            if (json.num_workers_available == 0) {
                //$("#buttonStart").prop("disabled", true);
                $("#serverStatusBar").addClass("highlight");
            } else {
                //$("#buttonStart").prop("disabled", false);
                $("#serverStatusBar").removeClass("highlight");
            }
        },
        onPartialResults: function (hypos) {
            // TODO: demo the case where there are more hypos
            //console.log("onPartialResults: " + hypos[0].transcript);
           
	    //Trigger Word Detection
	    var triggerOption = window.document.getElementById('trigger-option');
	    if (triggerOption !== void 0 && triggerOption.checked) 
	    	triggerEnable = true;
	    else 
	    	triggerEnable = false;
	    	
            if (!triggerEnable) {
            	tt.add(hypos[0].transcript, false);
            	__updateTranscript(tt.toString());
            }
            else if (triggerEnable && triggered) {
            	tt.add(hypos[0].transcript, false);
            	__updateTranscript(tt.toString());
            }
            
        },
        onResults: function (hypos) {
            // TODO: demo the case where there are more results     
            if (hypos[0].transcript=="") {
            	console.log("onResults: empty");
            	return;
	    }            
                   
            for (i=0;i<hypos.length;i++) {
            	if (hypos[i]["original-transcript"])
            		console.log("onResults(" + (i+1) +"): " + hypos[i].transcript + " (" + hypos[i]["original-transcript"] + ")");
            	else if (hypos[i]["orig-transcript"])
            		console.log("onResults(" + (i+1) +"): " + hypos[i].transcript + " (" + hypos[i]["orig-transcript"] + ")");
		else
			console.log("onResults(" + (i+1) +"): " + hypos[i].transcript); 
            }
            
            //client 2nd pass
	    var c2pOption = window.document.getElementById('c2p-option');
            if (c2pOption !== void 0 && c2pOption.checked) 
            	c2pEnable = true;  
            else
            	c2pEnable = false;         
            	 
            if (c2pEnable) {
                szAsrTopN = "";
                for (i=0;i<hypos.length;i++) {
                	//get original-transcript first
            		if (hypos[i]["original-transcript"]) {
            			if (szAsrTopN!="") szAsrTopN += ", ";
            			szAsrTopN += hypos[i]["original-transcript"];
            		}
            		else if (hypos[i]["orig-transcript"]) {
            			if (szAsrTopN!="") szAsrTopN += ", ";
            			szAsrTopN += hypos[i]["orig-transcript"];
            		}
            		//get transcript if original-transcript not available
            		else if (hypos[i].transcript!="") {
            			if (szAsrTopN!="") szAsrTopN += ", ";
            			szAsrTopN += hypos[i].transcript;
            		}
            	}
            	console.log(szAsrTopN);
            	textBox.value = szAsrTopN;
            	secondPassButton(event);
            	console.log("<== " + textBox.value);
            	console.log("==> " + adaptBox.value);
            	aryAdaptBox = adaptBox.value.split(",");
                for (i=0;i<hypos.length;i++) {
            		if (i<aryAdaptBox.length)
            			hypos[i].transcript=aryAdaptBox[i].trim();
            		else
            			hypos[i].transcript="";
            	}
            }

            //TopN
            asrTopN.innerHTML = "";
            for (i=0;i<hypos.length;i++) {
            	//asrTopN.innerHTML += '<option value="top' +(i+1) + '">' + hypos[i].transcript + '</option>\n';
            	if (hypos[i].transcript!="") {
            		asrTopN.innerHTML += '<option value="' + hypos[i].transcript + '">' + hypos[i].transcript + '</option>\n';
            	}
            }
            
            //Text-to-Speech
            var ttsOption = window.document.getElementById('tts-option');
            if (ttsOption !== void 0 && ttsOption.checked) 
            	ttsEnable = true;
            else 
            	ttsEnable = false;
            	
            //Browser built-in Web Speech TTS API
            if (ttsSupport && ttsEnable) {
	        //ttsChineseEnglish(hypos[0].transcript);
	        if (parameter.value.trim().search("kaldifae")==-1)
	        	ttsChineseEnglish(hypos[0].transcript);
	        else
	        	ttsChineseEnglish(hypos[0].transcript.replace(/ /g,""));
	    }	        	
	
	    //Trigger Word Detection
	    var triggerOption = window.document.getElementById('trigger-option');
	    if (triggerOption !== void 0 && triggerOption.checked) 
	    	triggerEnable = true;
	    else 
	    	triggerEnable = false;
	    	
            if (!triggerEnable) {
	            tt.add(hypos[0].transcript, true);
	            __updateTranscript(tt.toString());
            }
            else if (triggerEnable && triggered) {
	            tt.add(hypos[0].transcript, true);
	            __updateTranscript(tt.toString());
	    }
	    	
	    if (triggerEnable) {
	    	    text = hypos[0].transcript.toLowerCase();
		    if (document.getElementById('r4').checked && text.indexOf("alexa")!=-1) {
		    	trigger_logo.src="alexa_logo.png";
		    	triggered = true;
		    	if (!ttsEnable) {
        			audio.src = "beep.wav";
        			audio.play();
        		}
		    }
		    else if (document.getElementById('r5').checked && (text.indexOf("ok google")!=-1 || text.indexOf("hey google")!=-1 || text.indexOf("hi google")!=-1) ) {
		    	trigger_logo.src="google_logo.png";
		    	triggered = true;
		    	if (!ttsEnable) {
        			audio.src = "beep.wav";
        			audio.play();
        		}
		    }
		    else if (document.getElementById('r6').checked && (text.indexOf("hey siri")!=-1 || text.indexOf("hi siri")!=-1 || text.indexOf("ok siri")!=-1)) {
		    	trigger_logo.src="apple_logo.png";
		    	triggered = true;
		    	if (!ttsEnable) {
        			audio.src = "beep.wav";
        			audio.play();
        		}
		    }
		    else if (document.getElementById('r7').checked && (text.indexOf("hi delta")!=-1 || text.indexOf("hey delta")!=-1 || text.indexOf("ok delta")!=-1)) {
		    	trigger_logo.src="delta_logo.png";
		    	triggered = true;
		    	if (!ttsEnable) {
        			audio.src = "beep.wav";
        			audio.play();
        		}
		    }
 		    else {
 		    	if (!ttsEnable && triggered) {
        			audio.src = "beep_beep.wav";
        			audio.play();
        		}
		    	trigger_logo.src="";
		    	triggered = false;
		    }
	    }
            
            // diff() is defined only in diff.html
/*            if (typeof (diff) == "function") {
                var strRef = $(".original").val();
                if (strRef.length > 0) {
                    diff();
                }
            }
*/        },
        onError: function (code, data) {
            __error(code, data);
            __status("Error Code: " + code);
            dictate.cancel();
        },
        onEvent: function (code, data) {
            __message(code, data);
        }
    };

// cybelia.kao 2017.06.23: Backup domain name
if (location.hostname === "speech-deltaww-com-backup.vetivert.org") {
    var textboxServerURL = document.getElementById("serverURL")
    textboxServerURL.value = "wss://speech-deltaww-com-backup.vetivert.org:443";
    textboxServerURL.dispatchEvent(new Event('change', {target: textboxServerURL}));
    objDictateConfig.serverStatus = "wss://speech-deltaww-com-backup.vetivert.org:443/client/ws/status";
    objDictateConfig.server = "wss://speech-deltaww-com-backup.vetivert.org:443/client/ws/speech";
}
//

var dictate = new Dictate(objDictateConfig);

// Private methods (called from the callbacks)
function __message(code, data) {
    log.innerHTML = "msg: " + code + ": " + (data || '') + "\n" + log.innerHTML;
}

function __error(code, data) {
    log.innerHTML = "ERR: " + code + ": " + (data || '') + "\n" + log.innerHTML;
}

function __status(msg) {
    statusBar.innerHTML = msg;
}

function __serverStatus(msg) {
    serverStatusBar.innerHTML = msg;
}

function __updateTranscript(text) {
    $("#trans").val(text);
}

// Public methods (called from the GUI)
function toggleLog() {
    $(log).toggle();
}
function clearLog() {
    log.innerHTML = "";
}

function check_to_display_clear_button() {
    var strHyp = $(".changed").val();
    $("#buttonClear").prop("disabled", (0 === strHyp.length));
}

$("#reference").on('change keydown paste input', function () {
    var strRef = $(".original").val();
    $("#buttonDiff").prop("disabled", (0 === strRef.length));
});

$("#trans").on('change keydown paste input', function () {
    check_to_display_clear_button();
});

function clearTranscription() {
    tt = new Transcription();
    $("#trans").val("");
    $(".diff").text('');
    $(".accuracy").text('');
    $("#buttonClear").prop("disabled", true);
}

function syncServerStatus() {
    dictate.monitorServerStatusSync();
}


function startListening() {

    //keep previous ASR result
    //console.log("update ASR result: " + asrTrans.value);
    //szAsrTrans = asrTrans.value;

    //pre-play for android/iOS user gesture 1,000ms issue
    //Text-to-Speech
    var ttsOption = window.document.getElementById('tts-option');
    if (ttsOption !== void 0 && ttsOption.checked) 
    	ttsEnable = true;
    else 
    	ttsEnable = false;
    //Browser built-in Web Speech TTS API
    if (ttsSupport && ttsEnable) {
        //ttsChineseEnglish("  ");
        //audio.src = "https://speech-deltaww-com-backup.vetivert.org/exp/tts/delta/null.mp3";
        audio.src = "https://webspeech.deltaww.com/exp/tts/delta/null.mp3";
        //audio.src = "/exp/tts/delta/null.mp3";
        audio.play();
        console.log("pre-play " + audio.src);
    }	        	

    //Sound Meter
    var soundmeterOption = window.document.getElementById('soundmeter-option');
    if (soundmeterOption !== void 0 && soundmeterOption.checked) {
    	soundmeterEnable = true;
    	//document.getElementById("meters").style.visibility="visible";
    }
    else {
    	soundmeterEnable = false;
    	//document.getElementById("meters").style.visibility="hidden";
    }

    var str1 = parameter.value.trim();
    var str2 = words.value.trim().split(',').join('","');
    var str3 = '"user-define":{"user-id":"' + user_id.value.trim() + '","app-id":"' + app_id.value.trim() + '","microphone":"' + microphone.value.trim() + '"}';
    var strJson = str1.substr(0,str1.length-1) + ',"words":["' + str2 + '"],' + str3 + '}';
    //console.log(strJson);
    //var strJson = parameter.value.trim();
    if ( strJson.length>0 && !IsJsonString(strJson) ) {
        alert('Parameters string is not vaid: ' + strJson);
        document.getElementById("parameter").focus();
    }
    else if ( strJson.length>1000) {
        alert('Parameters string is too long: ' + strJson);
        document.getElementById("parameter").focus();
    }
    else if ( user_id.value.trim().length==0) {
        alert('Please input your User-id. For example: Alan.Lee');
        document.getElementById("user_id").focus();
    }
    else if ( app_id.value.trim().length==0) {
        alert('Please input your App-id.  For example: Smart Search');
        document.getElementById("app_id").focus();
    }
    else {
        dictate.init();
        $("#buttonStart").prop("disabled", true);
        $("#buttonStop").prop("disabled", false);
    }
}

function startListeningAfterInit() {
    dictate.startListening();
}

function stopListening() {
    dictate.stopListening();
    $("#buttonStart").prop("disabled", false);
    $("#buttonStop").prop("disabled", true);
    var strRef = $(".original").val();
    $("#buttonDiff").prop("disabled", (0 === strRef.length));
    if (strRef.length > 0) {
        diff();
    }
    check_to_display_clear_button();
}

function exportingWav() {
    dictate.exportingWav();
}

function cancel() {
    dictate.cancel();
    $("#buttonStart").prop("disabled", false);
    $("#buttonStop").prop("disabled", true);
}

function init() {
    dictate.init();
}

function resume() {
    dictate.resume();
}

function text_normalize(strIn) {
    var strOut = strIn.replace(/(?=[^A-Za-z0-9_\.,;-]) ([^A-Za-z0-9_\.,;-])/g, "$1");
    return strOut;
}

function diff() {
    // Save the textarea val to its text, otherwise the manual updates
    // are not visible to prettyTextDiff.
    var strRef0 = $(".original").val();
    var strHyp0 = $(".changed").val();

    console.log('strRef0: ' + strRef0);
    console.log('strHyp0: ' + strHyp0);

    var strRef = text_normalize(strRef0);
    var strHyp = text_normalize(strHyp0);

    $(".original").text(strRef);
    $(".changed").text(strHyp);

    $("#comparison").prettyTextDiff({
        cleanup: true
    });

    if( strRef.length > 0 ){
        var fAcc = LVCSR_Accuracy(strRef, strHyp);
        $(".accuracy").text('Accuacy: ' + FloatOutput(fAcc, 2) + '%');
    }else{
        $(".accuracy").text('');
    }
}

$('.collapsible-container').click( function(){
    var strText = $('.collapsible-container').text();
    if(strText=='+'){
        $('.collapsible-target').toggle();
        $('.collapsible-container').text('-');
    }else{
        $('.collapsible-target').toggle();
        $('.collapsible-container').text('+');
    }
});

function showConfig() {
    var pp = JSON.stringify(dictate.getConfig(), undefined, 2);
    log.innerHTML = pp + "\n" + log.innerHTML;
    $(log).show();
}

$("#serverURL").on('change', function(){
    dictate.setServer(serverURL.value + '/client/ws/speech')
    dictate.setServerStatus(serverURL.value + '/client/ws/status')
});

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function cfgGrammar() {
  var grammarBox = document.getElementById("grammarBox"); 
  szGrammarBox = grammarBox.value;
  szVocBox = compileGrammar(szGrammarBox);
  console.log("Voc:\n"+szVocBox);
  //alert(szVocBox);
  words.value=szVocBox.split(" ").join(",");
}

function selectAsrTopN() {
	//alert(asrTopN.value);
	//asrTrans.value = szAsrTrans + asrTopN.value;
    	tt.update(asrTopN.value);
    	__updateTranscript(tt.toString());
}

function jarvisVoiceSearch() {
	window.open('https://dms.deltaww.com/dmsjarvisweb/zh-tw/SmartSearch?isTypeListExpand=1&typeId=Document&keywords=' + asrTopN.value);
}

window.onload = function() {
    //init();
};
