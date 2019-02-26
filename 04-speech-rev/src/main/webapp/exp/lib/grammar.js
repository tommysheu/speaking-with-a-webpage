var oNode;

function expand(szNode) {
	//console.log("expand(" + szNode + ")");
	//console.log("\t" + oNode[szNode]);
	if (oNode[szNode].charAt(0)!="#") {
		var aryExpand1 = oNode[szNode].split("\n");
		var szExpand1 = "";
		for (var i=0;i<aryExpand1.length;i++) {
			//console.log("\t" + aryExpand1[i]);
			var aryExpand2 = aryExpand1[i].split(" ");
			if (aryExpand2.length<=1) {
				szExpand1 += expand(aryExpand2[0]) + "\n";
			}
			else {
				var szExpand2 = aryExpand2[0];
				var szTemp;
				for (var j=1;j<aryExpand2.length;j++) {
					szTemp = concatenate(szExpand2,aryExpand2[j]);
					szExpand2 += "_" + aryExpand2[j];
					oNode[szExpand2] = szTemp;
				}
				szExpand1 += szTemp + "\n";
			}
		}
		return szExpand1;
	}
	else {
		return oNode[szNode];
	}
}

function concatenate(szNode1, szNode2) {
	//console.log("\t\tconcatenate(" + szNode1 + "," + szNode2 + ")");
	var aryConcate1 = expand(szNode1).split("\n");
	var aryConcate2 = expand(szNode2).split("\n");
	var szTemp = "";
	for (var i=0;i<aryConcate1.length;i++) {
		for (var j=0;j<aryConcate2.length;j++) {
			if (i!=aryConcate1.length-1 || j!=aryConcate2.length-1)
				szTemp += aryConcate1[i] + " " + aryConcate2[j] + "\n";
			else
				szTemp += aryConcate1[i] + " " + aryConcate2[j];
		}
	}
	return szTemp;
}

function compileGrammar(szGrammarBox) {
  oNode = new Object();
  //var grammarBox = document.getElementById("grammarBox"); 
  //szGrammarBox = grammarBox.value;
  console.log('Grammar:\n' + szGrammarBox);
  //alert(szGrammarBox);
  //return;
  var szFileInput = szGrammarBox;
  aryFileInput = szFileInput.split("\n");
  for (var i=0;i<aryFileInput.length;i++) {
	szLine = aryFileInput[i];
	if (szLine.charAt(0)==".") {
		//console.log("Node: " + szLine.substr(1));
		szNode = szLine.substr(1);
		while (i<aryFileInput.length-1) {
			szLine = aryFileInput[i+1]; 
			if (szLine=="")
				i++;
			else if (szLine.charAt(0)==".")
				break;
			else {
				if (!oNode[szNode])
					oNode[szNode] = szLine;
				else
					oNode[szNode] += "\n" + szLine;
				i++;
			}
		}
	}
  }
  
  //console.log("\n--------------------------\n");
  //for (var i in oNode) {
  //	console.log("Node: " + i);
  //	console.log(oNode[i] + "\n");
  //}
  //console.log("\n--------------------------\n");
  
  //vocBox.value = expand("main").replace(/ |#/g,"").split("\n").join(" ");
  //szVocBox = vocBox.value;
  szVocBox =expand("main").replace(/ |#/g,"").split("\n").join(" ");
  szVocBox = szVocBox.replace( /^\s+/g,'').replace(/\s+$/g,'');//trim string
  //words.value=szVocBox.split(" ").join(",");
  return szVocBox;
}