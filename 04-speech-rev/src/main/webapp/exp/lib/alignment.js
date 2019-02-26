
function LVCSR_Accuracy(szRef, szRes) {	
	bWord=false;
	//calculate LVCSR accuracy
	console.log("\ncalculate LVCSR accuracy...");
	
	Ins = 0; 
	Del = 0;
	Sub = 0;
	Hit = 0;
	Total = 0;
	Sent_match = 0;
	Sent_total = 0;
	
	szRef2 = "";
	szRes2 = "";
	for (j=0;j<szRef.length;j++) {
		if (j==0 && szRef.charAt(j)==' ') continue;			//ignore leading space
		if (j==szRef.length-1 && szRef.charAt(j)==' ') continue;	//ignore padding space
		if (szRef.charAt(j)==' ' && szRef.charAt(j+1)==' ') continue;	//combine two spaces to one
		szRef2 += szRef.charAt(j);
		
		if (j==szRef.length-1) continue;
		if (szRef.charAt(j)==' ' || szRef.charAt(j+1)==' ') continue;
		//if (isAlphabetDigit(szRef.charAt(j)) && isAlphabetDigit(szRef.charAt(j+1))) continue;		
		if (isAlphabet(szRef.charAt(j)) && isAlphabet(szRef.charAt(j+1))) continue;		
		if (!bWord) szRef2 += " ";							//add space between alphabet-中文, 中文-alphabet, 中文-中文
	}
	for (j=0;j<szRes.length;j++) {
		if (j==0 && szRes.charAt(j)==' ') continue;			//ignore leading space
		if (j==szRes.length-1 && szRes.charAt(j)==' ') continue;	//ignore padding space
		if (szRes.charAt(j)==' ' && szRes.charAt(j+1)==' ') continue;	//combine two spaces to one
		szRes2 += szRes.charAt(j);
		
		if (j==szRes.length-1) continue;
		if (szRes.charAt(j)==' ' || szRes.charAt(j+1)==' ') continue;
		//if (isAlphabetDigit(szRes.charAt(j)) && isAlphabetDigit(szRes.charAt(j+1))) continue;		
		if (isAlphabet(szRes.charAt(j)) && isAlphabet(szRes.charAt(j+1))) continue;		
		if (!bWord) szRes2 += " ";							//add space between alphabet-中文, 中文-alphabet, 中文-中文
	}
	szRef = szRef2;
	szRes = szRes2;

	Ref = szRef.split(" ");
	Res = szRes.split(" ");	

	Delete = 0;
	Insert = 0;
	Substitute = 0;
	MatchArray2(Ref, Res, 1.0, 1.01); 
	
	nRef = Ref.length;

	Ins += Insert;
	Del += Delete;
	Sub += Substitute;
	//Total += Ref.length;
	Total += nRef;
		
	//sent_total = Ref.length;
	sent_total = nRef;
	sent_hit = sent_total-Delete-Substitute;
	sent_corr = sent_hit/sent_total*100;
	sent_acc = (sent_hit-Insert)/sent_total*100;
	
	if (sent_acc==100)
		Sent_match++; 
	Sent_total++;

	console.log("transcription,result,total,hit,ins,del,sub,corr,acc");	
	console.log(szRef + "," + szRes + "," + sent_total + "," + sent_hit + "," + Insert + "," + Delete + "," + Substitute + "," + FloatOutput(sent_corr,1)+"%," + FloatOutput(sent_acc,1)+ "%");
	return sent_acc;
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


function compare(x,y) {
	if (x[1]>y[1]) 
		return -1;
	else if (x[1]==y[1])
		return 0;
	else
		return 1;
}


function strimPreZero(szInput)
{
	ch = szInput.substring(0,1);
	if (ch=="0")
		szOutput = szInput.substr(1);
	else
		szOutput = szInput;
	
	return szOutput;
}

function cost(a,b,nDif) {
	if (a==b)
		return 0;
	else
		return nDif;
} 
	
//function Match.prototype.MatchArray2(Ref, Res, nGap, nDif)
function MatchArray2(Ref, Res, nGap, nDif)
{	

	var oConf = new Object();

	//var nGap = 1;
	//var nDif = 1.1;

	var m = Ref.length;
	var n = Res.length;
		
	var A = new Array();
	var B = new Array();
	
	var i;
	var j;
	
	var nCost;
	
	//initialize
	for (i=0;i<=m;i++) {
		A[i] = new Array();
		A[i][0] = i*nGap;
		B[i] = new Array();
	}
	for (j=0;j<=n;j++)
		A[0][j] = j*nGap;

	
	//dynamic programming
	for (i=1;i<=m;i++) {
		for (j=1;j<=n;j++) {
			nCost1 = A[i-1][j-1] + cost(Ref[i-1],Res[j-1],nDif);
			nCost2 = A[i-1][j] + nGap;
			nCost3 = A[i][j-1] + nGap;
			if (nCost1<=nCost2 && nCost1<=nCost3) {
				A[i][j] = nCost1;
				B[i][j] = 1;
			}
			else if (nCost2<=nCost1 && nCost2<=nCost3) {
				A[i][j] = nCost2;
				B[i][j] = 2;
			}
			else if (nCost3<=nCost1 && nCost3<=nCost2) {
				A[i][j] = nCost3;
				B[i][j] = 3;
			}
		}
	}
	
	//trace back
	var Ref1 = "";
	var Res1 = "";
	i = m;
	j = n;
	var nHit = 0;
	var nIns = 0;
	var nDel = 0;
	var nSub = 0;
	while (i>0 || j>0) {
		if (B[i][j]==1) {
			Ref1 = Ref[i-1] + Ref1;
			Res1 = Res[j-1] + Res1;
			if (Ref[i-1]==Res[j-1])
				nHit++;
			else
				nSub++;
				
			//confusion matrix
			if (!oConf[Ref[i-1]])
				oConf[Ref[i-1]] = new Object();
			if (!oConf[Ref[i-1]][Res[j-1]])
				oConf[Ref[i-1]][Res[j-1]] = 0;
			oConf[Ref[i-1]][Res[j-1]]++;
			
			i--;
			j--;
		}
		else if (B[i][j]==2) {
			Ref1 = Ref[i-1] + Ref1;
			//Res1 = " " + Res1;
			Res1 = "  " + Res1; //for中文
			
			//confusion matrix
			if (!oConf[Ref[i-1]])
				oConf[Ref[i-1]] = new Object();
			if (!oConf[Ref[i-1]][""])
				oConf[Ref[i-1]][""] = 0;
			oConf[Ref[i-1]][""]++;
			
			i--;
			nDel++;
		}
		else if (B[i][j]==3) {
			//Ref1 = " " + Ref1;
			Ref1 = "  " + Ref1; //for 中文
			Res1 = Res[j-1] + Res1;
			
			//confusion matrix
			if (!oConf[""])
				oConf[""] = new Object();
			if (!oConf[""][Res[j-1]])
				oConf[""][Res[j-1]] = 0;
			oConf[""][Res[j-1]]++;

			j--;
			nIns++;
		}
		if (j==0) {
			while (i>0) {
				Ref1 = Ref[i-1] + Ref1;
				//Res1 = " " + Res1;
				Res1 = "  " + Res1; //for中文

				//confusion matrix
				if (!oConf[Ref[i-1]])
					oConf[Ref[i-1]] = new Object();
				if (!oConf[Ref[i-1]][""])
					oConf[Ref[i-1]][""] = 0;
				oConf[Ref[i-1]][""]++;

				i--;
				nDel++;
			}
		}	
		if (i==0) {
			while (j>0) {
				//Ref1 = " " + Ref1;
				Ref1 = "  " + Ref1; //for 中文
				Res1 = Res[j-1] + Res1;

				//confusion matrix
				if (!oConf[""])
					oConf[""] = new Object();
				if (!oConf[""][Res[j-1]])
					oConf[""][Res[j-1]] = 0;
				oConf[""][Res[j-1]]++;

				j--;
				nIns++;
			}
		}	
		//console.log(i+","+j);
	}
	Insert = nIns;
	Delete = nDel;
	Substitute = nSub;
	
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
