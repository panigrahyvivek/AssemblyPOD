/*global QUnit*/
sap.ui.define([
	"sap/custom/assemblypod/util/RequestProcessor",
    "sap/custom/assemblypod/test/unit/UnitTestUtil"
], function (RequestProcessor, UnitTestUtil) {
	"use strict";

    var sandbox = sinon.createSandbox();

    QUnit.module("RequestProcessor tests", {
        beforeEach: function () {
            var oOwner = UnitTestUtil.getOwnerComponent();
            var oApplicationUtil = {
                getOwnerComponent: function() {
                    return oOwner;
                },
                getI18nText: function() {
                    return "NONE";
                }
            }
            this.oRequestProcessor = new RequestProcessor(oApplicationUtil);
        },
        afterEach: function () {
            this.oRequestProcessor = null;
            sandbox.restore();
        }
    });

    QUnit.test("getAinDataSourceUri: test getting plant odata datasource", function (assert) {
        var sUri = this.oRequestProcessor.getAinDataSourceUri();
        assert.equal(sUri, UnitTestUtil.TEST_URI, "getAinDataSourceUri() returned correct uri");
    });

    QUnit.test("getAinRestDataSourceUri: test getting plant rest datasource", function (assert) {
        var sUri = this.oRequestProcessor.getAinRestDataSourceUri();
        assert.equal(sUri, UnitTestUtil.TEST_URI, "getAinRestDataSourceUri() returned correct uri");
    });

    QUnit.test("getProductionRestDataSourceUri: test getting Production rest datasource", function (assert) {
        var sUri = this.oRequestProcessor.getProductionRestDataSourceUri();
        assert.equal(sUri, UnitTestUtil.TEST_URI, "getProductionRestDataSourceUri() returned correct uri");
    });

    QUnit.test("getAssemblyRestDataSourceUri: test getting Assembly rest datasource", function (assert) {
        var sUri = this.oRequestProcessor.getAssemblyRestDataSourceUri();
        assert.equal(sUri, UnitTestUtil.TEST_URI, "getAssemblyRestDataSourceUri() returned correct uri");
    });

    QUnit.test("getPublicApiRestDataSourceUri: test getting Public API rest datasource", function (assert) {
        var sUri = this.oRequestProcessor.getPublicApiRestDataSourceUri();
        assert.equal(sUri, UnitTestUtil.TEST_URI, "getPublicApiRestDataSourceUri() returned correct uri");
    });

    QUnit.test("getSfcRequestData: Test getting the request URL", function (assert) {
        
        var oData = this.oRequestProcessor.getSfcRequestData("P1", "SFC1");

        assert.ok(oData.url.length > 0, "URL successfully returned");
    });

    QUnit.test("sfcResponseMapper: tests getting the SFC data from the response", function (assert) {

        var oSfcData = UnitTestUtil.getSfcResponseData(false, "401", "NEW");
        oSfcData.steps[0].quantityInQueue = 1.0;
        oSfcData.steps[0].quantityInWork = 0.0;

        var oResponse = this.oRequestProcessor.sfcResponseMapper(oSfcData);

        assert.equal(oResponse.sfc, "SFC1", "Correct response found");
        assert.equal(oResponse.materialAndVersion, "LIGHTBULB/A", "Correct material found");
        assert.equal(oResponse.stepStatus, "IN_QUEUE", "Correct status found");
    });

    QUnit.test("_findCurrentStepData: tests getting the current step to use", function (assert) {

        var oSfcData = UnitTestUtil.getSfcResponseData(false, "401", "NEW");
        oSfcData.steps[0].quantityInQueue = 1.0;
        oSfcData.steps[0].quantityInWork = 0.0;
        var oStepData = this.oRequestProcessor._findCurrentStepData(oSfcData);
        assert.deepEqual(oStepData.step, oSfcData.steps[0], "Correct step returned");
        assert.equal(oStepData.status, "IN_QUEUE", "Correct status found");
        
        oSfcData = UnitTestUtil.getSfcResponseData(false, "402", "INQUEUE");
        oSfcData.steps[0].quantityInQueue = 1.0;
        oSfcData.steps[0].quantityInWork = 0.0;
        oStepData = this.oRequestProcessor._findCurrentStepData(oSfcData);
        assert.deepEqual(oStepData.step, oSfcData.steps[0], "Correct step returned");
        assert.equal(oStepData.status, "IN_QUEUE", "Correct status found");
        
        oSfcData = UnitTestUtil.getSfcResponseData(false, "403", "ACTIVE");
        oSfcData.steps[0].quantityInQueue = 0.0;
        oSfcData.steps[0].quantityInWork = 1.0;
        oStepData = this.oRequestProcessor._findCurrentStepData(oSfcData);
        assert.deepEqual(oStepData.step, oSfcData.steps[0], "Correct step returned");
        assert.equal(oStepData.status, "IN_WORK", "Correct status found");
        
        oSfcData = UnitTestUtil.getSfcResponseData(false, "401", "NEW");
        oSfcData.steps[0].quantityInQueue = 0.0;
        oSfcData.steps[0].quantityInWork = 0.0;
        oStepData = this.oRequestProcessor._findCurrentStepData(oSfcData);
        assert.notOk(oStepData, "Step not found");
        
        oSfcData = UnitTestUtil.getSfcResponseData(false, "402", "INQUEUE");
        oSfcData.steps[0].quantityInQueue = 0.0;
        oSfcData.steps[0].quantityInWork = 0.0;
        oStepData = this.oRequestProcessor._findCurrentStepData(oSfcData);
        assert.notOk(oStepData, "Step not found");
        
        oSfcData = UnitTestUtil.getSfcResponseData(false, "403", "ACTIVE");
        oSfcData.steps[0].quantityInQueue = 0.0;
        oSfcData.steps[0].quantityInWork = 0.0;
        oStepData = this.oRequestProcessor._findCurrentStepData(oSfcData);
        assert.notOk(oStepData, "Step not found");
        
    });

    QUnit.test("getComponentsRequestData: retrieving SFC components request data", function (assert) {
        
        var oData = this.oRequestProcessor.getComponentsRequestData("P1", "SFC1", "OPER1");

        assert.ok(oData.url.length > 0, "URL successfully returned");
        assert.ok(oData.parameters, "Parameters successfully returned");
    });

    QUnit.test("componentsResponseMapper: tests getting components data from the response", function (assert) {

        var oComponentsData = UnitTestUtil.getSfcComponentsResponseData();

        var oResponse = this.oRequestProcessor.componentsResponseMapper(oComponentsData);

        assert.ok(oResponse, "Response returned");
        assert.equal(oResponse.length, 2, "Correct number of components returned");
    });

    QUnit.test("getAssembledComponentsRequestData: tests getting request data for assembled component", function (assert) {
        
        var oData = this.oRequestProcessor.getAssembledComponentsRequestData("P1", "SFC1", "10", "OPER1");

        assert.ok(oData.url.length > 0, "URL successfully returned");
        assert.ok(oData.parameters, "Parameters successfully returned");
    });

    QUnit.test("assembledComponentsResponseMapper: tests getting assembled components data from the response", function (assert) {

        var oAssembledData = UnitTestUtil.getAssembledComponentsResponseData();

        var aResponse = this.oRequestProcessor.assembledComponentsResponseMapper(oAssembledData);

        assert.ok(aResponse, "Response returned");
        assert.equal(aResponse.length, 1, "Correct number of components returned");
        assert.equal(aResponse[0].dataFields.length, 4, "Correct number of data fields returned");
    });

    QUnit.test("addComponentRequestData: tests adding component to assembly", function (assert) {

        var oRequestData = {
            resource: "RES1",
            sfc: "SFC1",
            operation: "OPER1",
            component: "BRACKET",
            componentVersion: "A",
            quantity: 1.0,
            dataFields: [{"fieldName": "INV_SFC", "value": "XYZ"}]
        };
        
        var oExpectedParameters = {
            "plant": "P1",
            "operationActivity": oRequestData.operation,
            "resource": oRequestData.resource,
            "sfc": oRequestData.sfc,
            "component": oRequestData.component,
            "componentVersion": oRequestData.componentVersion,
            "quantity": oRequestData.quantity,
            "dataFields": oRequestData.dataFields
                
        };

        var oData = this.oRequestProcessor.addComponentRequestData("P1", oRequestData);

        assert.ok(oData.url.length > 0, "URL successfully returned");
        assert.deepEqual(oData.parameters, oExpectedParameters, "Parameters successfully returned");
    });

    QUnit.test("addComponentsResponseMapper: tests returning response from assembling component", function (assert) {

        var oResponse = this.oRequestProcessor.addComponentsResponseMapper({responseData: "response value"});

        assert.ok(oResponse, "Response returned");
        assert.equal(oResponse.responseData, "response value", "mapped response is correct");
    });
    
    QUnit.test("removeComponentRequestData: tests removing component from assembly", function (assert) {

        var oRequestData = {
            resource: "RES1",
            sfc: "SFC1",
            operation: "OPER1",
            component: "BRACKET",
            componentVersion: "A",
            quantity: 1.0
        };
        
        var oExpectedParameters = {
            "plant": "P1",
            "operationActivity": oRequestData.operation,
            "resource": oRequestData.resource,
            "sfc": oRequestData.sfc,
            "component": oRequestData.component,
            "componentVersion": oRequestData.componentVersion,
            "quantity": oRequestData.quantity
                
        };

        var oData = this.oRequestProcessor.removeComponentRequestData("P1", oRequestData);

        assert.ok(oData.url.length > 0, "URL successfully returned");
        assert.deepEqual(oData.parameters, oExpectedParameters, "Parameters successfully returned");
    });

    QUnit.test("removeComponentResponseMapper: tests returning response from removing component", function (assert) {

        var oResponse = this.oRequestProcessor.removeComponentResponseMapper({responseData: "response value"});

        assert.ok(oResponse, "Response returned");
        assert.equal(oResponse.responseData, "response value", "mapped response is correct");
    });

    QUnit.test("getStartSfcRequestData: tests getting start sfc request data", function (assert) {
        
        var oData = this.oRequestProcessor.getStartSfcRequestData("P1", "SFC1", "OPER1", "RES1", 1.0);

        assert.ok(oData.url.length > 0, "URL successfully returned");
        assert.equal(oData.parameters.plant, "P1", "Plant parameter set");
        assert.equal(oData.parameters.sfcs[0], "SFC1", "SFC parameters set");
        assert.equal(oData.parameters.operation, "OPER1", "Operation parameters set");
        assert.equal(oData.parameters.resource, "RES1", "Resource parameters set");
        assert.equal(oData.parameters.quantity, 1.0, "Quantity parameters set");
    });

    QUnit.test("startSfcResponseMapper: tests getting the Start SFC data from the response", function (assert) {
        var oResults = {"sfc": "SFC1"};
        
        var oResponse = this.oRequestProcessor.startSfcResponseMapper(oResults);

        assert.deepEqual(oResponse, oResults, "Correct response mapped");
    });

    QUnit.test("getCompleteSfcRequestData: tests getting complete sfc request data", function (assert) {
        
        var oData = this.oRequestProcessor.getCompleteSfcRequestData("P1", "SFC1", "OPER1", "RES1", 1.0);

        assert.ok(oData.url.length > 0, "URL successfully returned");
        assert.equal(oData.parameters.plant, "P1", "Plant parameter set");
        assert.equal(oData.parameters.sfcs[0], "SFC1", "SFC parameters set");
        assert.equal(oData.parameters.operation, "OPER1", "Operation parameters set");
        assert.equal(oData.parameters.resource, "RES1", "Resource parameters set");
        assert.equal(oData.parameters.quantity, 1.0, "Quantity parameters set");
    });

    QUnit.test("completeSfcResponseMapper: tests getting the Complete SFC data from the response", function (assert) {
        var oResults = {"sfc": "SFC1"};
        
        var oResponse = this.oRequestProcessor.completeSfcResponseMapper(oResults);

        assert.deepEqual(oResponse, oResults, "Correct response mapped");
    });

    QUnit.test("getMaterialFileIdRequestUrl: tests getting url to get Materials default file id", function (assert) {
        
        var oData = this.oRequestProcessor.getMaterialFileIdRequestData("P1", "ITEM1", "A");

        assert.ok(oData.url.length > 0, "URL successfully returned");
    });
    
    QUnit.test("materialFileIdResponseMapper: tests getting Materials default file id from response", function (assert) {
        var oMaterialData = UnitTestUtil.getMaterialFileAttachmentsResponseData();
        var sFileId = this.oRequestProcessor.materialFileIdResponseMapper(oMaterialData);

        assert.equal(sFileId, "FC6832F039F94F3186F0814D9B689ED3", "Correct file id returned");
    });
    
    QUnit.test("getMaterialFileImageUrl: tests retrieving Materials image URL successfully", function (assert) {
        
        var sUrl = this.oRequestProcessor.getMaterialFileImageUrl("FC6832F039F94F3186F0814D9B689ED3");

        assert.ok(sUrl.length > 0, "URL successfully returned");
    });
    
    QUnit.test("materialFileImageResponseMapper: tests getting Materials image URI from response", function (assert) {
        
        var oMaterialImageData = UnitTestUtil.getMaterialFileImageResponseData();
        var sImageFileUri = this.oRequestProcessor.materialFileImageResponseMapper("FC6832F039F94F3186F0814D9B689ED3", oMaterialImageData);

        assert.ok(sImageFileUri.length > 0, "Image File URI successfully returned");
    });

});
