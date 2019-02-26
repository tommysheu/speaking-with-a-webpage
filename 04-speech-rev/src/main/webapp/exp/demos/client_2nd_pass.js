<!--
var final_transcript = ''; 
var adapt_transcript = '';
var recognizing = false; 
//var oChar2Pinyin = new Object();

var targetBox = document.getElementById("targetBox"); 
var vocBox = document.getElementById("vocBox"); 
var infoBox = document.getElementById("infoBox"); 
var textBox = document.getElementById("textBox"); 
var tempBox = document.getElementById("tempBox"); 
var startStopButton = document.getElementById("startStopButton"); 
var deviceCombo = document.getElementById("deviceCombo"); 
var langCombo = document.getElementById("langCombo"); 
var secondPassCombo = document.getElementById("secondPassCombo"); 
var thresholdCombo = document.getElementById("thresholdCombo"); 

var nThreshold = eval(thresholdCombo.value);

if (!('webkitSpeechRecognition' in window)) {  
  infoBox.innerText = "Please update to Chrome 25 or above to enable speech recognition.";
} else {
  var recognition = new webkitSpeechRecognition(); 
  recognition.continuous = true; 
  recognition.interimResults = true; 
    
  var szVocBox;
  var aryVocBox;
  var szTargetBox;
  var targetPinyin;

  recognition.onstart = function() { 
    recognizing = true; 
    startStopButton.value = "按此停止";  
    infoBox.innerText = "辨識中..."; 
  };

  recognition.onend = function() { 
    recognizing = false; 
    startStopButton.value = "開始辨識";  
    if (infoBox.innerText == "辨識中...")
    	infoBox.innerText = "";
    //secondPassButton(event);
  };

  recognition.onresult = function(event) { 
    //console.log(event);
    var interim_transcript = ''; 
    var final_temp ='';
    var adapt_temp = '';
    
    //console.log(event.results);
    
    for (var i = event.resultIndex; i < event.results.length; ++i) { 
      if (event.results[i].isFinal) { 
    	console.log("=> " + event.results[i][0].transcript + " " + event.results[i][0].confidence);
    	if (deviceCombo.value=="desktop")
        	final_transcript += event.results[i][0].transcript + " "; 
        else
        	final_transcript = event.results[i][0].transcript + " "; 
        final_temp = event.results[i][0].transcript;
        //adapt_temp = getTargetKWS(getPinyin(final_temp));
    	if (deviceCombo.value=="desktop")
        	adapt_transcript += adapt_temp + " ";
        else
        	adapt_transcript = adapt_temp + " ";
      } else { 
        interim_transcript += event.results[i][0].transcript; 
      }
    }
    if (final_transcript.trim().length > 0) {
        textBox.value = final_transcript; 
        secondPassButton(event);
        //console.log(final_transcript);
    }        
    if (interim_transcript.trim().length > 0) 
        tempBox.value = interim_transcript; 
    if (adapt_transcript.trim().length > 0) 
        adaptBox.value = adapt_transcript; 

    if (final_temp.trim().length > 0)
    	//infoBox.innerHTML = "<font color='red'>" + final_temp + " (" + getPinyin(final_temp) + ")</font> => <font color='blue'>" + getTargetKWS(getPinyin(final_temp),true) + "</font> :)";
    	infoBox.innerHTML = "<font color='red'>" + final_transcript + " (" + getPinyin(final_transcript) + ")</font> => <font color='blue'>" + getTargetKWS(getPinyin(final_transcript),true) + "</font> :)";
    //else if (interim_transcript.trim().length > 0)
    //	infoBox.innerHTML = "<font color='red'>" + interim_transcript + " (" + getPinyin(interim_transcript) + ")</font> => <font color='blue'>" + getTargetKWS(getPinyin(interim_transcript),true) + "</font> :)";
  };
}

function FloatOutput(iInput,iDotNum)
{
	if (!iDotNum)
		iDotNum = 2;
	szInput = ""+iInput;
	iDot = szInput.indexOf(".");
	
	if (iDot==-1)
		return szInput;
	
	iExtra = szInput.substring(iDot+iDotNum+1,iDot+iDotNum+2);
	if (iExtra<5)
		return szInput.substring(0,iDot+iDotNum+1);
	else {
		szInput = ""+(iInput+Math.pow(0.1,iDotNum));
		iDot = szInput.indexOf(".");
		return szInput.substring(0,iDot+iDotNum+1);
	}		
}

function getPinyin(str) {
	str=str.replace(/0/g,"零");
	str=str.replace(/1/g,"一");
	str=str.replace(/2/g,"二");
	str=str.replace(/3/g,"三");
	str=str.replace(/4/g,"四");
	str=str.replace(/5/g,"五");
	str=str.replace(/6/g,"六");
	str=str.replace(/7/g,"七");
	str=str.replace(/8/g,"八");
	str=str.replace(/9/g,"九");
	
	str=str.toUpperCase();
		
	//a=>aaa,b=>bbb, ... z=>zzz
/*	tmp = "";
	for (var i=0;i<str.length;i++) {
		if (str.charCodeAt(i)>=97 && str.charCodeAt(i)<=122)
			tmp += str.charAt(i) + str.charAt(i) + str.charAt(i);
		else
			tmp += str.charAt(i);
	}
	str = tmp;
*/	

	//A=>"A "
/*	tmp = "";
	for (var i=0;i<str.length;i++) {
		if (str.charCodeAt(i)>=65 && str.charCodeAt(i)<=90)
			tmp += str.charAt(i) + " ";
		else
			tmp += str.charAt(i);
	}
	str = tmp;
*/
	return pinyinUtil.getPinyin(str);
}

/*
function getPinyin(str)
{
	var str1;
	var spell="";
	var k;
	
 	str=str.replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
	if(str.length == 0) return;
	for( k=0; k<str.length; k++){
		done=0;
		str1=str.charAt(k);
		if (oChar2Pinyin[str1])
			spell = spell + oChar2Pinyin[str1] + " ";
		else if (str1!=' ' && str1!='-')
			spell = spell + "XXXXX ";
	} 
	//return spell;
	return spell.trim();
} 
*/

function Minimum(a, b, c) {
	var mi;
	mi = a;
	if (b < mi)
		mi = b;
	if (c < mi)
		mi = c;
	return mi;
}

function LD(s, t) {
		
	var d = new Array();
	var n; // length of s
	var m; // length of t
	var i; // iterates through s
	var j; // iterates through t
	var s_i; // ith character of s
	var t_j; // jth character of t
	var cost; // cost
	var dG = new Array();

	// Step 1
	n = s.length;
	m = t.length;
	if (n == 0) {
		return m;
	}

	if (m == 0) {
		return n;
	}
	
	for(i=0; i<=n; i++)
		d[i] = new Array();

	// Step 2
	for (i = 0; i <= n; i++) {
		d[i][0] = i;
	}

	for (j = 0; j <= m; j++) {
		d[0][j] = j;
	}

	// Step 3
	for (i = 1; i <= n; i++) {

		s_i = s.charAt(i - 1);

		
		// Step 4
		for (j = 1; j <= m; j++) {

			t_j = t.charAt(j - 1);

			// Step 5
			if (s_i == t_j) {
				cost = 0;
			}
			else {
				cost = 1;
			}

			// Step 6
			d[i][j] = Minimum (d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
		}

	}
	
	for(i=1; i<=n; i++) {
		dG[i] = new Array();
		for(j=1; j<=m; j++)
			dG[i][j] = d[i][j];
	}

	// Step 7
	//return d[n][m];
	nMax = Math.max(s.length,t.length);
	return (nMax-d[n][m])/nMax;
}

function getTargetKWS2(szPinyin,bDebug) {

	if (!bDebug) bDebug = false;

	//var nThreshold = 0.8;
	var nScoreMax = -1;
	szHypAdapt = "N/A";
	szHypAdaptPinyin = "N/A";
	szHypAdaptKws = "";
	szHypAdaptKws2 = "";
	
	szPinyin = szPinyin.split(" ").join("");
	nLenSource = szPinyin.length;
	
	for (var j=0;j<nLenSource;j++) {
		for (var i=0;i<aryVocBox.length;i++) {
			szTargetPinyin = targetPinyin[i].split(" ").join("");
			nLenTarget = szTargetPinyin.length;
			szPinyinKws = szPinyin.substr(j,nLenTarget);
			nScore = LD(szPinyinKws,szTargetPinyin);
			if (nScore>=nThreshold) {
				//if (szHypAdaptKws.indexOf(aryVocBox[i])==-1)
				if ((" " + szHypAdaptKws).indexOf(" " + aryVocBox[i] + "(")==-1)
					//szHypAdaptKws += aryVocBox[i] + "(" + FloatOutput(nScore,2) + ") ";
					//szHypAdaptKws += aryVocBox[i] + "(" + getPinyin(aryVocBox[i]) + ", " + FloatOutput(nScore,2) + ") ";
					szHypAdaptKws += aryVocBox[i] + "(" + aryVocBox0[i] + ", " + getPinyin(aryVocBox0[i]) + ", " + FloatOutput(nScore,2) + ") ";
				//if (szHypAdaptKws2.indexOf(aryVocBox[i])==-1)
				if ((" " + szHypAdaptKws2).indexOf(" " + aryVocBox[i] + " ")==-1)
					szHypAdaptKws2 += aryVocBox[i] + " ";
				if (bDebug)
					//console.log("KWS," + j + "," + FloatOutput(nScore,2) 	+ ": " + aryVocBox[i]);
					console.log("KWS," + j + "," + FloatOutput(nScore,2) + ": " + aryVocBox[i] + "(" + aryVocBox0[i] +")");
					//console.log("KWS" + szHypAdaptKws);
			}
		}
	}		
	
  	if (bDebug)
  		return szHypAdaptKws;
  	else
  		return szHypAdaptKws2;
}

function getTargetKWS1(szPinyin,bDebug) {

	if (!bDebug) bDebug = false;

	//var nThreshold = 0.8;
	var nScoreMax = -1;
	szHypAdapt = "N/A";
	szHypAdaptPinyin = "N/A";
	szHypAdaptKws = "";
	szHypAdaptKws2 = "";
	for (var i=0;i<aryVocBox.length;i++) {
		nLenTarget = targetPinyin[i].split(" ").length;
		nLenSource = szPinyin.split(" ").length;
		
		if (nLenSource<=nLenTarget) {
			nScore = LD(szPinyin.split(" ").join(""),targetPinyin[i].split(" ").join(""));
			
			if (nScore>nScoreMax) {
				nScoreMax = nScore;
				szHypAdapt = aryVocBox[i];
				szHypAdaptPinyin = targetPinyin[i];
			}
			if (nScore>=nThreshold) {
				if (szHypAdaptKws.indexOf(aryVocBox[i])==-1)
					szHypAdaptKws += "\n" + aryVocBox[i] + "(" + FloatOutput(nScore,2) + ") ";
				if (szHypAdaptKws2.indexOf(aryVocBox[i])==-1)
					szHypAdaptKws2 += aryVocBox[i] + " ";
				console.log("KWS1" + szHypAdaptKws);
			}
		}
		else {
			aryPinyin = szPinyin.split(" ");
			for (var j=0;j<=nLenSource-nLenTarget;j++) {
				szPinyinKws = "";
				for (var k=0;k<nLenTarget;k++) {
					szPinyinKws += aryPinyin[k+j];
					if (k<nLenTarget-1) szPinyinKws += " ";
				}
				nScore = LD(szPinyinKws.split(" ").join(""),targetPinyin[i].split(" ").join(""));
				//console.log(szPinyinKws + ". vs. " + targetPinyin[i] + ". : " + nScore);

				if (nScore>nScoreMax) {
					nScoreMax = nScore;
					szHypAdapt = aryVocBox[i];
					szHypAdaptPinyin = targetPinyin[i];;
				}
				if (nScore>=nThreshold) {
					if (szHypAdaptKws.indexOf(aryVocBox[i])==-1)
						szHypAdaptKws += "\n" + aryVocBox[i] + "(" + FloatOutput(nScore,2) + ") ";
					if (szHypAdaptKws2.indexOf(aryVocBox[i])==-1)
						szHypAdaptKws2 += aryVocBox[i] + " ";
					console.log("KWS2" + szHypAdaptKws);
				}
			}
		}	
	}		

  	if (bDebug)
  		return szHypAdaptKws;
  	else
  		return szHypAdaptKws2;
}

function getTargetKWS(szPinyin,bDebug) {

	if (!bDebug) bDebug = false;

	//var nThreshold = 0.8;
	var nScoreMax = -1;
	szHypAdapt = "N/A";
	szHypAdaptPinyin = "N/A";
	szHypAdaptKws = "";
	szHypAdaptKws2 = "";
	
	aryHypAdaptKws = new Array();
	aryHypAdaptKwsExpansion = new Array();
	aryHypAdaptKwsPinyin = new Array();
	aryHypAdaptKwsScore = new Array();
	nKwsCnt = 0;
	
	szPinyin = szPinyin.split(" ").join("");
	nLenSource = szPinyin.length;
	
	for (var j=0;j<nLenSource;j++) {
		for (var i=0;i<aryVocBox.length;i++) {
			szTargetPinyin = targetPinyin[i].split(" ").join("");
			nLenTarget = szTargetPinyin.length;
			szPinyinKws = szPinyin.substr(j,nLenTarget);
			nScore = LD(szPinyinKws,szTargetPinyin);
			if (nScore>=nThreshold) {
				//if ((" " + szHypAdaptKws).indexOf(" " + aryVocBox[i] + "(")==-1)
				//	szHypAdaptKws += aryVocBox[i] + "(" + aryVocBox0[i] + ", " + getPinyin(aryVocBox0[i]) + ", " + FloatOutput(nScore,2) + ") ";
				//if ((" " + szHypAdaptKws2).indexOf(" " + aryVocBox[i] + " ")==-1)
				//	szHypAdaptKws2 += aryVocBox[i] + " ";
				if (bDebug)
					console.log("KWS," + j + "," + FloatOutput(nScore,2) + ": " + aryVocBox[i] + "(" + aryVocBox0[i] +")");
				
				bKwExist = false;
				for (k=0;k<nKwsCnt;k++) {
					if (aryHypAdaptKws[k]==aryVocBox[i]) {
						bKwExist = true;
						if (aryHypAdaptKwsScore[k]<nScore) {
							aryHypAdaptKwsExpansion[k] = aryVocBox0[i];
							aryHypAdaptKwsPinyin[k] = getPinyin(aryVocBox0[i]);
							aryHypAdaptKwsScore[k] = nScore;
						}
						break;
					}
				}
				if (!bKwExist) {
					aryHypAdaptKws[nKwsCnt] = aryVocBox[i];
					aryHypAdaptKwsExpansion[nKwsCnt] = aryVocBox0[i];
					aryHypAdaptKwsPinyin[nKwsCnt] = getPinyin(aryVocBox0[i]);
					aryHypAdaptKwsScore[nKwsCnt] = nScore;
					nKwsCnt++;
				}
			}
		}
	}
	
	nKwsMaxLen = -1;
	for (k=0;k<nKwsCnt;k++) {
		if (aryHypAdaptKws[k].length>nKwsMaxLen)
			nKwsMaxLen = aryHypAdaptKws[k].length;
	}
	if (bDebug)
		console.log("keyword max length: " +nKwsMaxLen);
	
	//longer keyword first
	for (m=nKwsMaxLen;m>0;m--) {
		for (k=0;k<nKwsCnt;k++) {
			if (aryHypAdaptKws[k].length!=m) continue;
			if (szHypAdaptKws2.indexOf(aryHypAdaptKws[k])!=-1) {
				console.log("(xxx) " +  aryHypAdaptKws[k] + " vs. " + szHypAdaptKws2);
				break;
			}
			szHypAdaptKws += aryHypAdaptKws[k] + "(" + aryHypAdaptKwsExpansion[k] + ", " + aryHypAdaptKwsPinyin[k] + ", " + FloatOutput(aryHypAdaptKwsScore[k],2) + ") ";
			szHypAdaptKws2 += aryHypAdaptKws[k] + " ";
			
			//return only first longer keyword
		  	//if (bDebug)
		  	//	return szHypAdaptKws;
		  	//else
		  	//	return szHypAdaptKws2;			
		}
	}
	
	//組合點膠測試(組合點膠測試, zǔ hé diǎn jiāo cè shì, 0.82) 焊點(何點, hè diǎn, 1) 點膠測試(點膠測試, diǎn jiāo cè shì, 0.85) 
  	if (bDebug)
  		return szHypAdaptKws;
  	else
  		return szHypAdaptKws2;
}

function getTargetKWS_LVCSR(szPinyin,szHyp,bDebug) {

	if (!bDebug) bDebug = false;

	//var nThreshold = 0.8;
	var nScoreMax = -1;
	szHypAdapt = "N/A";
	szHypAdaptPinyin = "N/A";
	szHypAdaptKws = "";
	szHypAdaptKws2 = "";
	//szHypeAdaptKwsLvcsr = szHyp;
	szHypeAdaptKwsLvcsr = szHyp.replace(/ /g,"");
	nScoreLVCSR = 0;
	for (var i=0;i<aryVocBox.length;i++) {
		nLenTarget = targetPinyin[i].split(" ").length;
		nLenSource = szPinyin.split(" ").length;
		
		if (nLenSource<=nLenTarget) {
			nScore = LD(szPinyin.split(" ").join(""),targetPinyin[i].split(" ").join(""));
			
			if (nScore>nScoreMax) {
				nScoreMax = nScore;
				szHypAdapt = aryVocBox[i];
				szHypAdaptPinyin = targetPinyin[i];
			}
			if (nScore>=nThreshold) {
				szHypAdaptKws += "\n" + aryVocBox[i] + "(" + FloatOutput(nScore,2) + ") ";
				szHypAdaptKws2 += aryVocBox[i] + " ";
				szHypeAdaptKwsLvcsr = aryVocBox[i];
				console.log("KWS_LVCSR1:" + szHypeAdaptKwsLvcsr);
				nScoreLVCSR += nScore;
			}
		}
		else {
			aryPinyin = szPinyin.split(" ");
			for (var j=0;j<=nLenSource-nLenTarget;j++) {
				szPinyinKws = "";
				for (var k=0;k<nLenTarget;k++) {
					szPinyinKws += aryPinyin[k+j];
					if (k<nLenTarget-1) szPinyinKws += " ";
				}
				nScore = LD(szPinyinKws.split(" ").join(""),targetPinyin[i].split(" ").join(""));
				//console.log(szPinyinKws + ". vs. " + targetPinyin[i] + ". : " + nScore);

				if (nScore>nScoreMax) {
					nScoreMax = nScore;
					szHypAdapt = aryVocBox[i];
					szHypAdaptPinyin = targetPinyin[i];;
				}
				if (nScore>=nThreshold) {
					szHypAdaptKws += "\n" + aryVocBox[i] + "(" + FloatOutput(nScore,2) + ") ";
					szHypAdaptKws2 += aryVocBox[i] + " ";
					console.log(szHypeAdaptKwsLvcsr.substring(0,j) + ",(" + aryVocBox[i] + ")," + szHypeAdaptKwsLvcsr.substr(j+nLenTarget) + " " + nLenTarget);
					szHypeAdaptKwsLvcsr = szHypeAdaptKwsLvcsr.substring(0,j) + aryVocBox[i] + szHypeAdaptKwsLvcsr.substr(j+nLenTarget);
					//console.log("KWS_LVCSR2" + szHypeAdaptKwsLvcsr);
					nScoreLVCSR += nScore;
				}
			}
		}	
	}		

	//test case: 560 510 通用設備 大m 小p 同共用小組 AGV
	//test case: 560 510 通用設備 大m 小p 同共用小組 AGV tracking metrics d0 p1 AI盤點表
 	if (bDebug)
  		return szHypAdaptKws;
  	else
  		//return szHypeAdaptKwsLvcsr;
 		//組合點膠測試(, , 0.82)
  		return szHypeAdaptKwsLvcsr + "(, , " + FloatOutput(nScoreLVCSR,2) + ") ";
}

//szPinyin:	wǔ liù líng - wǔ yī líng - tōng yòng shè bèi - dà M - xiǎo P - tóng gòng yòng xiǎo zǔ - AGV - TRACKING - METRICS - D líng - P yī - AI pán diǎn biǎo
//szHyp: 	5 6 0 - 5 1 0 - 通 用 設 備 - 大 m - 小 p - 同 共 用 小 組 - AGV - tracking - metrics - d 0 - p 1 - AI 盤 點 表
function getTargetKWS_LVCSR2(szHypPinyin,szHyp,bDebug) {

	if (!bDebug) bDebug = false;

	//var nThreshold = 0.8;
	var szHypAdapt = "";
	var nScoreAdapt = 0;
		
	var aryHypPinyin = szHypPinyin.trim().split(" ");
	var aryHyp = szHyp.trim().split(" ");
	var nLenSource = aryHypPinyin.length;
	var nLengthTarget;
	var nScoreMax;
	var nScoreMaxIndex;
	var nScoreMaxWordLength;
	
	for (var j=0;j<nLenSource;j++) {
		nScoreMax = -1;
		for (var i=0;i<aryVocBox.length;i++) {
			szTargetPinyin = targetPinyin[i].trim();
			aryTargetPinyin = szTargetPinyin.split(" ");
			nLenTarget = aryTargetPinyin.length;
			if (j+nLenTarget>nLenSource) continue;
			
			szHypPinyinTmp = "";
			for (var k=0;k<nLenTarget;k++) {
				szHypPinyinTmp += aryHypPinyin[j+k] + " ";
			}
			szHypPinyinTmp = szHypPinyinTmp.trim();
			
			nScore = LD(szHypPinyinTmp.split(" ").join(""),szTargetPinyin.split(" ").join(""));
			
			if (nScore>=nThreshold) {
				if (bDebug)
					console.log("KWS_LVCSR2," + j + "," + FloatOutput(nScore,2) + ": " + aryVocBox[i] + "(" + aryVocBox0[i] +")");
				if (nScore*nLenTarget>nScoreMax) {
					nScoreMax = nScore*nLenTarget;
					nScoreMaxIndex = i;
					nScoreMaxWordLength = nLenTarget;
					///console.log("max score: " + FloatOutput(nScore,2) + "x" + nLenTarget + "=" + FloatOutput(nScoreMax,2));
				}	
			}
		}
		if (nScoreMax==-1) 
			szHypAdapt += aryHyp[j] + " ";
		else {
			szHypAdapt += aryVocBox[nScoreMaxIndex] + " ";
			nScoreAdapt += nScoreMax;
			j += nScoreMaxWordLength-1;
			///console.log("*** (" + aryVocBox[nScoreMaxIndex] + ")");
		}
	}
	szHypAdapt = szHypAdapt.trim();
	szHypAdapt = szHypAdapt.replace(/ /g,"").replace(/-/g," ");
			
 	//組合點膠測試(, , 0.82)
  	return szHypAdapt + "(, , " + FloatOutput(nScoreAdapt,2) + ") ";
}

//(O)馬杜系統 => 馬 杜 系 統, XY平台 => XY 平 台, smart function => smart - function
//(X)馬 杜 系統 => 馬 - 杜 - 系 統
//   馬 杜 系統, 馬 度 系統, 馬 杜 矽 統, 馬 度 洛 系統, 馬 杜 洛 系統
function delimitWord(szInput) {
	var bWord = false;
	var szOutput = "";
	for (var j=0;j<szInput.length;j++) {
		if (j==0 && szInput.charAt(j)==' ') continue;					//ignore leading space
		if (j==szInput.length-1 && szInput.charAt(j)==' ') continue;			//ignore padding space
		if (szInput.charAt(j)==' ' && szInput.charAt(j+1)==' ') continue;		//combine two spaces to one
		//if (szInput.charAt(j)==' ' && szOutput!="") { szOutput += " - "; continue;}	//replace space with '-'
		if (szInput.charAt(j)==' ' && isAlphabetDigit(szInput.charAt(j+1)) && szOutput!="") { szOutput += " - "; continue;}	//replace space with '-'
		szOutput += szInput.charAt(j);
		
		if (j==szInput.length-1) continue;
		if (szInput.charAt(j)==' ' || szInput.charAt(j+1)==' ') continue;
		//if (isAlphabetDigit(szInput.charAt(j)) && isAlphabetDigit(szInput.charAt(j+1))) continue;		
		if (isAlphabet(szInput.charAt(j)) && isAlphabet(szInput.charAt(j+1))) continue;		
		if (!bWord) szOutput += " ";							//add space between alphabet-中文, 中文-alphabet, 中文-中文
	}

	//console.log("<=" + szInput + ".");
	//console.log("=>" + szOutput + ".");
	return szOutput;
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
	if ((ch>='a' && ch<='z') || (ch>='A' && ch<='Z'))
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

function secondPassButton(event) {
  //textBox.value = ''; 
  tempBox.value = ''; 
  final_transcript = ''; 
  adapt_transcript = '';
  //recognition.lang = langCombo.value; 
  nThreshold = eval(thresholdCombo.value);
/*
  var i_start,i_end;
  if (langCombo.value=="en-US") {
    i_start = 2604;
    i_end = 2613;
  }
  else if (langCombo.value=="cmn-Hant-TW") {
    i_start = 2614;
    i_end = 2623;
  }
  for (var i=i_start;i<=i_end;i++) {
    var asplit = aryT2P[i].split(":");
    var szPinyin = asplit[0];
    var ss = asplit[1].replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
    for (var j=0; j<ss.length; j++) {
      oChar2Pinyin[ss.charAt(j)] = szPinyin;
    }
  }
*/
  szVocBox = vocBox.value;
  //szVocBox = szVocBox.replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
  aryVocBox = new Array();
  aryVocBox0 = new Array();
  aryVocBox1 = szVocBox.split("\n");
  szTargetBox = "";
  targetPinyin = new Array();
  var nCnt = 0;
  for (var i=0;i<aryVocBox1.length;i++) {
    aryVocBox1[i] = aryVocBox1[i].replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
    if (aryVocBox1[i]=="") continue;
    if (aryVocBox1[i].indexOf(",")!=-1) {
    	aryVocBox2 = aryVocBox1[i].split(",");
    	for (var j=0;j<aryVocBox2.length;j++) {
    		//aryVocBox[nCnt] = aryVocBox2[0];
    		aryVocBox[nCnt] = aryVocBox2[0].replace(/ /g," - ");
    		aryVocBox0[nCnt] = aryVocBox2[j];
  	  	//targetPinyin[nCnt] = getPinyin(aryVocBox2[j]);
  	  	//targetPinyin[nCnt] = getPinyin(aryVocBox2[j].trim().replace(/ /g," - "));
  	  	targetPinyin[nCnt] = getPinyin(delimitWord(aryVocBox2[j].trim()));
    		szTargetBox += aryVocBox2[j] + " (" + targetPinyin[nCnt] + ")\r\n";
    		nCnt++;
    	}
    }
    else {
    	//aryVocBox[nCnt] = aryVocBox1[i];
    	aryVocBox[nCnt] = aryVocBox1[i].replace(/ /g," - ");
    	aryVocBox0[nCnt] = aryVocBox1[i];
    	//targetPinyin[nCnt] = getPinyin(aryVocBox1[i]);
    	//targetPinyin[nCnt] = getPinyin(aryVocBox1[i].trim().replace(/ /g," - "));
 	targetPinyin[nCnt] = getPinyin(delimitWord(aryVocBox1[i].trim()));
     	szTargetBox += aryVocBox1[i] + " (" + targetPinyin[nCnt] + ")\r\n";
    	nCnt++;
    }
  }

  targetBox.innerText = szTargetBox;

  //final_transcript = textBox.value;
  //adaptBox.value = getTargetKWS(getPinyin(final_transcript));
  //infoBox.innerHTML = "<font color='red'>" + final_transcript + " (" + getPinyin(final_transcript) + ")</font> => <font color='blue'>" + getTargetKWS(getPinyin(final_transcript),true) + "</font> :)";

  aryTextBox = textBox.value.split(",");
  adaptBox.value = "";
  infoBox.innerHTML = "";

  TopN=aryTextBox.length;
  aryScoreMax = new Array(TopN);
  aryHypAdapt = new Array(TopN);

  for (var j=0;j<TopN;j++) {
	aryScoreMax[j] = -1;
	aryHypAdapt[j] = aryTextBox[j];
  }
  for (var j=TopN;j<TopN*2;j++) {
	aryScoreMax[j] = -1;
	aryHypAdapt[j] = aryTextBox[j-TopN];
  }

  for (var i=0;i<aryTextBox.length;i++) {
  	final_transcript = aryTextBox[i];
  	//final_transcript = aryTextBox[i].replace(/ /g,"-");
  	//adaptBox.value += getTargetKWS(getPinyin(final_transcript));
  	if (secondPassCombo.value=="KWS")
  		szTargetKWS = getTargetKWS(getPinyin(final_transcript),true);
  	else if (secondPassCombo.value=="LVCSR") {
  		//szTargetKWS = getTargetKWS_LVCSR(getPinyin(final_transcript),final_transcript);
		szResult = delimitWord(final_transcript);
		szResultPinyin = getPinyin(szResult);	
		///console.log("<=" + final_transcript);
		///console.log("=>" + szResult);
		///console.log("=>" + szResultPinyin);
		szTargetKWS = getTargetKWS_LVCSR2(szResultPinyin,szResult);
  	}
  		
  	infoBox.innerHTML += "<font color='red'>" + final_transcript + " (" + getPinyin(final_transcript) + ")</font> => <font color='blue'>" + szTargetKWS + "</font> <br/>";

	//組合點膠測試(組合點膠測試, zǔ hé diǎn jiāo cè shì, 0.82) 焊點(何點, hè diǎn, 1) 點膠測試(點膠測試, diǎn jiāo cè shì, 0.85) 
	///console.log("Top " + (i+1) + " => "+szTargetKWS);
	aryTargetKWS = szTargetKWS.split(") ");
	szTargetKWS = "";
	nScore = 0;
	for (var n=0;n<aryTargetKWS.length-1;n++) {
		szTargetKWS += aryTargetKWS[n].split("(")[0] + " ";
  		if (secondPassCombo.value=="KWS")
  			nScore += eval(aryTargetKWS[n].split("(")[1].split(", ")[2])*aryTargetKWS[n].split("(")[0].length;
  		else if (secondPassCombo.value=="LVCSR")
  			nScore += eval(aryTargetKWS[n].split("(")[1].split(", ")[2]);
		///console.log(nScore);
	}

	for (var j=0;j<TopN;j++) {
		//if (nScore>aryScoreMax[j] && nScore>=nThreshold) {
		if (nScore>aryScoreMax[j]) {
			for (var k=TopN-1;k>j;k--) {
				aryScoreMax[k] = aryScoreMax[k-1];
				aryHypAdapt[k] = aryHypAdapt[k-1];
			}
			aryScoreMax[j] = nScore;
			aryHypAdapt[j] = szTargetKWS;
			//for (k=0;k<TopN;k++) {
			//	console.log("\t" + aryHypAdapt[k] + ", " + aryScoreMax[k]);
			//}
			///console.log("-------------------");
			break;
		}
	}
  }
  //for (var j=0;j<TopN;j++) {
  for (var j=0;j<TopN*2;j++) {
  	//console.log(("-- "+adaptBox.value.trim())+"--");
  	//console.log("-- " + aryHypAdapt[j].trim() + ","+"--");
  	//console.log((" "+adaptBox.value.trim()).indexOf(" " + aryHypAdapt[j].trim() + ","));
  	
  	if ((" "+adaptBox.value.trim()).indexOf(" " + aryHypAdapt[j].trim() + ",")==-1) {
  		adaptBox.value += aryHypAdapt[j].trim() + ", ";
  		//console.log("===> " + adaptBox.value);
  	}
  	///console.log("Top " + (j+1) + ": " +aryHypAdapt[j] + ", " + FloatOutput(aryScoreMax[j],2));
  }
  
  //szResult = delimitWord(textBox.value);
  //szResultPinyin = getPinyin(szResult);
  //console.log("=>"+szResultPinyin);
  
  //aryResult = szResult.split(" ");
  //aryResultPinyin = szResultPinyin.split(" ");
  //for (var i=0;i<aryResult.length;i++) {
  //	console.log((i+1) + ": " + aryResult[i] + " vs. " + aryResultPinyin[i]);
  //}
}

function startButton(event) {
  if (recognizing) { 
    recognition.stop();
    return;
  } else { 
    textBox.value = ''; 
    tempBox.value = ''; 
    adaptBox.value = '';
    final_transcript = ''; 
    adapt_transcript = '';
    recognition.lang = langCombo.value; 
    nThreshold = eval(thresholdCombo.value);
    recognition.start(); 
  }
/*  
  var i_start,i_end;
  if (langCombo.value=="en-US") {
    i_start = 2604;
    i_end = 2613;
  }
  else if (langCombo.value=="cmn-Hant-TW") {
    i_start = 2614;
    i_end = 2623;
  }
  for (var i=i_start;i<=i_end;i++) {
    var asplit = aryT2P[i].split(":");
    var szPinyin = asplit[0];
    var ss = asplit[1].replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
    for (var j=0; j<ss.length; j++) {
      oChar2Pinyin[ss.charAt(j)] = szPinyin;
    }
  }
*/
/*
  szVocBox = vocBox.value;
  szVocBox = szVocBox.replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
  aryVocBox = szVocBox.split(" ");
  szTargetBox = "";
  targetPinyin = new Array(aryVocBox.length);
  for (var i=0;i<aryVocBox.length;i++) {
    targetPinyin[i] = getPinyin(aryVocBox[i]);
    szTargetBox += aryVocBox[i] + " (" + targetPinyin[i] + ")\r\n";
  }
*/

  szVocBox = vocBox.value;
  //szVocBox = szVocBox.replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
  aryVocBox = new Array();
  aryVocBox1 = szVocBox.split("\n");
  szTargetBox = "";
  targetPinyin = new Array();
  var nCnt = 0;
  for (var i=0;i<aryVocBox1.length;i++) {
    aryVocBox1[i] = aryVocBox1[i].replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
    if (aryVocBox1[i]=="") continue;
    if (aryVocBox1[i].indexOf(",")!=-1) {
    	aryVocBox2 = aryVocBox1[i].split(",");
    	for (var j=0;j<aryVocBox2.length;j++) {
    		aryVocBox[nCnt] = aryVocBox2[0];
  	  	targetPinyin[nCnt] = getPinyin(aryVocBox2[j]);
    		szTargetBox += aryVocBox2[j] + " (" + targetPinyin[nCnt] + ")\r\n";
    		nCnt++;
    	}
    }
    else {
    	aryVocBox[nCnt] = aryVocBox1[i];
    	targetPinyin[nCnt] = getPinyin(aryVocBox1[i]);
    	szTargetBox += aryVocBox1[i] + " (" + targetPinyin[nCnt] + ")\r\n";
    	nCnt++;
    }
  }

  targetBox.innerText = szTargetBox;
}

/*
for (i=0;i<aryT2P.length;i++) {
	var asplit = aryT2P[i].split(":");
	var szPinyin = asplit[0];
	var ss = asplit[1].replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
	for (j=0; j<ss.length; j++) {
		oChar2Pinyin[ss.charAt(j)] = szPinyin;
	}
}

var szEng1 = "abcdefghijklmnopqrstuvwxyz";
var szEng2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

for (i=0;i<szEng1.length;i++) {
	oChar2Pinyin[szEng1.charAt(i)] = szEng1.charAt(i);
}

for (i=0;i<szEng2.length;i++) {
	oChar2Pinyin[szEng2.charAt(i)] = szEng1.charAt(i);
}
*/
-->