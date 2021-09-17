/*===========================================================================================================
|
|	Title : INCLUDES_EXPRESSIONS
|
|	Functional Area : Accela Product Management and Delivery Solutions
|
|	Description : This INCLUDES script contains utility functions to support advanced expression development
|
============================================================================================================ */
//logDebug("====IMPORTING INCLUDES_EXPRESSIONS====");
var expDebug = "";

function getMessageStyle () {

	var cssStyle = "<style>.infoMsg, .successMsg, .warningMsg, .errorMsg, .validationMsg {	\
										margin: 10px 0px; \
										padding:12px;	\
									}	\
									.infoMsg {	\
										color: #00529B;	\
										background-color: #BDE5F8;	\
									}	\
									.successMsg {	\
										color: #4F8A10;	\
										background-color: #DFF2BF;	\
									}	\
									.warningMsg {	\
										color: #9F6000;	\
										background-color: #FEEFB3;	\
									}	\
									.errorMsg {	\
										color: #D8000C;	\
										background-color: #FFBABA;	\
									}	\
									.infoMsg i, .successMsg i, .warningMsg i, .errorMsg i {	\
								    margin:10px 22px;	\
								    font-size:2em;	\
								    vertical-align:middle;	\
									}</style>";
	return cssStyle;
}

function logDebug (dstr) {

	var vLevel = "info";
	if(arguments.length == 2) {
		vLevel = arguments[1]; // debug level
	}
	var levelCSS = "infoMsg";
	if(vLevel.toUpperCase() == "INFO")
		levelCSS = "infoMsg";
	if(vLevel.toUpperCase() == "SUCCESS")
		levelCSS = "successMsg";
	if(vLevel.toUpperCase() == "WARNING")
		levelCSS = "warningMsg";
	if(vLevel.toUpperCase() == "ERROR")
		levelCSS = "errorMsg";
	var msgFormatted = "<div class=\"" + levelCSS + "\">" + dstr + "</div>";
	debug += msgFormatted;
}

function notice (dstr) {

	var vLevel = "info";
	if(arguments.length == 2) {
		vLevel = arguments[1];
	}
	var levelCSS = "infoMsg";
	if(vLevel.toUpperCase() == "INFO")
		levelCSS = "infoMsg";
	if(vLevel.toUpperCase() == "SUCCESS")
		levelCSS = "successMsg";
	if(vLevel.toUpperCase() == "WARNING")
		levelCSS = "warningMsg";
	if(vLevel.toUpperCase() == "ERROR")
		levelCSS = "errorMsg";
	var msgFormatted = getMessageStyle();
	msgFormatted += "<div class=\"" + levelCSS + "\">" + dstr + "</div>";

	return msgFormatted;
}

function lookup (stdChoice,stdValue) {

	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

	if(bizDomScriptResult.getSuccess()) {

		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
	} else {

		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
	}
	return strControl;
}

function exploreObject (objExplore) {

	logDebug("Methods:");
	for(x in objExplore) {
		if(typeof (objExplore[x]) == "function") {
			logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
			logDebug("   " + objExplore[x] + "<br>");

		}

	}

	logDebug("");
	logDebug("Properties:");
	for(x in objExplore) {
		if(typeof (objExplore[x]) != "function")
			logDebug("  <b> " + x + ": </b> " + objExplore[x]);

	}

}

function exploreObjectInExpression (objExplore) {
	expression.addMessage("Methods:\n");
	for(var x in objExplore) {
		if(typeof objExplore[x] == "function") expression.addMessage("    " + x + "\n");
	}

	expression.addMessage("\n");
	expression.addMessage("Properties:\n");
	for(var y in objExplore) {
		if(typeof objExplore[y] != "function") expression.addMessage("    " + y + " = " + objExplore[y] + "\n");
	}
}

var toPrecision = function(value) {
	var multiplier = 10000;
	return Math.round(value * multiplier) / multiplier;
};

function getFeeItemByVersion (fSched,fVersion,fCode) {

	feeResult = aa.fee.getRefFeeItemByFeeCodeVersion(fSched,fVersion,fCode,"STANDARD",aa.date.getCurrentDate());
	if(feeResult.getSuccess()) {
		feeObj = feeResult.getOutput();
		if(feeObj == null)
			return null;
		var f = new FeeDef();
		f.feeCode = feeObj.getFeeCod();
		f.feeDesc = feeObj.getFeeDes();
		f.formula = feeObj.getFormula();
		f.feeUnit = feeObj.getFeeunit();
		f.feeSch = feeObj.getFeeSchedule();
		f.calcProc = feeObj.getCalProc();
		f.fMax = feeObj.getMaxFee();
		f.fMin = feeObj.getMinFee();
		var rft = feeObj.getrFreeItem();
		f.comments = rft.getComments();
		return f;
	}
	return null;
}

function FeeDef () { // Fee Definition object
	this.formula = null;
	this.feeUnit = null;
	this.feeDesc = null;
	this.feeCode = null;
	this.comments = null;
	this.calcProc = null;
	this.feeMax = null;
	this.feeMin = null;
}

function calcICBOFeeWPrecision (calcVariable,capval,fixedVal) {

	var fee = 0;
	var prevRange = 0;
	var i = 0;
	workVals = calcVariable.split(",");
	if(workVals.length > 2) {
		fee += parseFloat(workVals[0]);
		prevRange = parseFloat(workVals[1]);
		if(prevRange > capval)
			return fee;
		else {
			i = 2;
			while(i < workVals.length) {
				var feeFactor = parseFloat(workVals[i++]);
				var divisor = parseFloat(workVals[i++]).toFixed(fixedVal);
				var nextRange = 999999999999;
				if(workVals.length > (i + 1))
					nextRange = workVals[i++];
				if(capval <= nextRange) {
					addtlAmt = ((roundUpToNearest(capval - prevRange,divisor) / divisor) * feeFactor);
					fee += addtlAmt;
					break;
				} else {
					// add amount of prev range
					prevRngAmt = ((roundUpToNearest(nextRange - prevRange,divisor) / divisor) * feeFactor);
					fee += prevRngAmt;
				}
				prevRange = nextRange;
			}
		}
	}

	return roundNumber(fee,2);
}

function roundUpToNearest (x,y) {
	return (Math.ceil(x / y) * y);
}

function roundNumber (num,dec) {
	var result = Math.round(num * Math.pow(10,dec)) / Math.pow(10,dec);
	return result;
}


function dumpToForm (string) {
	expDebug += string + "<br>";
	return expDebug;
}





function verifyRealCapID (asiFieldName,vModule,vtype,vSubType,vCategory,vMessage) {
	dumpToForm("asiFieldName.value: " + asiFieldName.value);
	if(asiFieldName.value != null && asiFieldName.value != "") {
		var capNum = asiFieldName.value;
		var capNumValid = false;
		var vCapResult = aa.cap.getCapID(capNum);
		if(vCapResult.getSuccess()) {
			vCapId = vCapResult.getOutput();
			vCapResult = aa.cap.getCap(vCapId);
			if(vCapResult.getSuccess()) {
				vCap = vCapResult.getOutput();
				appTypeResult = vCap.getCapType();
				appTypeString = appTypeResult.toString();
				appTypeArray = appTypeString.split('/');
				if((appTypeArray[0] == vModule || vModule == null) && (appTypeArray[1] == vtype || vtype == null) && (appTypeArray[2] == vSubType || vSubType == null) && (appTypeArray[3] == vCategory || vCategory == null))
					capNumValid = true;
			}
		}
		dumpToForm("capNumValid: " + capNumValid);
		if(!capNumValid) {
			if(vMessage == null) {
				asiFieldName.message = "Invalid permit number";
			}
			else {
				asiFieldName.message = vMessage;
			}
			asiFieldName.value = "";
			asiFieldName.required = true;
		} else {
			asiFieldName.message = "";
			asiFieldName.required = true;
		}
	}
}


//Condition = true to reveal, false to hide. 
function ShowHideFields (condition,ctlFields,reqWhenShowed) {
	var i;
	if(condition) {
		for(i in ctlFields) {
			ctlFields[i].hidden = false;
			if(reqWhenShowed) {
				ctlFields[i].required = true;
			}
		}
	} else {
		for(i in ctlFields) {
			ctlFields[i].hidden = true;
			ctlFields[i].value = "";
			if(reqWhenShowed) {
				ctlFields[i].required = false;
			}
		}
	}
	for(i in ctlFields) {
		expression.setReturn(ctlFields[i]);
	}
}




function ensureAtLeastOneSelected (ctlFields,asiform,message) {
	var i;
	var valueIsPopulated = false;
	var fieldToAllowEditing = "";
	for(i in ctlFields) {
		asiField = ctlFields[i].value;
		if(asiField != "" && asiField != null) {
			valueIsPopulated = true;
		}
	}
	if(!valueIsPopulated) {
		asiform.blockSubmit = true;
		asiform.message = message;
		expression.setReturn(asiform);
	}
}



function ensureOnlyOneSelected (ctlFields,messageToShow) {
	var i;
	var showingMessage = false;
	if(messageToShow != "") {
		showingMessage = true;

	}
	var moreThanOneValuePopulated = false;
	var fieldToDispalyMessage = "";
	var valueIsPopulated = false;
	var fieldToAllowEditing = "";
	for(i in ctlFields) {
		asiField = ctlFields[i].value;
		if(asiField == "CHECKED" && valueIsPopulated && !moreThanOneValuePopulated) {
			moreThanOneValuePopulated = true;
			dumpToForm(ctlFields[i].variableKey + " is trying to be checked, we're going to make everything else read only, moreThanOneValuePopulated: " + moreThanOneValuePopulated);
			fieldToDispalyMessage = ctlFields[i];
		}
		if(asiField == "CHECKED" && !valueIsPopulated) {
			dumpToForm(ctlFields[i].variableKey + " is checked, we're going to make everything else read only");
			fieldToAllowEditing = ctlFields[i];
			valueIsPopulated = true;
		}

	}
	dumpToForm("valueIsPopulated: " + valueIsPopulated);
	dumpToForm("fieldToAllowEditing: " + fieldToAllowEditing);
	// Loop Through Again
	for(i in ctlFields) {
		// First check - if we are just making fields read only (not showing message), proceed here. 
		if(valueIsPopulated && ctlFields[i] != fieldToAllowEditing && !showingMessage) {
			ctlFields[i].readOnly = true;
			ctlFields[i].value = "";
		}
		// Second check - if we are NOT making fields read only - just clearing value and showing message, we do that here. 
		if(valueIsPopulated && ctlFields[i] != fieldToAllowEditing && showingMessage) {
			ctlFields[i].value = "";
			// We only want to display message on ONE field.
			dumpToForm("fieldToDispalyMessage: " + fieldToDispalyMessage + " ctlFields[i]: " + ctlFields[i]);
			if(fieldToDispalyMessage == ctlFields[i]) {
				ctlFields[i].message = messageToShow;
			}
			else {
				ctlFields[i].message = "";
			}
		}
		if(!valueIsPopulated) {
			ctlFields[i].readOnly = false;
		}
	}
	for(i in ctlFields) {
		expression.setReturn(ctlFields[i]);
	}
}

function verifyWholeNumber (asiField,rounding) {
	if(String(asiField.value).indexOf(".") > -1 || (asiField.value != null && asiField.value != "" && Number(asiField.value) <= 0)) {
		if(!rounding || Number(asiField.value) <= 1) {
			asiField.value = "";
			asiField.message = "Value must be a whole number.";

		}
		else {
			asiField.value = Math.round(asiField.value);
		}
		expression.setReturn(asiField);
	}
	else {
		asiField.message = "";
		expression.setReturn(asiField);
	}
}

function masterExpression (script,portlet) {
	var msg = "";
	var message = "";
	var debug = "";
	var showDebug = false;
	var showMessage = false;
	var br = "<BR>";
	var useAppSpecificGroupName = false;
	var useProductScripts = true;
	var SCRIPT_VERSION = "3.2.2";
	var servProvCode = expression.getValue("$$servProvCode$$").value;
	var expressionName = expression.getExpressionName();

	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",servProvCode,true));
	eval(getScriptText("INCLUDES_CUSTOM",servProvCode,true));

	var returnMessage = "";

	var toPrecision = function(value) {
		var multiplier = 10000;
		return Math.round(value * multiplier) / multiplier;
	};

	function addDate (iDate,nDays) {
		if(isNaN(nDays)) {
			throw "Day is a invalid number!";
		}
		return expression.addDate(iDate,parseInt(nDays));
	}

	function logDebug (dstr) {

		var vLevel = "info";
		if(arguments.length == 2) {
			vLevel = arguments[1]; // debug level
		}
		var levelCSS = "infoMsg";
		if(vLevel.toUpperCase() == "INFO")
			levelCSS = "infoMsg";
		if(vLevel.toUpperCase() == "SUCCESS")
			levelCSS = "successMsg";
		if(vLevel.toUpperCase() == "WARNING")
			levelCSS = "warningMsg";
		if(vLevel.toUpperCase() == "ERROR")
			levelCSS = "errorMsg";
		var msgFormatted = "<div class=\"" + levelCSS + "\">" + dstr + "</div>";
		debug += msgFormatted;
	}

	function diffDate (iDate1,iDate2) {
		return expression.diffDate(iDate1,iDate2);
	}

	function parseDate (dateString) {
		return expression.parseDate(dateString);
	}

	function formatDate (dateString,pattern) {
		if(dateString == null || dateString == "") {
			return "";
		}
		return expression.formatDate(dateString,pattern);
	}

	function getParentByCapId (itemCap) {
		// returns the capId object of the parent.  Assumes only one parent!
		//
		getCapResult = aa.cap.getProjectParents(itemCap,1);
		if(getCapResult.getSuccess()) {
			parentArray = getCapResult.getOutput();
			if(parentArray.length)
				return parentArray[0].getCapID();
			else {
				logDebug("**WARNING: GetParent found no project parent for this application");
				return false;
			}
		} else {
			logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
			return false;
		}
	}

	var scriptCode = getScriptText(script,servProvCode,false);

	try {
		var cId1 = expression.getValue("$$capID1$$").value;
		var cId2 = expression.getValue("$$capID2$$").value;
		var cId3 = expression.getValue("$$capID3$$").value;

		var capId = aa.cap.getCapID(cId1,cId2,cId3);
		var parentCapId = null;

		if(capId.getOutput()) {
			capId = capId.getOutput();
			var cap = aa.cap.getCap(capId).getOutput();

			parentCapId = getParentByCapId(capId);

			var appTypeResult = cap.getCapType();
			var appTypeAlias = appTypeResult.getAlias();
			var appTypeString = appTypeResult.toString();
			var appTypeArray = appTypeString.split("/");

			var totalRowCount = expression.getTotalRowCount();

			//set variables
			var AInfo = [];
			loadAppSpecific(AInfo);
			loadASITables();

			CAPactualProdUnits = expression.getValue("CAP::capDetailModel*actualProdUnits");
			CAPaltId = expression.getValue("CAP::capModel*altID");
			CAPanonymousFlag = expression.getValue("CAP::capDetailModel*anonymousFlag");

			switch(portlet) {
				//Custom Fields and Custom Lists
				case "Custom Fields" || "Custom Lists":
					var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);
					var form = expression.getValue("ASI::FORM");

					if(appSpecInfoResult.getSuccess()) {
						appSpecInfoResult = appSpecInfoResult.getOutput();

						eval("CFS = [];");
						for(var b in appSpecInfoResult) {
							var groupName = String(appSpecInfoResult[b].getCheckboxType()).replace(/[^a-zA-Z0-9]+/g,"").toUpperCase();
							var varName = String(appSpecInfoResult[b].getCheckboxDesc()).replace(/[^a-zA-Z0-9]+/g,"").toLowerCase();
							var fullName = groupName +"_"+ varName;
							var currentField = expression.getValue("ASI::" + appSpecInfoResult[b].getCheckboxType() + "::" + appSpecInfoResult[b].getCheckboxDesc());
							var varString = "CFS[\"" + fullName + "\"] = currentField;";
							//expression.addMessage("adding : " + varString);
							eval(varString);
							//expression.addMessage("added");
						}
					}
					break;
			}
		}

		expression.addMessage(String(scriptCode).substr(0,30));
		if(scriptCode != "") {
			//expression.addMessage("GO");
			eval(scriptCode);
		} else {
			expression.addMessage("**WARNING** No script by the name of " + script + " can be found in the system.  Check the configuration of the expression called " + expressionName + "!");
		}
	} catch(e) {
		expression.addMessage("Error in expression: " + expressionName + "| Message: " + e.message + "| Line: " + e.lineNumber);
	}
}
