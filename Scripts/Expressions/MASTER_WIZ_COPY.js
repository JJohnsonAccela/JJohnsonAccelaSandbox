if(parentCapId && appMatch("Building/Wizard/NA/NA",parentCapId)) {
	logDebug("parent of: " + parentCapId);

	var PAInfo = [];
	loadAppSpecific(PAInfo,parentCapId);

	for(var v in PAInfo) {
		var matchLabel = String(v).replace(/[^a-zA-Z0-9]+/g,"").toLowerCase();
		logDebug("match-" + matchLabel);
		for(var fv in CFS) {
			var label = String(fv);
			logDebug("label-" + label);
			logDebug("check-" + label.substring(15));
			if(label.indexOf("RESIDENTIALONLY") > -1 && label.substring(16).equals(matchLabel)) {
				CFS[fv].value = PAInfo[v];
				expression.setReturn(CFS[fv]);
				logDebug("value-" + CFS[fv].value);
				break;
			} else if(label.indexOf("COMMERCIALONLY") > -1 && label.substring(15).equals(matchLabel)) {
				CFS[fv].value = PAINfo[v];
				expression.setReturn(CFS[fv]);
				logDebug("value-" + CFS[fv].value);
				break;
			}
		}
	}

	for(var l in CFS) {
		if((String(l).indexOf("RESIDENTIALONLY") > -1 || String(l).indexOf("COMMERCIALONLY") > -1)) {
			if(CFS[l].value != null || !CFS[l].value.equals("")) {
				CFS[l].hidden = false;
				expression.setReturn(CFS[l]);
			} else {
				CFS[l].hidden = true;
				expression.setReturn(CFS[l]);
			}
		}
		logDebug(l + " hidden?" + CFS[l].hidden);
	}
}