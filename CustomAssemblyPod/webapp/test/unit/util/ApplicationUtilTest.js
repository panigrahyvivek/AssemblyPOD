/*global QUnit*/
sap.ui.define([
	"sap/custom/assemblypod/util/ApplicationUtil",
    "sap/custom/assemblypod/test/unit/UnitTestUtil"
], function (ApplicationUtil, UnitTestUtil) {
	"use strict";

    var sandbox = sinon.createSandbox();

    QUnit.module("ApplicationUtil tests", {
        beforeEach: function () {
            var oOwner = UnitTestUtil.getOwnerComponent();
            this.oApplicationUtil = new ApplicationUtil(oOwner);
        },
        afterEach: function () {
            this.oApplicationUtil = null;
            sandbox.restore();
        }
    });

    QUnit.test("getI18nText: test getting i18n text", function (assert) {

        var oGetResourceBundleStub = UnitTestUtil.getI18nResourceBundleStub(sandbox, this.oApplicationUtil);
        
        var sText = this.oApplicationUtil.getI18nText(UnitTestUtil.TEST_I18N_KEY);

        assert.ok(oGetResourceBundleStub.called, "getI18nResourceBundle() called");
        assert.equal(sText, UnitTestUtil.TEST_I18N_VALUE, "getI18nText() returned correct value");
    });

    QUnit.test("getI18nResourceBundle: test getting initial resource bundle", function (assert) {
        var oBundle1 = this.oApplicationUtil.getI18nResourceBundle();
        assert.ok(oBundle1, "getI18nResourceBundle() returned a resource bundle");
        
        var oBundle2 = this.oApplicationUtil.getI18nResourceBundle();
        assert.deepEqual(oBundle2, oBundle1, "getI18nResourceBundle() returned the same resource bundle");
    });

    QUnit.test("ajaxRequest: tests making ajax get request", function (assert) {
        var oAjaxMock = sinon.mock(jQuery);
        
        oAjaxMock.expects("ajax");
        var oPromise = this.oApplicationUtil.ajaxRequest("GET", "someUrl", null, "P1");
        
        assert.ok(oPromise, "Service promise is returned");
        oAjaxMock.verify();
    });

    QUnit.test("ajaxRequest: tests making ajax post request", function (assert) {
        var oAjaxMock = sinon.mock(jQuery);

        oAjaxMock.expects("ajax");
        var oPromise = this.oApplicationUtil.ajaxRequest("POST", "someUrl", null, "P1");
        
        assert.ok(oPromise, "Service promise is returned");
        oAjaxMock.verify();
    });

    QUnit.test("ajaxRequest: tests making ajax delete request", function (assert) {
        var oAjaxMock = sinon.mock(jQuery);

        oAjaxMock.expects("ajax");
        var oPromise = this.oApplicationUtil.ajaxRequest("DELETE", "someUrl", null, "P1");
        
        assert.ok(oPromise, "Service promise is returned");
        oAjaxMock.verify();
    });

    QUnit.test("ajaxRequest: tests making ajax request with invalid method", function (assert) {
        var sErrorMessage = "Invalid method type. Must be 'get', 'post' or 'delete'";
        return this.oApplicationUtil.ajaxRequest("BAD", "someUrl", null, "P1")
        .then(function () {
        }.bind(this))
        .catch(function (sError) {
            assert.equal(sError, sErrorMessage, "Correct error message returned in reject");
        }.bind(this));
    });

    QUnit.test("getErrorMessage: test converting error object to string", function (assert) {

        assert.notOk(this.oApplicationUtil.getMessage(null), "getMessage() returned null");

        var oError = {"message": "Error message"};
        assert.equal(this.oApplicationUtil.getMessage(oError), "Error message", "getMessage() returned correct message");

        oError = ["Error Message1","Error Message2", "ErrorMesasge3"];
        var sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oApplicationUtil.getMessage(oError), sResult, "getMessage() returned correct array of messages");

        oError = {
            "message": ["Error Message1","Error Message2", "ErrorMesasge3"]
        };
        sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oApplicationUtil.getMessage(oError), sResult, "getMessage() returned correct array of messages");

        oError = {
            "error": {
                "message": ["Error Message1","Error Message2", "ErrorMesasge3"]
            }
        };
        sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oApplicationUtil.getMessage(oError), sResult, "getMessage() returned array of messages");

        oError = {
            "error": {
                "message": "Error Message"
            }
        };
        assert.equal(this.oApplicationUtil.getMessage(oError), "Error Message", "getMessage() returned 'correct message");

        assert.equal(this.oApplicationUtil.getMessage("Error Message"), "Error Message", "getMessage() returned correct message");

        assert.notOk(this.oApplicationUtil.getMessage({"badtype": "xxx"}), "getMessage() returned null");
    });

    QUnit.test("convertArrayToString: test converting array of strings to a single string", function (assert) {
        var oError = ["Error Message1","Error Message2", "ErrorMesasge3"];
        var sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oApplicationUtil.convertArrayToString(oError), sResult, "convertArrayToString() returned correct string");
    });

    QUnit.test("getSfcData: retrieving SFC data successfully", function (assert) {
        var oSfcData = UnitTestUtil.getSfcResponseData();

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oSfcData);
        
        return this.oApplicationUtil.getSfcData("SFC1")
        .then(function (oResults) {
            assert.equal(oResults.sfc, "SFC1", "results is correct");
        }.bind(this));
    });

    QUnit.test("getSfcData: when SFC not found", function (assert) {
        var oSfcData = UnitTestUtil.getSfcResponseData(true);

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oSfcData);
        var sErrorMessage = "not found";
        sandbox.stub(this.oApplicationUtil, "getI18nText").returns(sErrorMessage);
        
        return this.oApplicationUtil.getSfcData("SFC1")
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, sErrorMessage, "Correct error message returned in reject");
        }.bind(this));
    });

    QUnit.test("getSfcData: when SFC on hold", function (assert) {
        var oSfcData = UnitTestUtil.getSfcResponseData(false, "404", "Hold");

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oSfcData);
        var sErrorMessage = "on hold";
        sandbox.stub(this.oApplicationUtil, "getI18nText").returns(sErrorMessage);
        
        return this.oApplicationUtil.getSfcData("SFC1")
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, sErrorMessage, "Correct error message returned in reject");
        }.bind(this));
    });
    
    QUnit.test("getSfcData: tests retrieving SFC data getting error", function (assert) {

        var oTestError = {
            "message": "All BAD",
            "status": "NOT_FOUND"
        };
        var sErrorMessage = "not found";
        sandbox.stub(this.oApplicationUtil, "getI18nText").returns(sErrorMessage);

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.getSfcData("SFC1")
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, sErrorMessage, "Correct error message returned in reject");
        }.bind(this));
    });

    QUnit.test("getSfcAssemblyData: retrieving SFC assembly data data successfully", function (assert) {
        var oSfcAssyData = UnitTestUtil.getSfcComponentsResponseData();

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oSfcAssyData);
        
        return this.oApplicationUtil.getSfcAssemblyData("SFC1", "OPER1")
        .then(function (oResults) {
            assert.equal(oResults.length, 2, "2 components found");
        }.bind(this));
    });
    
    QUnit.test("getSfcAssemblyData: error retrieving assembly data", function (assert) {
        var oTestError = {
            "message": "All BAD",
            "status": "NOT_FOUND"
        };      
        var sErrorMessage = "not found";
        sandbox.stub(this.oApplicationUtil, "getI18nText").returns(sErrorMessage);
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);
        
        return this.oApplicationUtil.getSfcAssemblyData("SFC1", "OPER1")
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, sErrorMessage, "Correct error message returned in reject");
        }.bind(this));
    
    });
    
    QUnit.test("getSfcAssemblyData: key data missing", function (assert) {
       var oTestError = {
            "message": "All BAD",
            "status": "NOT_FOUND"
       };      
       var sErrorMessage = "not found";
       sandbox.stub(this.oApplicationUtil, "getI18nText").returns(sErrorMessage);
       sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);
       
       return this.oApplicationUtil.getSfcAssemblyData()
       .then(function () {
        assert.notOk(true, "Error resolving on a reject should not occur")
       }.bind(this))
       .catch(function (oError) {
           assert.equal(oError.message, sErrorMessage, "Correct error message returned in reject");
       }.bind(this));
   
    });

    QUnit.test("getAssembledComponentsData: retrieving SFC assembly data data successfully", function (assert) {
        var aAssembledData = UnitTestUtil.getAssembledComponentsResponseData();

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(aAssembledData);
        
        return this.oApplicationUtil.getAssembledComponentsData("SFC1", "OPER1", "10")
        .then(function (aResults) {
            assert.equal(aResults.length, 1, "Components assembled data returned");
        }.bind(this));
    });
    
    QUnit.test("getAssembledComponentsData: error retrieving assembly data", function (assert) {
        var oTestError = {
            "message": "All BAD",
            "status": "NOT_FOUND"
        };      
        var sErrorMessage = "not found";
        sandbox.stub(this.oApplicationUtil, "getI18nText").returns(sErrorMessage);
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);
        
        return this.oApplicationUtil.getAssembledComponentsData("SFC1", "OPER1", "10")
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, sErrorMessage, "Correct error message returned in reject");
        }.bind(this));
    
    });
    
    QUnit.test("addComponent: tests adding a component successfully", function (assert) {

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves({});
        
        var oResponse = this.oApplicationUtil._oRequestProcessor.addComponentsResponseMapper({});
        
        var oRequestData = {
            "plant": "P1",
            "resource": "RES1",
            "sfc": "SFC1",
            "operationRef": "OperationBO:SAP,OPER1,C",
            "stepId": "10",
            "componentRef": "ItemBO:SAP,BRACKET,A",
            "bomComponentRef": "BOMComponentBO:BOMBO:SAP,BRACKET,U,A,ItemBO:SAP,BRACKET,A,20",
            "quantity": 1,
            "dataFields": [{"fieldName": "EXTERNAL_SERIAL", value: "1234"}]
        };
        
        return this.oApplicationUtil.addComponent(oRequestData)
        .then(function (oResults) {
            assert.deepEqual(oResults, oResponse, "results is correct");
        }.bind(this));
    });

    QUnit.test("addComponent: tests adding a component getting error", function (assert) {
        var oResponseData =  {
        };
        
        var oTestError = {
            "message": "All BAD"
        };

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.addComponent(oResponseData)
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, oTestError.message, "Correct error message returned in reject");
        }.bind(this));
    });
    
    QUnit.test("removeComponent: tests removing a component successfully", function (assert) {
        var oResponse = {};
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oResponse);

        var oRequestData = {
            "plant": "P1",
            "resource": "RES1",
            "sfc": "SFC1",
            "operation": "OPER1",
            "operationRev": "C",
            "stepId": "10",
            "componentName": "BRACKET",
            "componentRev": "A",
            "bomComponentRef": "BOMComponentBO:BOMBO:SAP,BRACKET,U,A,ItemBO:SAP,BRACKET,A,20",
            "quantity": 1
        };
        
        return this.oApplicationUtil.removeComponent(oRequestData)
        .then(function (oResults) {
            assert.deepEqual(oResults, oResponse, "results is correct");
        }.bind(this));
    });

    QUnit.test("removeComponent: tests removing a component getting error", function (assert) {
        var oResponseData =  {};
        
        var oTestError = {
            "message": "All BAD"
        };

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.removeComponent(oResponseData)
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, oTestError.message, "Correct error message returned in reject");
        }.bind(this));
    });
    
    QUnit.test("startSfc: tests starting an SFC successfully", function (assert) {
        var oResponseData = {
            "sfcs": ["SFC1"],
            "operation": "OPER1"
        };
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oResponseData);
        
        return this.oApplicationUtil.startSfc("SFC1", "OPER1", "RES1", 1.0)
        .then(function (oResults) {
            assert.deepEqual(oResults, oResponseData, "results is correct");
        }.bind(this));
    });

    QUnit.test("startSfc: tests starting an SFC getting error", function (assert) {

        var oTestError = {
            "message": "All BAD"
        };

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.startSfc("SFC1", "OPER1", "RES1", 1.0)
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, oTestError.message, "Correct error message returned in reject");
        }.bind(this));
    });

    QUnit.test("completeSfc: tests completing an SFC successfully", function (assert) {
        var oResponseData = {
            "sfcs": ["SFC1"],
            "operation": "OPER1"
        };
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oResponseData);
        
        return this.oApplicationUtil.completeSfc("SFC1", "OPER1", "RES1", 1.0)
        .then(function (oResults) {
            assert.deepEqual(oResults, oResponseData, "results is correct");
        }.bind(this));
    });

    QUnit.test("completeSfc: tests completing an SFC getting error", function (assert) {

        var oTestError = {
            "message": "All BAD"
        };

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.completeSfc("SFC1", "OPER1", "RES1", 1.0)
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, oTestError.message, "Correct error message returned in reject");
        }.bind(this));
    });

    QUnit.test("getMaterialFileId: tests retrieving Materials default file id successfully", function (assert) {
        var oSfcData = UnitTestUtil.getSfcResponseData();
        var oGlobalModel = {
            "getProperty": function(sKey) {
                return "P1";
            }
        };
        sandbox.stub(this.oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        
        var oResponse = {
            "materialFileAttachments": [
                {
                    "ref": "MaterialFileAttachmentBO:ItemBO:P1,BULB,A,511A97DFBBB74B1FB6D0A39BF2A8A61B",
                    "material": "ItemBO:P1,BULB,A",
                    "fileId": "511A97DFBBB74B1FB6D0A39BF2A8A61B",
                    "isDefault": false
                },
                {
                    "ref": "MaterialFileAttachmentBO:ItemBO:P1,LIGHTBULB,A,FC6832F039F94F3186F0814D9B689ED3",
                    "material": "ItemBO:P1,LIGHTBULB,A",
                    "fileId": "FC6832F039F94F3186F0814D9B689ED3",
                    "isDefault": true
                }
            ]
        };
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oResponse);
        
        return this.oApplicationUtil.getMaterialFileId(oSfcData)
        .then(function (sFileId) {
            assert.equal(sFileId, "FC6832F039F94F3186F0814D9B689ED3", "returned correct file id");
        }.bind(this));
    });
    
    QUnit.test("getMaterialFileId: tests retrieving Materials default file id getting error", function (assert) {
        var oSfcData = UnitTestUtil.getSfcResponseData();
        var oGlobalModel = {
            "getProperty": function(sKey) {
                return "P1";
            }
        };
        sandbox.stub(this.oApplicationUtil, "getGlobalModel").returns(oGlobalModel);

        var oTestError = {
            "message": "All BAD",
            "status": "NOT_FOUND"
        };
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.getMaterialFileId(oSfcData)
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, "All BAD", "Correct error message returned in reject");
        }.bind(this));
    });
    
    QUnit.test("getMaterialFileImageUri: tests retrieving Materials image URI successfully", function (assert) {
        
        var oResponse = {
            "d": {
                "mimeGroupCode": "2",
            }
        };
        sandbox.stub(this.oApplicationUtil, "ajaxRequest").resolves(oResponse);

        var sFileImageUri = "attachments/download/FC6832F039F94F3186F0814D9B689ED3?lang=en";
        
        return this.oApplicationUtil.getMaterialFileImageUri("FC6832F039F94F3186F0814D9B689ED3")
        .then(function (sFileId) {
            assert.ok(sFileId.indexOf(sFileImageUri) > 0, "returned correct file id");
        }.bind(this));
    });
    
    QUnit.test("getMaterialFileImageUri: tests retrieving Materials image URI getting error", function (assert) {
        
        var oTestError = {
            "message": "All BAD",
            "status": "NOT_FOUND"
        };

        sandbox.stub(this.oApplicationUtil, "ajaxRequest").rejects(oTestError);

        return this.oApplicationUtil.getMaterialFileImageUri("FC6832F039F94F3186F0814D9B689ED3")
        .then(function () {
            assert.notOk(true, "Error resolving on a reject should not occur")
        }.bind(this))
        .catch(function (oError) {
            assert.equal(oError.message, "All BAD", "Correct error message returned in reject");
        }.bind(this));
    });
});
