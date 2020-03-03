/*global QUnit*/
sap.ui.define([
	"sap/custom/assemblypod/util/formatter",
], function (Formatter) {
	"use strict";

    var sandbox = sinon.createSandbox();

    QUnit.module("Formatter tests", {
    });

    QUnit.test("getStatusHighlight: test return values", function (assert) {        
        var sSuccess = Formatter.getStatusHighlight(0);
        var sWarning = Formatter.getStatusHighlight(2);
        
        assert.equal(sSuccess, "Success", "Result is success");
        assert.equal(sWarning, "Warning", "Result is Warning");
    });
    
    QUnit.test("getActionButtonState: test return values", function (assert) {        
        var bEnabled = Formatter.getActionButtonState(0);
        var bDisabled = Formatter.getActionButtonState(2);
        
        assert.equal(bEnabled, true, "Button Enabled");
        assert.equal(bDisabled, false, "Button Disabled");
    });

    QUnit.test("getDescriptionFormat: test setting description with no Unit of Measure", function (assert) {
    	var sMaterial = "MATERIAL1";
    	var sVersion = "A";
    	var iRequiredQty = 1;
    	var iRemainingQty = 2;
    	var sUnitOfMeasure = null;
    	
        var sResult = Formatter.getDescriptionFormat(sMaterial, sVersion, iRequiredQty, iRemainingQty, sUnitOfMeasure);
        var sExpected = sMaterial + "/" + sVersion + "\r\n" + iRequiredQty + " | " + iRemainingQty;
        
        assert.equal(sResult, sExpected, "Format for the description is correct, with no Unit of Measure.");
    });
    
    QUnit.test("getDescriptionFormat: test setting description with Unit of Measure", function (assert) {
    	var sMaterial = "MATERIAL1";
    	var sVersion = "A";
    	var iRequiredQty = 1;
    	var iRemainingQty = 2;
    	var sUnitOfMeasure = "EA";
    	
        var sResult = Formatter.getDescriptionFormat(sMaterial, sVersion, iRequiredQty, iRemainingQty, sUnitOfMeasure);
        var sExpected = sMaterial + "/" + sVersion + "\r\n" + iRequiredQty + " " + sUnitOfMeasure + " | " + iRemainingQty + " " + sUnitOfMeasure;
        
        assert.equal(sResult, sExpected, "Format for the description is correct, with Unit of Measure.");
    });

});
