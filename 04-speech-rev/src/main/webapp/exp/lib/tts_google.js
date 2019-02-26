
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
	audio.src = "https://www.google.com/speech-api/v1/synthesize?ie=UTF-8&text="+text+"&lang="+lang;
	audio.play(); // ¼½©ñ»y­µ¡C
	console.log("play " + audio.src);
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
function ttsChineseEnglish(text) {
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
	playAudioMix2('audio1', textMix);
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
