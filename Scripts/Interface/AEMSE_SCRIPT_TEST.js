function inspect(objExplore) {
    for (var x in objExplore) {
        if (typeof (objExplore[x]) !== "function") {
            aa.env.paramValues.put(x, objExplore[x]);
        }
    }
}

var emse = com.accela.aa.client.cfm.EMSEClient.getEMSEClient().getOutput();
var hashResult = aa.util.newHashtable();

var inspectFunctionText = inspect.toString();

var script = aa.env.paramValues.get("scriptText");
script = inspectFunctionText + "\r\n" + script;

var result = emse.testScript(script, aa.serviceProviderCode,null,"ADMIN",true,"Use User Transaction");

if (result.getSuccess()) {
    aa.env.paramValues.put("ScriptResult", result.getOutput());
    aa.env.paramValues.put("ScriptSuccess",true);
}
else {
    aa.env.paramValues.put("ScriptResult", result.getOutput());
    aa.env.paramValues.put("ScriptSuccess",false);
}