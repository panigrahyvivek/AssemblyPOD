	/*global QUnit*/

	sap.ui.define([
	    "sap/ui/test/opaQunit",
	    "sap/ui/test/Opa5",
	    "sap/dm/dme/i18n/i18nBundles"
	], function (opaTest, Opa5, Bundles) {
		"use strict";

	    var oBundle = Bundles.getAppBundle("assemblypod");

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

		QUnit.module("Navigation Journey");

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
            .iShouldSeeTheField("scanComponent");
        });

        opaTest("Select the breadcrumb to navigate back to main page", function (Given, When, Then) {

            When.onTheAssemblyPage
            .iPressTheBreadcrumbLink("headerBreadcrumb", 0);

            Then.onTheMainViewPage
            .iShouldSeeTheField("scanField");
        });

        opaTest("Enter text in SFC Scan field and navigate to the Assembly page for new SFC", function (Given, When, Then) {

            When.onTheMainViewPage
            .iChangeInputTo("scanField", "SFC2");
            
            Then.onTheAssemblyPage
            .iShouldSeeTheField("scanComponent");
        });

        opaTest("Select the breadcrumb to navigate back to main page", function (Given, When, Then) {

            When.onTheAssemblyPage
            .iPressTheBreadcrumbLink("headerBreadcrumb", 0);

            Then.onTheMainViewPage
            .iShouldSeeTheField("scanField");
        });

        opaTest("Enter text in SFC Scan field and show not found error", function (Given, When, Then) {

            When.onTheMainViewPage
            .iChangeInputTo("scanField", "SFCNOTFOUND");
            
            Then.onTheMainViewPage
            .iShouldSeeMessageToast();
        });

        opaTest("Enter text in SFC Scan field and show on hold error", function (Given, When, Then) {

            When.onTheMainViewPage
            .iChangeInputTo("scanField", "SFCONHOLD");
            
            Then.onTheMainViewPage
            .iShouldSeeMessageToast();
            
            When.onTheMainViewPage
            .and.iTeardownMyApp();
        });
	});