	/*global QUnit*/

	sap.ui.define([
	    "sap/ui/test/opaQunit",
	    "sap/ui/test/Opa5",
	    "sap/ui/core/ValueState"
	], function (opaTest, Opa5, ValueState) {
		"use strict";
		
		var BARCODE_VALUE1 = "[)>06{GS}11ZBarcode 1{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";
        var BARCODE_VALUE2 = "[)>06{GS}11ZBarcode 2{GS}19PCOMP2{GS}26PPART_0001{GS}T002-001_LOT{GS}15S2345-6789-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";
        var BARCODE_VALUE3 = "[)>06{GS}11ZBarcode 3{GS}19PCOMP3{GS}26PPART_0001{GS}T002-001_LOT{GS}15S3456-7890-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";
        var BARCODE_NOTFOUND = "[)>06{GS}11ZBarcode NF{GS}19PCOMPXXX{GS}26PPART_0001{GS}T002-001_LOT{GS}15S3456-7890-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";
        var BARCODE_NOTCOMPONENT = "NOTBARCODE";
       
        
	    function launchAssemblyPod (sWorkCenter, sResource, sPlant, Given) {
	        // Add pod id as defined above
	        Opa5.extendConfig({
	            appParams: {
	                "WORK_CENTER": sWorkCenter,
	                "RESOURCE": sResource,
	                "PLANT": sPlant
	            }
	        });
	        
	        Given.iStartTheApp({
	            componentConfig: {
	                name: "sap.custom.assemblypod"
	            }
	        });
	    }

		QUnit.module("Assembly Journey");

		opaTest("Should see the initial page of the app", function (Given, When, Then) {
		    
		    launchAssemblyPod ("WC1", "RES1", "P1", Given);

            Then.onTheMainViewPage
            .iShouldSeeTheField("scanField")
            .and.iShouldSeeTextValue("workCenterValueField", "WC1")
            .and.iShouldSeeTextValue("resourceValueField", "RES1")
            .and.iShouldSeeTextValue("plantValueField", "P1");
		});

        opaTest("Enter text in SFC Scan field and navigate to the Assembly page for started SFC", function (Given, When, Then) {

            When.onTheMainViewPage
            .iChangeInputTo("scanField", "SFC1");
            
            Then.onTheAssemblyPage
            .iShouldSeeTheField("scanComponent")
            .and.theControlIsEnabled("completeButton", false);
        });

        opaTest("Enter invalid barcode value into component scanfield", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_NOTCOMPONENT);

            Then.onTheAssemblyPage
            .iShouldSeeMessageToast();
        });

        opaTest("Enter barcode value into component scanfield that is not available at the operation", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_NOTFOUND);

            Then.onTheAssemblyPage
            .iShouldSeeMessageToast();
        });

        opaTest("Enter 1st barcode value into component scanfield", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_VALUE1);

            Then.onTheAssemblyPage
            .theTableListItemHasHighlightWithValue("componentTable", 1, ValueState.Success)
            .and.theControlIsEnabled("completeButton", false);
        });

        opaTest("Enter 1st barcode value again into component scanfield and see message", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_VALUE1);

            Then.onTheAssemblyPage
            .iShouldSeeMessageToast();
        });

        opaTest("Enter 2nd barcode value into component scanfield", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_VALUE2);

            Then.onTheAssemblyPage
            .theTableListItemHasHighlightWithValue("componentTable", 2, ValueState.Success)
            .and.theControlIsEnabled("completeButton", false);
        });

        opaTest("Enter 3rd barcode value into component scanfield and cancel complete", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_VALUE3);

            Then.onTheAssemblyPage
            .iShouldSeeADialog("Confirm dialog displayed");
     
            When.onTheAssemblyPage
            .iPressOnButtonInConfirmDialog("cancelButton");

            Then.onTheAssemblyPage
            .theTableListItemHasHighlightWithValue("componentTable", 3, ValueState.Success)
            .and.theControlIsEnabled("completeButton", true);
        });

        opaTest("Remove last component", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iPressOnTheComponentRemoveButton("componentTable", 3, 3);

            Then.onTheAssemblyPage
            .theTableListItemHasHighlightWithValue("componentTable", 3, ValueState.Warning)
            .and.theControlIsEnabled("completeButton", false);
        });

        opaTest("Enter 3rd barcode value into component scanfield and confirm complete", function (Given, When, Then) {
            When.onTheAssemblyPage
            .iEnterBarcodeValue("scanComponent", BARCODE_VALUE3);
            Then.onTheAssemblyPage
            .iShouldSeeADialog("Confirm dialog displayed");
     
            When.onTheAssemblyPage
            .iPressOnButtonInConfirmDialog("confirmButton");

            Then.onTheMainViewPage
            .iShouldSeeTheField("scanField")
            .and.iTeardownMyApp();
        });
	});