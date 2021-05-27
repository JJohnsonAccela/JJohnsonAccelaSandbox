/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ZONING_PAGEFLOW_SKIP_RESPONSIBLE_PARTY.js
| Event   : Pageflow onload
|
| Usage   : 
|
| Client  : N/A
| Action# : N/A
|
| Notes   : JJOHNSON 05/09/2019
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var controlString = "ACAOnLoad"
var preExecute = "PreExecuteForAfterEvents"				// Standard choice to execute first (for globals, etc)
var documentOnly = false;								// Document Only -- displays hierarchy of std choice steps
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Paramters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 9.0;
var useCustomScriptFile = true;  // if true, use Events -> Custom Script and Master Scripts, else use Events -> Scripts -> INCLUDES_*
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I")
{
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess())
	{
		SAScript = bzr.getOutput().getDescription();
	}
}
var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) 
{
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr3 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "USE_MASTER_INCLUDES");
	if (bvr3.getSuccess()) {if(bvr3.getOutput().getDescription() == "No") useCustomScriptFile = false}; 
}
if (SA) 
{
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS_ACA", SA, useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS_ACA", SA, useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
}
else
{
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS_ACA", null, false));
}
eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

if (documentOnly) 
{
	doStandardChoiceActions(controlString, false, 0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}
var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", controlString);
function getScriptText(vScriptName, servProvCode, useProductScripts) 
{
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) 
		{
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} 
		else 
		{
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} 
	catch (err) 
	{
		return "";
	}
}
function getPageComponents(capID, stepIndex, pageIndex)
{
	var componentResult = aa.acaPageFlow.getPageComponents(capID, stepIndex, pageIndex);
	if(componentResult.getSuccess())
	{
		return componentResult.getOutput();
	}
	return null;	
}
/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
var componentNames = new Array("Contact 1","ASI Table","Parcel","Licensed Professional","Detail Information", 
"Owner", "Address", "Contact List", "Contact 2", "Contact 3","Valuation Calculator", 
"Licensed Professional List","Continuing Education","ASI","Assets","Additional Information",
"Education","Applicant","Examination","Attachment");

var componentAliasNames = new Array("Contact1","AppSpecTable","Parcel","License","DetailInfo", 
"Owner", "WorkLocation", "MultiContacts", "Contact2", "Contact3","ValuationCalculator", 
"MultiLicenses","ContinuingEducation","AppSpec","Assets","Description",
"Education","Applicant","Examination","Attachment");

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
if (preExecute.length) doStandardChoiceActions(preExecute, true, 0);//run Pre-execution code
logGlobals(AInfo);
/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
|
/-----------------------------------------------------------------------------------------------------*/
try {
	var components = getPageComponents(capId, 1, 2);
	if(components != null && components.length > 0)
	{
		for(var i = 0; i < components.length; i++)
		{
			am.explore(components[i]);
		}
	}
	/*
//  Get the Standard choices entry we'll use for this App type
//  Then, get the action/criteria pairs for this app
if (doStdChoices)
{
	doStandardChoiceActions(controlString, true, 0);
}
//  Next, execute and scripts that are associated to the record type
if (doScripts)
{
	doScriptActions();
}
// Check for invoicing of fees
if (feeSeqList.length)
{
	invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
	if (invoiceResult.getSuccess())
		logMessage("Invoicing assessed fee items is successful.");
	else
		logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
}
*/
	
} catch (err) {
	handleError(err,"ACAOnLoadMaster in Logic");
}
/*------------------------------------------------------------------------------------------------------/
|
/-----------------------------------------------------------------------------------------------------*/
try {if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
	throw debug;
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}
} catch (err){
	handleError(err, "ACAOnLoadMaster in Base");
}