var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2);
};
sessionID = ID();
console.log(sessionID);

//cnt = 0;
query_keyword = "";
query_type="Document";
//dms_url = iframe_dms.src;
function chat(event) {
	//ttsStop();
	//if (cnt==0) ttsList();
	const Http = new XMLHttpRequest();
	//const url='https://api.dialogflow.com/v1/query?v=20170712&query='+document.getElementById('chat2_text1').value+'&lang=zh-tw&sessionId='+sessionID+'&timezone=Asia/Taipei';
	//const url='https://localhost/exp/chatbot/tommyDmsBotVoice_proxy.php?v=20170712&query='+document.getElementById('chat2_text1').value+'&lang=zh-tw&sessionId='+sessionID+'&timezone=Asia/Taipei';
	const url='https://twtp1nb0964.delta.corp/exp/chatbot/tommyDmsBotVoice_proxy.php?v=20170712&query='+document.getElementById('chat2_text1').value+'&lang=zh-tw&sessionId='+sessionID+'&timezone=Asia/Taipei';
	//const url='https://webspeech.deltaww.com/exp/chatbot/tommyDmsBotVoice_proxy.php?v=20170712&query='+document.getElementById('chat2_text1').value+'&lang=zh-tw&sessionId='+sessionID+'&timezone=Asia/Taipei';
	clientAccessToken = diagflow_token.value;
	Http.open("GET", url);
	Http.setRequestHeader("Authorization", "Bearer " + clientAccessToken);
	Http.send();
	chatResponse = "";
	Http.onreadystatechange=(e)=>{
		//cnt++;
		//console.log(e);
		response = Http.responseText;
		if (response.indexOf("speech")==-1 || chatResponse!="")
			return;
		
		//console.log("resJs="+response);
		eval("resJs="+response);
		chatResponse = resJs.result.fulfillment.speech;
		//console.log("chatResponse(" + cnt + "): "+chatResponse+".");
		console.log("chatResponse: "+chatResponse+".");
		//document.getElementById('text2').value = resJs.result.fulfillment.speech;
		document.getElementById('chat2_text2').value = resJs.result.fulfillment.speech;
		
		//ttsChineseEnglish2(document.getElementById('chat2_text2').value);
		ttsChineseEnglish2(document.getElementById('chat2_text2').value.replace("TOMMY.SHEU","湯米許"));
		//speakChineseEnglish2(document.getElementById('text2').value);
		//txtTTS = document.getElementById('text2').value;
		//if (isAlphabet(txtTTS.charAt(0)))
		//	ttsEnglish(document.getElementById('text2').value);
		//else
		//	ttsChinese(document.getElementById('text2').value);
		
		console.log("intent: " + resJs.result.metadata.intentName);
		for (i in resJs.result.parameters) {
			console.log("slot:   " + i + " " + resJs.result.parameters[i]);
			if (i=="product" || i=="issue")
				query_keyword = resJs.result.parameters[i];
			if (i=="info" || i=="solution") {
				query_type = "Document";
				if (resJs.result.parameters[i]=="社群")
					query_type = "Community";
				if (resJs.result.parameters[i]=="專家")
					query_type = "People";
			}
			if (i=="name") {
				query_keyword = resJs.result.parameters[i];
				query_type = "People";
			}
			if (i=="domain") {
				//console.log("=== parameters: " + parameter.value);
				eval("tmp="+parameter.value);
				//console.log("=== original domain: " + tmp.domain);
				
				console.log("=== Switch to " + resJs.result.parameters[i] + " domain");
				
				parameter.value = parameter.value.replace(tmp.domain,resJs.result.parameters[i]);
				console.log("=== parameters: " + parameter.value);
				//eval("tmp="+parameter.value);
				//console.log("=== new domain: " + tmp.domain);
			}
			if (i=="text-adapt-domain") {
				eval("tmp="+parameter.value);
				
				console.log("=== Switch to " + resJs.result.parameters[i] + " text-adapt-domain");
				
				parameter.value = parameter.value.replace(tmp["text-adapt-domain"],resJs.result.parameters[i]);
				console.log("=== parameters: " + parameter.value);
			}
			if (i=="nbest") {
				eval("tmp="+parameter.value);
				
				console.log("=== nbest is " + resJs.result.parameters[i]);
				
				parameter.value = parameter.value.replace('"nbest":'+tmp["nbest"],'"nbest":'+resJs.result.parameters[i]);
				console.log("=== parameters: " + parameter.value);
			}
			if (i=="words") {
				words.value = resJs.result.parameters[i];
				console.log("=== words: " + words.value);
			}
			//jarvisVoiceSearch3();
		}
	}
}

function jarvisVoiceSearch2() {
	console.log("=== " + query_type + ": " + query_keyword + " ===");
	window.open('https://dms.deltaww.com/dmsjarvisweb/zh-tw/SmartSearch?isTypeListExpand=1&typeId='+query_type+'&keywords=' + query_keyword);
	return;
}

function jarvisVoiceSearch3() {
	dms_url_new = encodeURI('https://dms.deltaww.com/dmsjarvisweb/zh-tw/SmartSearch?isTypeListExpand=1&typeId='+query_type+'&keywords=' + query_keyword);
	console.log("old - " + dms_url);
	console.log("new - " + dms_url_new);

	if (dms_url_new!=dms_url) {
		console.log("=== " + query_type + ": " + query_keyword + " ===");
		//iframe_dms.src = 'https://dms.deltaww.com/dmsjarvisweb/zh-tw/SmartSearch?isTypeListExpand=1&typeId='+query_type+'&keywords=' + query_keyword;
		iframe_dms.src = dms_url_new;
		dms_url = iframe_dms.src;
	}
	return;
}

// Get the input field
var input = document.getElementById("chat2_text1");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    document.getElementById("Chat").click();
  }
});