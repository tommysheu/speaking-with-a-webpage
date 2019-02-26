navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

console.log(navigator.sayswho);

var ttsSupport = false;
var ttsEnable = false;


if ('speechSynthesis' in window) {
	ttsSupport = true;
 	//__log("\nSynthesis support. Make your web apps talk!");
 	console.log("\nSynthesis support. Make your web apps talk!");
	window.speechSynthesis.getVoices();
}

function ttsList() {
	console.log("ttsList()");
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        for (var i in voices) {
        	console.log("voice " + i);
        	__log("voice " + i);
        	for (j in voices[i]) {
        		console.log("   " + j + " : " + voices[i][j]);
        		__log("   " + j + " : " + voices[i][j]);
        	}
        	console.log("=========================================");
        	__log("=========================================");
        }
}
function ttsChinese(text) {
	var msg = new SpeechSynthesisUtterance(text);
	//msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name.search('°ê»y')!=-1; })[0];
	msg.voice = speechSynthesis.getVoices().filter(function(voice) { return (voice.lang.search('zh-TW')!=-1 || voice.lang.search('zh_TW')!=-1); })[0];
	msg.lang = 'zh-TW';
	speechSynthesis.speak(msg);
        __log("tts: "+ msg.voice["voiceURI"] + " : " + msg.text);
}
function ttsEnglish(text) {	
	var msg = new SpeechSynthesisUtterance(text);
	//msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name.search('English')!=-1; })[1];
	msg.voice = speechSynthesis.getVoices().filter(function(voice) { return (voice.lang.search('en-US')!=-1 || voice.lang.search('en_US')!=-1); })[1];
	msg.lang = 'en-US';
	speechSynthesis.speak(msg);
        __log("tts: " + msg.voice["voiceURI"] + " : " + msg.text);
}
function ttsChineseEnglish(text) {
	textEng = "";
	textCht = "";
	for (var i=0;i<text.length;i++) {
		if (isAlphabet(text.charAt(i)))
			textEng += text.charAt(i);
		else
			textCht += text.charAt(i);
		if (i==text.length-1) {
			if (isAlphabet(text.charAt(i))) {
				ttsEnglish(textEng);
				textEng = "";
			} else if (!isAlphabet(text.charAt(i))) {
				ttsChinese(textCht);
				textCht = "";
			}					
		} else if (isAlphabet(text.charAt(i)) && !isAlphabet(text.charAt(i+1))) {
			ttsEnglish(textEng);
			textEng = "";
		} else if (!isAlphabet(text.charAt(i)) && isAlphabet(text.charAt(i+1))) {
			ttsChinese(textCht);
			textCht = "";
		}		
	}
}
function isAlphabetDigit(ch)
{
	if (isAlphabet(ch) || isDigit(ch))
		return true;
	else
		return false;
}

function isAlphabet(ch)
{
	if ((ch>='a' && ch<='z') || (ch>='A' && ch<='Z') || ch==" " || ch=="," || ch=="." || ch=="-")
		return true;
	else
		return false;
}

function isDigit(ch)
{
	if (ch>='0' && ch<='9')
		return true;
	else
		return false;
}        	
