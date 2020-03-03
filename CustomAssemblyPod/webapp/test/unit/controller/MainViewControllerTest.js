/*global QUnit*/

sap.ui.define([
	"sap/custom/assemblypod/controller/MainView.controller",
    "sap/custom/assemblypod/test/unit/UnitTestUtil"
], function (Controller, UnitTestUtil) {
	"use strict";

    var sandbox = sinon.createSandbox();

    QUnit.module("MainView Controller tests", {
        beforeEach: function () {
            this.oController = new Controller();
            this._oGetOwnerStub = UnitTestUtil.getOwnerComponentStub(sandbox, this.oController);
            this.oController.onInit();
        },

        afterEach: function () {
            this.oController.destroy();
            this._oGetOwnerStub = null;
            sandbox.restore();
        }
    });

	QUnit.test("onBeforeRendering: test before rendering MainView controller", function (assert) {

	    var oGetViewStub = UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
	    
        var oRoute = {
            "attachPatternMatched": function() {}
        };
        var oAttachPatterMatchedSpy = sinon.spy(oRoute, "attachPatternMatched");
        var oRouter = {
            "getRoute": function() {
                return oRoute;
            }
        };
        sinon.stub(this.oController, "getRouter").returns(oRouter);
	    
        var oGetUrlParameterStub = sandbox.stub(this.oController, "_getUrlParameter").callsFake(function (sParameter) {
            if (sParameter === "WORK_CENTER") {
                return "WC1";
            } else if (sParameter === "RESOURCE") {
                return "RES1";
            } else if (sParameter === "PLANT") {
                return "P1";
            }
            return null;
        });

        var oGetGlobalModelSpy = sandbox.spy(this.oController._oApplicationUtil, "getGlobalModel");

	    this.oController.onBeforeRendering();

        assert.equal(oGetUrlParameterStub.callCount, 3, "_getUrlParameter() called 3 times");
        assert.equal(oGetGlobalModelSpy.callCount, 1, "getGlobalModel called");

        var oModel = oGetGlobalModelSpy.returnValues[0];
        assert.equal(oModel.getProperty("/workCenter"), "WC1", "workCenter is WC1");
        assert.equal(oModel.getProperty("/resource"), "RES1", "resource is RES1");
        assert.equal(oModel.getProperty("/plant"), "P1", "plant is P1");
        assert.equal(oGetViewStub.callCount, 1, "getView() called");
        assert.equal(oAttachPatterMatchedSpy.callCount, 1, "Route attachPatternMatched() called");
	});

    QUnit.test("onAfterRendering: test after rendering MainView controller", function (assert) {

        var oLink = {
            "setVisible": function() {}
        };
        var oGetViewStub = UnitTestUtil.getViewStub(sandbox, this.oController, null, null, oLink);
        var ofocusOnScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");
        var oLinkSpy = sandbox.spy(oLink, "setVisible");
        
        this.oController.onAfterRendering();

        assert.ok(oGetViewStub.calledOnce, "Controller getView() called once");
        assert.ok(ofocusOnScanFieldStub.called, "focus() called on scan field");
        assert.ok(oLinkSpy.called, "setVisible() called on Link");
    });

    QUnit.test("focusOnScanField: test putting focus on SFC Scan field", function (assert) {

        var oScanField = {
            "focus": function() {}
        };

        var oGetViewStub = UnitTestUtil.getViewStub(sandbox, this.oController, oScanField, null, null);
        var oScanFieldSpy = sandbox.spy(oScanField, "focus");
        
        var oClock = sinon.useFakeTimers();
        
        this.oController.focusOnScanField();

        assert.ok(oGetViewStub.calledOnce, "Controller getView() called once");
        assert.ok(oScanFieldSpy.notCalled, "expect focus() not called on scan field");
        oClock.tick(500);
        assert.ok(oScanFieldSpy.called, "expect focus() called on scan field");
        oClock.restore();
        
    });
    
    QUnit.test("onSfcChange: test handling sfc field change on success", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oLoadSfcDataStub = sandbox.stub(this.oController, "_loadSfcData").resolves();
        
        var oSfcField = {
            "getValue": function() {
                return "SFC1";
            },
            "setValue": function(sValue) {}
        };
        var oEvent = {
            "getSource": function() {
                return oSfcField;
            }
        };
        
        return this.oController.onSfcChange(oEvent)
        .then(function() {
            assert.ok(oLoadSfcDataStub.called, "_loadSfcData() called");
        }.bind(this));
    });

    QUnit.test("onSfcChange: test handling sfc field change when SFC is blank", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oLoadSfcDataStub = sandbox.stub(this.oController, "_loadSfcData").resolves();
        
        var oSfcField = {
            "getValue": function() {
                return "";
            },
            "setValue": function(sValue) {}
        };
        var oEvent = {
            "getSource": function() {
                return oSfcField;
            }
        };

        this.oController.onSfcChange(oEvent);

        assert.ok(oLoadSfcDataStub.notCalled, "_loadSfcData() not called");
    });

    QUnit.test("onSfcChange: test handling sfc field change when _loadSfcData() fails", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oShowMessageStub = sandbox.stub(this.oController, "showMessageToast");
        var oFocusScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");

        var oError = {
            "message": "ERROR"
        };
        var oLoadSfcDataStub = sandbox.stub(this.oController, "_loadSfcData").rejects(oError);

        var oSfcField = {
            "getValue": function() {
                return "SFC1";
            },
            "setValue": function(sValue) {}
        };
        var oEvent = {
            "getSource": function() {
                return oSfcField;
            }
        };
        
        return this.oController.onSfcChange(oEvent)
        .then(function() {
            assert.ok(oLoadSfcDataStub.called, "_loadSfcData() called");
            assert.ok(oShowMessageStub.called, "showMessageToast() called");
            assert.ok(oFocusScanFieldStub.called, "focusOnScanField() called");
        }.bind(this));
    });

    QUnit.test("onSfcChange: test handling sfc field change when _startSfc() fails", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        var oGlobalModel = {
            getProperty: function(sKey) {
                if (sKey === "/sfcData") {
                    return {sfc: "SFC1"};
                } else if (sKey === "/operationData") {
                    return {operation: "OPER1"};
                } else if (sKey === "/resource") {
                    return {resource: "RES1"};
                }
                return null;
            }
        };
        sandbox.stub(this.oController.getApplicationUtil(), "getGlobalModel").returns(oGlobalModel);

        var oShowMessageStub = sandbox.stub(this.oController, "showMessageToast");
        var oFocusScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");

        var oError = {
            "message": "ERROR"
        };
        var oLoadSfcDataStub = sandbox.stub(this.oController, "_loadSfcData").resolves();
        var oStartSfcStub = sandbox.stub(this.oController, "_startSfc").rejects(oError);

        var oSfcField = {
            "getValue": function() {
                return "SFC1";
            },
            "setValue": function(sValue) {}
        };
        var oEvent = {
            "getSource": function() {
                return oSfcField;
            }
        };
        
        return this.oController.onSfcChange(oEvent)
        .then(function() {
            assert.ok(oLoadSfcDataStub.called, "_loadSfcData() called");
            assert.ok(oStartSfcStub.called, "_startSfc() called");
            assert.ok(oShowMessageStub.called, "showMessageToast() called");
            assert.ok(oFocusScanFieldStub.called, "focusOnScanField() called");
        }.bind(this));
    });

    QUnit.test("onSfcChange: test handling sfc field change when getSfcAssemblyData() fails", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        var oGlobalModel = {
            getProperty: function(sKey) {
                if (sKey === "/sfcData") {
                    return {sfc: "SFC1"};
                } else if (sKey === "/resource") {
                    return {resource: "RES1"};
                }
                return null;
            }
        };
        var oUtil = this.oController.getApplicationUtil();
        sandbox.stub(oUtil, "getGlobalModel").returns(oGlobalModel);

        var oError = {
            "message": "ERROR"
        };
        var oLoadSfcDataStub = sandbox.stub(this.oController, "_loadSfcData").resolves();
        var oStartSfcStub = sandbox.stub(this.oController, "_startSfc").resolves();
        var oGetSfcAssemblyDataStub = sandbox.stub(oUtil, "getSfcAssemblyData").rejects(oError);

        var oSfcField = {
            "getValue": function() {
                return "SFC1";
            },
            "setValue": function(sValue) {}
        };
        var oEvent = {
            "getSource": function() {
                return oSfcField;
            }
        };
        
        return this.oController.onSfcChange(oEvent)
        .then(function() {
            assert.ok(oLoadSfcDataStub.called, "_loadSfcData() called");
            assert.ok(oStartSfcStub.called, "_startSfc() called");
            assert.ok(oGetSfcAssemblyDataStub.called, "getSfcAssemblyData() called");
        }.bind(this));
    });

    QUnit.test("_loadSfcData: test loading of SFC Data", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oSfcData = UnitTestUtil.getSfcResponseData();

        var oGetSfcDataStub = sandbox.stub(this.oController._oApplicationUtil, "getSfcData").resolves(oSfcData);

        return this.oController._loadSfcData("SFC1")
        .then(function() {
            assert.ok(oGetSfcDataStub.called, "getSfcData() called");
        }.bind(this));

    });

    QUnit.test("_loadSfcData: test loading of SFC Data when getSfcData fails", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oSfcData = {
            "message": "ERROR"
        };
  
        var oGetSfcDataStub = sandbox.stub(this.oController._oApplicationUtil, "getSfcData").rejects(oSfcData);

        return this.oController._loadSfcData("SFC1")
        .then(function() {
        }.bind(this))
        .catch(function() {
            assert.ok(oGetSfcDataStub.called, "getSfcData() called");
        }.bind(this));

    });

    QUnit.test("_loadSfcAssemblyData: test loading of SFC Assy Data", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oSfcData = {
            "sfcdata": "Test Data"
        };
  
        var oGetSfcAssyDataStub = sandbox.stub(this.oController._oApplicationUtil, "getSfcAssemblyData").resolves(oSfcData);

        return this.oController._loadSfcAssemblyData("SFC1", "OPER1")
        .then(function() {
            assert.ok(oGetSfcAssyDataStub.called, "getSfcAssemblyData() called");
        }.bind(this));

    });
    
    QUnit.test("_loadSfcAssemblyData: test loading of SFC Assy Data when getSfcAssemblyData fails", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oSfcData = {
            "message": "ERROR"
        };
  
        var oGetSfcAssyDataStub = sandbox.stub(this.oController._oApplicationUtil, "getSfcAssemblyData").rejects(oSfcData);

        return this.oController._loadSfcAssemblyData("SFC1", "OPER1")
        .then(function() {
        }.bind(this))
        .catch(function() {
            assert.ok(oGetSfcAssyDataStub.called, "getSfcaSSEMBLYData() called");
        }.bind(this));

    });

    QUnit.test("_startSfc: test SFC that is already started", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oSfcData = {
            "sfc": "SFC1",
            "operation": "OPER1",
            "stepStatus": "IN_WORK"
        };
  
        var oStartSfcStub = sandbox.stub(this.oController._oApplicationUtil, "startSfc").resolves(null);

        return this.oController._startSfc("SFC1", oSfcData, "RES1")
        .then(function() {
            assert.ok(oStartSfcStub.notCalled, "oStartSfcStub() not called");
        }.bind(this));

    });

    QUnit.test("_startSfc: test SFC that is not started", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);

        var oSfcData = {
            "sfc": "SFC1",
            "operation": "OPER1",
            "stepStatus": "IN_QUEUE"
        };

        var oStartSfcStub = sandbox.stub(this.oController._oApplicationUtil, "startSfc").resolves({});

        return this.oController._startSfc("SFC1", oSfcData, "RES1")
        .then(function() {
            assert.ok(oStartSfcStub.called, "oStartSfcStub() called");
        }.bind(this));

    });
    
    QUnit.test("_startSfc: test Starting SFC and get error", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        var oSfcData = {
            "sfc": "SFC1",
            "operation": "OPER1",
            "stepStatus": "IN_QUEUE"
        };
        var oError = {
            "message": "ERROR"
        };

        var oStartSfcStub = sandbox.stub(this.oController._oApplicationUtil, "startSfc").rejects(oError);

        return this.oController._startSfc("SFC1", oSfcData, "RES1")
        .then(function() {
        }.bind(this))
        .catch(function(err) {
            assert.ok(oStartSfcStub.called, "oStartSfcStub() called");
            assert.ok(err.message, oError.message, "Error message is correct");
        }.bind(this));

    });

    QUnit.test("_getCustomerLogo: test getting customer logo on cloud", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/index.html";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);

        var sResultUrl = this.oController._getCustomerLogo();
        assert.equal(sResultUrl.indexOf("./images"), 0, "Customer logo found in production");
    });

    QUnit.test("_getCustomerLogo: test getting customer logo in local test", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/test/mock.html";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);

        var sResultUrl = this.oController._getCustomerLogo();
        assert.equal(sResultUrl.indexOf("../images"), 0, "Customer logo found in test mode");
    });

    QUnit.test("_getCustomerLogo: test getting customer logo in local integration test", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/test/integration/opaTests.qunit.html";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);

        var sResultUrl = this.oController._getCustomerLogo();
        assert.equal(sResultUrl.indexOf("../../images"), 0, "Customer logo found in test mode");
    });

    QUnit.test("_getUrlParameter: test getting url parameter", function (assert) {
        var oFnParameters = {
            "get": function(sParameter) {
                return "value1";
            }
        }
        var oGetUrlParametersStub = sinon.stub(this.oController, "_getUrlParameters").returns(oFnParameters);

        var sValue = this.oController._getUrlParameter("PARAM1");

        assert.ok(oGetUrlParametersStub.called, "_getUrlParameters called once");
        assert.equal(sValue, "value1", "URL Parameter value is correct");
    });

    QUnit.test("_getUrlParameters: test getting url parameters", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/index.html?WORK_CENTER=WC1&RESOURCE=RES1&PLANT=P1";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);

        var oParameters = this.oController._getUrlParameters();

        assert.equal(oParameters.get("WORK_CENTER"), "WC1", "WORK_CENTER value is correct");
        assert.equal(oParameters.get("RESOURCE"), "RES1", "RESOURCE value is correct");
        assert.equal(oParameters.get("PLANT"), "P1", "PLANT value is correct");
    });

});
