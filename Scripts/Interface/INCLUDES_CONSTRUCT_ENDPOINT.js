// INCLUDES_CONSTRUCT_ENDPOINT
// 
// This script is part of the EMSE Construct API Endpoint Framework
// See documentation <<TODO add information to find documentation>>
//
// prepare for common Request (req) and Response (resp) objects to be populated.
var req,resp ;
/**
 * EMSEEndPointRequest converts the payload of Construct EMSE API call to an Object for easy processing
 */
function EMSEEndPointRequest(){
    /**
     * EMSEEndPointRequest . construct - function to create variables from EMSE API Payload
     */
    this.construct = function(){
        try{
            /**
             * EMSEEndPointRequest . construct . atAtWalker - Nested utility function intended to be used in a recursive fashion to build a JSON from EMSE API Payload
             * @param {*} inObj 
             * @returns string
             */
            function atAtWalker(inObj){
                var rtnstr = '';
                if(inObj && inObj.getClass() && inObj.getClass() != null && inObj.getClass() == "class java.util.LinkedHashMap"){
                    rtnstr += '{';
                    var thisKeys = inObj.keySet();
                    thisKeys = thisKeys.toArray();
                    for(var ibn in thisKeys){
                        rtnstr += ('"'+thisKeys[ibn]+'" : ' + atAtWalker(  inObj.get(thisKeys[ibn]),"") +'' );
                        if(ibn < (thisKeys.length -1)){
                            rtnstr += ',';
                        }
                    }
                    rtnstr += '}';
                    return rtnstr;
                } else if(inObj && inObj.getClass() && inObj.getClass() != null && inObj.getClass() == "class java.util.ArrayList"){
                    var lnArr = inObj.toArray();
                    rtnstr += '[';
                    for(var uuu in lnArr){
                        rtnstr += (atAtWalker( lnArr[uuu],"") + "");
                        if(uuu < (lnArr.length -1 )){
                            rtnstr += ',';
                        }
                    }
                    rtnstr += ']';
                    return rtnstr;
                } else if(inObj.getClass() && inObj.getClass() != null && inObj.getClass() == "class java.lang.String"){
                        return '"'+inObj+'"';
                } else  if(inObj){
                    return inObj;
                } else {
                    return null;
                }
            }
            var io = aa.env.getParamValues();
            var zKeys = io.keySet();
            zkArr = zKeys.toArray();
            for(var eee in zkArr){
                if(io.get(zkArr[eee]) && io.get(zkArr[eee]) != null && io.get(zkArr[eee]).getClass() && io.get(zkArr[eee]).getClass() != null){
                    if(io.get(zkArr[eee]).getClass() == "class java.util.ArrayList" ){
                        eval(" this." + zkArr[eee] + " = JSON.parse(atAtWalker( io.get('"+zkArr[eee]+"') ));");
                    } else if(io.get(zkArr[eee]).getClass() == "class java.util.LinkedHashMap" ){
                        eval(" this." + zkArr[eee] + " = JSON.parse(atAtWalker( io.get('"+zkArr[eee]+"') ));");
                    } else if(io.get(zkArr[eee]).getClass() == "class java.lang.String" ){
                        eval(" this." + zkArr[eee] + " = \"\" + io.get('"+zkArr[eee]+"').toString();");
                    } else if(io.get(zkArr[eee]).getClass() == "class java.lang.Integer" ){
                        eval(" this." + zkArr[eee] + " = 0 + io.get('"+zkArr[eee]+"').intValue();");
                    } else if(io.get(zkArr[eee]).getClass() == "class java.lang.Double" ){
                        eval(" this." + zkArr[eee] + " = 0.0+ io.get('"+zkArr[eee]+"').doubleValue();");
                    } else if(io.get(zkArr[eee]).getClass() == "class java.lang.Boolean" ){
                        eval(" this." + zkArr[eee] + " = io.get('"+zkArr[eee]+"').booleanValue();");
                    } else {
                        eval(" this." + zkArr[eee] + " = io.get('"+zkArr[eee]+"');");
                    }
                } else {
                    eval(" this." + zkArr[eee] + " = io.get('"+zkArr[eee]+"');");
                }
            }
        } catch(ex){
            resp.fail("**ERROR : " + ex);
        }
    }
}


/**
 * EMSEEndPointResponse manages the response sent from Construct EMSE API call.
 */
function EMSEEndPointResponse(){
    this.messages = new Array();
    this.responseObj = new Object();
    this.returnCode = 0;
    this.responseName = "response";
    this.debug = "";
    this.showDebug = false;
    this.addMessage = function(inNew){
        if(typeof inNew != "string"){
            this.messages.push(inNew.toString());
        } else {
            this.messages.push(inNew);
        }
    };
    /**
     * EMSEEndPointResponse setResponseObj is a method for specifically setting the response object.
     * @param {*} inObj 
     */
    this.setResponseObj = function(inObj){
        this.responseObj = inObj;
    };
    /**
     * EMSEEndPointResponse setResponseName will set the key value for the object which will be the programatically-set portion of the response
     * @param {*} inRespName 
     */
    this.setResponseName = function(inRespName){
        this.responseName = inRespName;
    }
    /**
     * EMSEEndPointResponse add will add a name/value pair to the programatically-set portion of the response
     * @param {*} inName 
     * @param {*} inValue 
     */
    this.add = function(inName,inValue){
        this.responseObj[inName] = inValue;
    }
    /**
     * EMSEEndPointResponse respond sets the response body components for return
     */
    this.respond = function(){
        var ex = aa.env.getValue("EXCEPTION");
        if(ex && ex != null && ex != ""){
            this.responseObj = {};
        }
        aa.env.setValue(this.responseName, this.responseObj );
        aa.env.setValue("returnCode", this.returnCode);
        aa.env.setValue("messages",this.messages );
        if(this.showDebug){
            aa.env.setValue("debug",this.debug);
        }
    };
    /**
     * EMSEEndPointResponse fail is a convenience method which will ensure a response is returned that reflects a failure occurred during processing
     * @param {*} inNew 
     */
    this.fail = function(inNew){
        if(!inNew || inNew == ""){inNew = "UNKNOWN EXCEPTION"}
        this.messages = new Array();
        this.responseObj = new Object();
        this.responseName = "";
        this.addMessage(inNew);
        this.returnCode = -1 ;
        aa.env.setValue("EXCEPTION",inNew);
        this.respond();
    };

}
// instantiate the Response and Request. Construct the Request variables which represend the Request Body
resp = new EMSEEndPointResponse();
req = new EMSEEndPointRequest();
req.construct();
