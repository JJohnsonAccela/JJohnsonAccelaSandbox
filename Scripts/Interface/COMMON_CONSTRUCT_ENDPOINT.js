// COMMON_CONSTRUCT_ENDPOINT
//
// This script is part of the EMSE Construct API Endpoint Framework
//
// It requires the presense of the script INCLUDES_CONSTRUCT_ENDPOINT in the environment.
// See documentation <<TODO add information to find documentation>>

/*------------------------------------------------------------------------------------------------------/
| Common functions, scripts, variables BEGIN
/------------------------------------------------------------------------------------------------------*/

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();    
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
} 
var currentUserID = aa.getAuditID();
if(!currentUserID){
    currentUserID = "ADMIN";
}
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var capId = null;
var showDebug = false;
var debug = "";
var br = "<br/>";
var sysDate = aa.date.getCurrentDate();
var useAppSpecificGroupName = false;
var enableLogging = aa.env.getValue("enableLogging");
try {        
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
    eval(getScriptText("INCLUDES_CUSTOM", null, true));  
    eval(getScriptText("INCLUDES_CONSTRUCT_ENDPOINT", null, false)); /// ~~ EMSE ENDPOINT INCLUDES SCRIPT ~~
} catch(err0) {
    resp.addMessage("**ERROR: " + err0.message);
}

if(typeof capId == 'undefined'){capId = null;}
if(typeof cap == 'undefined'){cap = null;}
if(typeof capIDString == 'undefined'){capIDString = "";}
if(typeof appTypeResult == 'undefined'){appTypeResult = null;}
if(typeof appTypeString == 'undefined'){appTypeString = "";}
if(typeof appTypeArray == 'undefined'){appTypeArray = new Array();}
if(typeof capName == 'undefined'){capName = null;}
if(typeof capStatus == 'undefined'){capStatus = null;}
if(typeof fileDateObj == 'undefined'){fileDateObj = null;}
if(typeof fileDate == 'undefined'){fileDate = null;}
if(typeof fileDateYYYYMMDD == 'undefined'){fileDateYYYYMMDD = null;}
if(typeof parcelArea == 'undefined'){parcelArea = 0;}
if(typeof estValue == 'undefined'){estValue = 0;}
if(typeof calcValue == 'undefined'){calcValue = 0;}
if(typeof houseCount == 'undefined'){houseCount = 0;}
if(typeof feesInvoicedTotal == 'undefined'){feesInvoicedTotal = 0;}
if(typeof balanceDue == 'undefined'){balanceDue = 0;}
if(typeof houseCount == 'undefined'){houseCount = 0;}
if(typeof feesInvoicedTotal == 'undefined'){feesInvoicedTotal = 0;}
if(typeof capDetail == 'undefined'){capDetail = "";}
if(typeof AInfo == 'undefined'){AInfo = new Array();}
if(typeof partialCap == 'undefined'){partialCap = false;}
if(typeof feeFactor == 'undefined'){feeFactor = "";}
if(typeof parentCapId == 'undefined'){parentCapId = null;}

function loadCapId(itemCap){
    capId = itemCap;
    if(capId != null){
		servProvCode = capId.getServiceProviderCode();
		capIDString = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		if(appTypeArray[0].substr(0,1) !="_") 
    	{
			var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
			if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
		}
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		partialCap = !cap.isCompleteCap();
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	
		if (valobj.length) {
			estValue = valobj[0].getEstimatedValue();
			calcValue = valobj[0].getCalculatedValue();
			feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
		}
		
		var capDetailObjResult = aa.cap.getCapDetail(capId);		
		if (capDetailObjResult.getSuccess())
		{
			capDetail = capDetailObjResult.getOutput();
			var houseCount = capDetail.getHouseCount();
			var feesInvoicedTotal = capDetail.getTotalFee();
			var balanceDue = capDetail.getBalance();
		}
		loadAppSpecific(AInfo); 						
		loadTaskSpecific(AInfo);						
		loadParcelAttributes(AInfo);					
		loadASITables();
	
		var parentCapString = "" + aa.env.getValue("ParentCapID");
		if (parentCapString.length > 0) { parentArray = parentCapString.split("-"); parentCapId = aa.cap.getCapID(parentArray[0], parentArray[1], parentArray[2]).getOutput(); }
		if (!parentCapId) { parentCapId = getParent(); }
		if (!parentCapId) { parentCapId = getParentLicenseCapID(capId); }
		
		logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
		logDebug("capId = " + capId.getClass());
		logDebug("cap = " + cap.getClass());
		logDebug("currentUserID = " + currentUserID);
		logDebug("currentUserGroup = " + currentUserGroup);
		logDebug("systemUserObj = " + systemUserObj.getClass());
		logDebug("appTypeString = " + appTypeString);
		logDebug("capName = " + capName);
		logDebug("capStatus = " + capStatus);
		logDebug("fileDate = " + fileDate);
		logDebug("fileDateYYYYMMDD = " + fileDateYYYYMMDD);
		logDebug("sysDate = " + sysDate.getClass());
		logDebug("parcelArea = " + parcelArea);
		logDebug("estValue = " + estValue);
		logDebug("calcValue = " + calcValue);
		logDebug("feeFactor = " + feeFactor);
		
		logDebug("houseCount = " + houseCount);
		logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
		logDebug("balanceDue = " + balanceDue);
        if (parentCapId) logDebug("parentCapId = " + parentCapId.getCustomID());
        
        logGlobals(AInfo);
    }
}
/*------------------------------------------------------------------------------------------------------/
| Common functions, scripts, variables END
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| Execute requested EMSE Script
/------------------------------------------------------------------------------------------------------*/

try {
    var ex = aa.env.getValue("EXCEPTION");
    if(ex && ex != null && ex != ""){
        resp.addMessage("Error encountered before execution of COMMON_CONSTRUCT_ENDPOINT");
    } else {
        if (!req.execute_script) {
            throw "Missing Required Parameter: execute_script";
        }
        // Attempt to prep Single Record request - BEGIN


        // If we have value(s) the requestor is attmpting to pass a single recordId
        // PS10-REC20-00000-0002C << 4-part. perhaps from "id" of record search call
        // REC20-00000-0002C << 3-part 
        //
        // if BOTH are present req.capId will be win and req.permitId[x] will not be evalueated.
        if(req.capId){
            var thisRecId = req.capId;
            var thisRecId = thisRecId.split("-");
            var pt1,pt2,pt3;
            if(thisRecId && thisRecId.length == 4){
                pt1=thisRecId[1];
                pt2=thisRecId[2];
                pt3=thisRecId[3];
            } else if(thisRecId && thisRecId.length == 3){
                pt1=thisRecId[0];
                pt2=thisRecId[1];
                pt3=thisRecId[2];
            }
            if(typeof pt1 == "undefined" || typeof pt2 == "undefined" || typeof pt3 == "undefined"){
                throw("Request included 'capId' but the value passed (" + req.capId +") is not formatted properly. Shold be 3-part record id seperated by '-' ");
            }
            var itemCap = aa.cap.getCapID(pt1,pt2,pt3);
            if (itemCap.getSuccess()){
                itemCap = itemCap.getOutput();
                loadCapId(itemCap);
            } else {
                throw("There is no record in the system with id " + req.capId);
            }
        } else if(req.permitId1 && req.permitId2 && req.permitId3){
            var itemCapx = aa.cap.getCapID(req.permitId1,req.permitId2,req.permitId3);
            if (itemCapx.getSuccess()){
                itemCapx = itemCapx.getOutput();
                loadCapId(itemCapx);
            } else {
                throw("There is no record in the system with id " + req.permitId1+"-"+req.permitId2+"-"+req.permitId3);
            }
        }
        // Attempt to prep Single Record request - END
        var reqScriptBody = getScriptText(req.execute_script, null, false);
        if (!reqScriptBody || reqScriptBody.length == 0) {
            throw "MISSING or EMPTY script with name: " + req.execute_script;
        }
        resp.setResponseName(req.execute_script);
        eval(reqScriptBody);
    }
    
} catch (ex) {
    resp.fail("**ERROR : "+ex);
}
if(showDebug){
    resp.showDebug = true;
    debug = debug.split(br);
    resp.debug = debug;
}
resp.respond();
