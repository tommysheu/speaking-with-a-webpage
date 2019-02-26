
var ttsSupport = true;
var ttsEnable = false;


var cnt=0;
var bEnd;
var nTtsCnt;
var intervalKey=null;
var audio = document.getElementById("audio1");
audio.addEventListener('ended', function(){cnt++; bEnd=true;}, false);

function playAudio(id, lang, text) {
	if (text==" ") {
		cnt++;
		bEnd = true;
		console.log("escape null audio");
		return;
	}
	text = text.toUpperCase();
	//audio.src = "https://10.120.82.42/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	//audio.src = "https://speech-deltaww-com-backup.vetivert.org/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	//audio.src = "https://webspeech.deltaww.com/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	audio.src = "https://webspeech.deltaww.com/exp/tts/delta2/tts.php?text=" + text + "&lang=" + lang;
	audio.play(); // 播放語音。
	console.log("play " + audio.src);
	//console.log("tts source: " + document.getElementById('r1').checked + ", " + document.getElementById('r2').checked );
}
function playAudio2(id, lang, text) {
	if (text==" ") {
		cnt++;
		bEnd = true;
		console.log("escape null audio");
		return;
	}
	text = text.toUpperCase();
	//audio.src = "https://10.120.82.42/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	//audio.src = "https://speech-deltaww-com-backup.vetivert.org/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	//audio.src = "https://webspeech.deltaww.com/exp/tts/deltammi/tts2v.php?name=" + text + "&language=" + lang;
	audio.src = "https://webspeech.deltaww.com/exp/tts/deltammi2/tts2v.php?name=" + text + "&language=" + lang;
	audio.play(); // 播放語音。
	console.log("play " + audio.src);
	//console.log("tts source: " + document.getElementById('r1').checked + ", " + document.getElementById('r2').checked );
}
function playAudio3(id, lang, text) {
	if (text==" ") {
		cnt++;
		bEnd = true;
		console.log("escape null audio");
		return;
	}
	text = text.toUpperCase();
	//audio.src = "https://10.120.82.42/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	//audio.src = "https://speech-deltaww-com-backup.vetivert.org/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	//audio.src = "https://webspeech.deltaww.com/exp/tts/delta/tts.php?text=" + text + "&lang=" + lang;
	audio.src = "https://webspeech.deltaww.com/exp/tts/delta3/tts.php?text=" + text + "&lang=" + lang;
	audio.play(); // 播放語音。
	console.log("play " + audio.src);
	//console.log("tts source: " + document.getElementById('r1').checked + ", " + document.getElementById('r2').checked );
}
function playAudioMix2(id, text) {
	aryText = text.split("|");
	cnt = 0;
	bEnd = true;
	nTtsCnt = aryText.length;
	if (intervalKey!=null) clearInterval(intervalKey);
	intervalKey = setInterval(function() {
		if (bEnd && cnt<nTtsCnt) {
			bEnd = false;
			console.log(cnt + ":" + aryText[cnt]);
			if (isAlphabetString(aryText[cnt]))
				playAudio('audio1','en',aryText[cnt]);
			else
				playAudio('audio1','zh',aryText[cnt]);				
		} else if (cnt==nTtsCnt) {
			console.log("TTS finished.");
			clearInterval(intervalKey);
		}
	}, 100);
}
function playAudioMix3(id, text) {
	aryText = text.split("|");
	cnt = 0;
	bEnd = true;
	nTtsCnt = aryText.length;
	if (intervalKey!=null) clearInterval(intervalKey);
	intervalKey = setInterval(function() {
		if (bEnd && cnt<nTtsCnt) {
			bEnd = false;
			console.log(cnt + ":" + aryText[cnt]);
			if (isAlphabetString(aryText[cnt]))
				playAudio3('audio1','en',aryText[cnt]);
			else
				playAudio('audio1','zh',aryText[cnt]);				
		} else if (cnt==nTtsCnt) {
			console.log("TTS finished.");
			clearInterval(intervalKey);
		}
	}, 100);
}
function ttsChineseEnglish(text) {
	if (document.getElementById('r1').checked) { //Google TTS 
		textMix="";
		for (var i=0;i<text.length;i++) {
			textMix += text.charAt(i);
			if (i==text.length-1) break;
			if (isAlphabet(text.charAt(i)) && !isAlphabet(text.charAt(i+1))) {
					textMix+="|";
			} else if (!isAlphabet(text.charAt(i)) && isAlphabet(text.charAt(i+1))) {
				textMix+="|";
			}		
		}
		console.log("Google TTS");
		playAudioMix2('audio1', textMix);
	}
	else if (document.getElementById('r2').checked) { //Delta MMI TTS
		console.log("Delta TTS");
		playAudio2('audio1','zh',text);
	}
	else if (document.getElementById('r3').checked) { //Google Cloud TTS 
		textMix="";
		for (var i=0;i<text.length;i++) {
			textMix += text.charAt(i);
			if (i==text.length-1) break;
			if (isAlphabet(text.charAt(i)) && !isAlphabet(text.charAt(i+1))) {
					textMix+="|";
			} else if (!isAlphabet(text.charAt(i)) && isAlphabet(text.charAt(i+1))) {
				textMix+="|";
			}		
		}
		console.log("Google Cloud TTS");
		playAudioMix3('audio1', textMix);
	}
}
function ttsChineseEnglish2(text) {
	if (document.getElementById('r1').checked) { //Google TTS 
		console.log("Google TTS");
		if (isAlphabet(text.charAt(0)))
			playAudio('audio1','en',text);
		else
			playAudio('audio1','zh',text);				
	}
	else if (document.getElementById('r2').checked) { //Delta MMI TTS
		console.log("Delta TTS");
		playAudio2('audio1','zh',text);
	}
	else if (document.getElementById('r3').checked) { //Google Cloud TTS 
		console.log("Google Cloud TTS");
		if (isAlphabet(text.charAt(0)))
			playAudio3('audio1','en',text);
		else
			playAudio('audio1','zh',text);				
	}
}
function isAlphabet(ch)
{
	if ((ch>='a' && ch<='z') || (ch>='A' && ch<='Z') || ch==" " || ch=="," || ch=="." || ch=="-")
		return true;
	else
		return false;
}	
function isAlphabetString(sz)
{
	for (var i=0;i<sz.length;i++) {
		if (isAlphabet(sz.charAt(i)))
			return true;
	}
	return false;
}
