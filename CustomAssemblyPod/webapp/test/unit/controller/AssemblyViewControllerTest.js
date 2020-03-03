/*global QUnit*/

sap.ui.define([
	"sap/custom/assemblypod/controller/AssemblyView.controller",
    "sap/custom/assemblypod/test/unit/UnitTestUtil",
    "sap/custom/assemblypod/controller/Barcode.controller",
    "sap/ui/core/theming/Parameters",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (Controller, UnitTestUtil, Barcode, Parameters, MessageBox, MessageToast, JSONModel, Fragment) {
	"use strict";

    var sandbox = sinon.createSandbox();

    QUnit.module("AssemblyView Controller tests", {
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
        var oRoute = {
            "attachPatternMatched": function() {}
        };
        var oRouter = {
            "getRoute": function(sRoute) {
                return oRoute;
            }
        };
        sandbox.stub(this.oController, "getRouter").returns(oRouter);
        var oGetRouteSpy = sandbox.spy(oRouter, "getRoute");
        var oAttachRouterMatchedSpy = sandbox.spy(oRoute, "attachPatternMatched");

	    this.oController.onBeforeRendering();
	    
        assert.ok(oGetRouteSpy.calledWith("AssemblyPage"), "getRoute('AssemblyPage') called");
        assert.ok(oAttachRouterMatchedSpy.called, "attachPatternMatched() called");
	});

    QUnit.test("onAfterRendering: test after rendering MainView controller", function (assert) {
        var oBreadcrumb = {
            "destroyLinks": function() {},
            "addLink": function(sLink) {},
            "setCurrentLocationText": function(sText) {},
            "setVisible": function(bShow) {}
        };
        var oBundle = {
            "getI18nText": function(sKey) {
                if (sKey === "mainPageDescription") {
                    return "SFC";
                } else if (sKey === "assemblyPageDescription") {
                    return "Assembly";
                }
                return null;
            }
        };
        
        var oDestroyLinksSpy = sandbox.spy(oBreadcrumb, "destroyLinks");
        var oAddLinkSpy = sandbox.spy(oBreadcrumb, "addLink");
        var oSetCurrentLocationTextSpy = sandbox.spy(oBreadcrumb, "setCurrentLocationText");
        var oSetVisibleSpy = sandbox.spy(oBreadcrumb, "setVisible");
        var oGetI18nTextStub = sandbox.stub(this.oController._oApplicationUtil, "getI18nText").returns(oBundle);

        var oGetViewStub = UnitTestUtil.getViewStub(sandbox, this.oController, null, oBreadcrumb, null);
        
        sandbox.stub(this.oController, "_isPageRefresh").returns(false);

        var oFocusStub = sandbox.stub(this.oController, "focusOnScanField");
        
        this.oController.onAfterRendering();

        assert.ok(oGetViewStub.calledOnce, "Controller getView() called once");
        assert.ok(oDestroyLinksSpy.called, "destroy() called on breadcrumb");
        assert.ok(oAddLinkSpy.calledOnce, "breadcrumb.addLink() called once");
        assert.ok(oGetI18nTextStub.calledTwice, "Controller getI18nText() called twice");
        assert.ok(oSetCurrentLocationTextSpy.called, "breadcrumb.setCurrentLocationText() called");
        assert.ok(oSetVisibleSpy.called, "breadcrumb.setVisible(true) called");
        assert.ok(oFocusStub.called, "focusOnScanField() called");
    });

    QUnit.test("onAfterRendering: test page refresh and navigate back to main", function (assert) {
        
        sandbox.stub(this.oController, "_isPageRefresh").returns(true);
        
        var oNavigateToPageStub = sandbox.stub(this.oController, "navigateToPage");

        this.oController.onAfterRendering();
        
        assert.ok(oNavigateToPageStub.calledWith("MainPage"), "navigateToPage('MainPage') called");
    });

    QUnit.test("onAssemblyPageLoad: test setting model when page loads", function (assert) {
        
        var oHBox = {
            "getId": function() {
                return "view-sfcInfoHeader";
            }
        };
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, oHBox);
        var oSelectObject = {
            "css": function(sprop, sValue) {}
        };
        var oCssSpy = sandbox.spy(oSelectObject, "css");
        sandbox.stub(this.oController, "_getJQuerySelectionById").returns(oSelectObject);

        sandbox.stub(this.oController, "_isPageRefresh").returns(false);
        
        var oGlobalModel = new JSONModel();
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        oSfcData.startDatetime = oSfcDataResponse.orderPlannedStartDateTime;
        oSfcData.endDatetime = oSfcDataResponse.orderPlannedCompleteDateTime;

        sandbox.stub(oGlobalModel, "getProperty").callsFake(function(sProperty) {
            if (sProperty === "/sfcData") {
                return oSfcData;
            }
            return null;
        });
        
        var sColor = Parameters.get("sapUiWhite");
        var sBackground = Parameters.get("sapUiPositive");
        var sStatusIcon = "sap-icon://border";
        
        var oSetPropertySpy = sandbox.spy(oGlobalModel, "setProperty");
        var oLoadMaterialFileThumbnailStub = sandbox.stub(this.oController, "_loadMaterialFileThumbnail").resolves(null);

        sandbox.stub(this.oController, "_setMaterialImageContainerVisibility");
        sandbox.stub(this.oController, "focusOnScanField");

        this.oController.onAssemblyPageLoad();
        
        assert.ok(oCssSpy.calledWith("background-color", sBackground), "SFC Header Info background color set");
        
        assert.equal(oSetPropertySpy.args[0][1], sColor, "foregroundColor set");
        assert.equal(oSetPropertySpy.args[1][1], sBackground, "backgroundColor set");
        assert.equal(oSetPropertySpy.args[2][1], oSfcData.sfc, "sfc set");
        assert.equal(oSetPropertySpy.args[3][1], sStatusIcon, "status icon set");
        assert.equal(oSetPropertySpy.args[4][1], oSfcData.materialDescription, "materialDescription set");
        assert.equal(oSetPropertySpy.args[5][1], oSfcData.shopOrder, "shopOrder set");
        assert.equal(oSetPropertySpy.args[6][1], oSfcData.material, "material set");
        assert.equal(oSetPropertySpy.args[7][1], oSfcData.startDatetime, "startDatetime set");
        assert.equal(oSetPropertySpy.args[8][1], oSfcData.endDatetime, "endDatetime set");
        assert.equal(oSetPropertySpy.args[9][1], oSfcData.sfcQuantity, "sfcQuantity set");
        assert.equal(oSetPropertySpy.args[10][1], oSfcData.operationStepId, "operationStepId set");
        assert.equal(oSetPropertySpy.args[11][1], oSfcData.operationDescription, "operationDescription set");
        
        assert.ok(oLoadMaterialFileThumbnailStub.called, "_loadMaterialFileThumbnail() called");
    });

    QUnit.test("onAssemblyPageLoad: test page refresh and navigate back to main", function (assert) {
        
        sandbox.stub(this.oController, "_isPageRefresh").returns(true);
        
        var oNavigateToPageStub = sandbox.stub(this.oController, "navigateToPage");

        this.oController.onAssemblyPageLoad();
        
        assert.ok(oNavigateToPageStub.calledWith("MainPage"), "navigateToPage('MainPage') called");
    });

    QUnit.test("_isPageRefresh: test when no page refresh", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        var oGlobalModel = new JSONModel();
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        sandbox.stub(oGlobalModel, "getProperty").returns({sfcdata: "data"});

        this.oController._isPageRefresh();
        
        assert.notOk(this.oController._isPageRefresh(), "Page refresh did not occur");
    });

    QUnit.test("_isPageRefresh: test when page refresh", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        var oGlobalModel = new JSONModel();
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        sandbox.stub(oGlobalModel, "getProperty").returns(null);

        this.oController._isPageRefresh();
        
        assert.ok(this.oController._isPageRefresh(), "Page refresh did occur");
    });
    
    QUnit.test("_loadMaterialFileThumbnail: test getting the material image uri", function (assert) {
        
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);

        var sImageUri = "attachments/download/mat1?lang=en";
        sandbox.stub(this.oController._oApplicationUtil, "getMaterialFileId").resolves("xyz123");
        sandbox.stub(this.oController._oApplicationUtil, "getMaterialFileImageUri").resolves(sImageUri);

        var oModel = new JSONModel();
        return this.oController._loadMaterialFileThumbnail(oSfcData, oModel)
        .then(function (sResults) {
            assert.equal(sResults, sImageUri, "Image file uri returned");
        }.bind(this));
    });

    QUnit.test("_loadMaterialFileThumbnail: test failure getting the material image file id", function (assert) {
        
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);

        sandbox.stub(this.oController._oApplicationUtil, "getMaterialFileId").rejects({"message": "error message"});

        var oModel = new JSONModel();
        return this.oController._loadMaterialFileThumbnail(oSfcData, oModel)
        .then(function (sResults) {
            assert.equal(sResults, null, "Image file id not returned from getMaterialFileId()");
        }.bind(this));
    });

    QUnit.test("_loadMaterialFileThumbnail: test failure getting the material image file URI", function (assert) {
        
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);

        sandbox.stub(this.oController._oApplicationUtil, "getMaterialFileId").resolves("xyz123");
        sandbox.stub(this.oController._oApplicationUtil, "getMaterialFileImageUri").rejects({"message": "error message"});

        var oModel = new JSONModel();
        return this.oController._loadMaterialFileThumbnail(oSfcData, oModel)
        .then(function (sResults) {
            assert.equal(sResults, null, "Image file image not returned from getMaterialFileImageUri()");
        }.bind(this));
    });

    QUnit.test("_setMaterialImageContainerVisibility: test setting material image visible", function (assert) {
        
        var oControl = {
            "setWidth": function(vValue){},
            "addStyleClass": function(vValue){},
            "setVisible": function(vValue){},
            "removeStyleClass": function(vValue){}
        };
        var oSetWidthSpy = sandbox.spy(oControl, "setWidth");
        var oAddStyleClassSpy = sandbox.spy(oControl, "addStyleClass");
        var oSetVisibleSpy = sandbox.spy(oControl, "setVisible");
        var oRemoveStyleClassSpy = sandbox.spy(oControl, "removeStyleClass");
        var oView = {
            "byId": function(sId) {
                return oControl;
            }
        };
        sandbox.stub(this.oController, "getView").returns(oView);
        
        this.oController._setMaterialImageContainerVisibility(true);
        
        assert.equal(oSetWidthSpy.args[0][0], "30%", "Material container width set to 30%");
        assert.equal(oAddStyleClassSpy.args[0][0], "sapUiTinyMarginBegin", "Added style class to material container");
        assert.equal(oSetVisibleSpy.args[0][0], true, "Material container set visible");
        assert.equal(oSetWidthSpy.args[1][0], "70%", "SFC info container width set to 70%");
        assert.equal(oRemoveStyleClassSpy.args[0][0], "sapUiMediumMarginBegin", "Removed style class from SFC info container");
    });

    QUnit.test("_setMaterialImageContainerVisibility: test setting material image invisible", function (assert) {
        
        var oControl = {
            "setWidth": function(vValue){},
            "addStyleClass": function(vValue){},
            "setVisible": function(vValue){},
            "removeStyleClass": function(vValue){}
        };
        var oSetWidthSpy = sandbox.spy(oControl, "setWidth");
        var oAddStyleClassSpy = sandbox.spy(oControl, "addStyleClass");
        var oSetVisibleSpy = sandbox.spy(oControl, "setVisible");
        var oRemoveStyleClassSpy = sandbox.spy(oControl, "removeStyleClass");
        var oView = {
            "byId": function(sId) {
                return oControl;
            }
        };
        sandbox.stub(this.oController, "getView").returns(oView);
        
        this.oController._setMaterialImageContainerVisibility(false);
        
        assert.equal(oSetWidthSpy.args[0][0], "0px", "Material container width set to 0px");
        assert.equal(oRemoveStyleClassSpy.args[0][0], "sapUiTinyMarginBegin", "Removed style class to material container");
        assert.equal(oSetVisibleSpy.args[0][0], false, "Material container set invisible");
        assert.equal(oSetWidthSpy.args[1][0], "100%", "SFC info container width set to 100%");
        assert.equal(oAddStyleClassSpy.args[0][0], "sapUiMediumMarginBegin", "Added style class from SFC info container");
    });

    QUnit.test("_createBreadcrumbLink: test creating breadcrumb link", function (assert) {
        var oLink = this.oController._createBreadcrumbLink("AssemblyPage", "Assembly");
        assert.equal(oLink.getText(), "Assembly", "Link created with correct text");
    });

    QUnit.test("onComponentChange: test handling component field change", function (assert) {
        
        var componentScan = "[)>06{GS}11ZTHIS IS A TEST{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";

        var oComponentField = {
            "getValue": function() {
                return componentScan;
            },
            "setValue": function() {
                return;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, oComponentField, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                } else if (sKey === "/sfcAssemblyData") {
                    return UnitTestUtil.getSfcComponentsResponseData();
                } else if (sKey === "/resource") {
                    return "RES1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);

        var oAddComponentStub = sandbox.stub(this.oController._oApplicationUtil, "addComponent").resolves({});
        sandbox.stub(this.oController, "focusOnScanField");

        var oEvent = {
            "getSource": function() {
                return oComponentField;
            }
        };

        this.oController.onComponentChange(oEvent);
        
        assert.ok(oAddComponentStub.called, "addComponent() called");
    });
    
    QUnit.test("onComponentChange: test handling component field change when already assembled", function (assert) {
        
        var componentScan = "[)>06{GS}11ZTHIS IS A TEST{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";

        var oComponentField = {
            "getValue": function() {
                return componentScan;
            },
            "setValue": function() {
                return;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, oComponentField, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var aAssembleData = UnitTestUtil.getSfcComponentsResponseData();
        aAssembleData[0].remainingQuantity = 0;
        aAssembleData[0].assembledQuantity = 2;

        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                } else if (sKey === "/sfcAssemblyData") {
                    return aAssembleData;
                } else if (sKey === "/resource") {
                    return "RES1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);
        

        var oMessageToastStub = sandbox.stub(this.oController, "showMessageToast");
        var oFocusOnScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");

        var oEvent = {
            "getSource": function() {
                return oComponentField;
            }
        };

        this.oController.onComponentChange(oEvent);
        
        assert.ok(oMessageToastStub.called, "showMessageToast() called");
        assert.ok(oFocusOnScanFieldStub.called, "focusOnScanField() called");
    });  
  

    QUnit.test("onComponentChange: test handling component field change to empty string", function (assert) {
        
        var componentScan = "";

        var oComponentField = {
            "getValue": function() {
                return componentScan;
            },
            "setValue": function() {
                return;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, oComponentField, null, null);

        var oAddComponentStub = sandbox.stub(this.oController._oApplicationUtil, "addComponent").resolves({});
        sandbox.stub(this.oController, "focusOnScanField");

        var oEvent = {
            "getSource": function() {
                return oComponentField;
            }
        };

        this.oController.onComponentChange(oEvent);
        
        assert.ok(oAddComponentStub.notCalled, "addComponent() not called");
    });  

    QUnit.test("onComponentChange: test handling component field change when not a component", function (assert) {
        
        var componentScan = "[)>06{GS}11ZTHIS IS A TEST{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";

        var oComponentField = {
            "getValue": function() {
                return componentScan;
            },
            "setValue": function() {
                return;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, oComponentField, null, null);
        
        sandbox.stub(Barcode,"parseBarcode").returns({"isComponent":false});
        var oMessageToastStub = sandbox.stub(MessageToast,"show");
        sandbox.stub(this.oController, "focusOnScanField");

        sandbox.stub(this.oController._oApplicationUtil, "addComponent").resolves({});

        var oEvent = {
            "getSource": function() {
                return oComponentField;
            }
        };

        this.oController.onComponentChange(oEvent);
        
        assert.ok(oMessageToastStub.called, "MessageToast.show() called");
        
    });  

    QUnit.test("onComponentChange: test handling component field change when no components loaded", function (assert) {
        
        var componentScan = "[)>06{GS}11ZTHIS IS A TEST{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";

        var oComponentField = {
            "getValue": function() {
                return componentScan;
            },
            "setValue": function() {
                return;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, oComponentField, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                } else if (sKey === "/sfcAssemblyData") {
                    return [];
                } else if (sKey === "/resource") {
                    return "RES1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);

        var oFindComponentIndexStub = sandbox.stub(this.oController,"_findComponentIndex").returns(-1);
        sandbox.stub(this.oController, "focusOnScanField");

        var oAddComponentStub = sandbox.stub(this.oController._oApplicationUtil, "addComponent").resolves({});

        var oEvent = {
            "getSource": function() {
                return oComponentField;
            }
        };

        this.oController.onComponentChange(oEvent);
        
        assert.ok(oFindComponentIndexStub.called, "_findComponentIndex() called");
        assert.ok(oAddComponentStub.notCalled, "addComponent() not called");
    });

    QUnit.test("onRemoveComponent: test handling removing a component", function (assert) {

        var oButton = {
            "data": function(sKey) {
                return "BRACKET";
            }
        };
        var oEvent = {
            "getSource": function() {
                return oButton;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                } else if (sKey === "/sfcAssemblyData") {
                    return UnitTestUtil.getSfcComponentsResponseData();
                } else if (sKey === "/resource") {
                    return "RES1";
                } else if (sKey === "/plant") {
                    return "P1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);

        var oRemoveComponentStub = sandbox.stub(this.oController._oApplicationUtil, "removeComponent").resolves({});
        sandbox.stub(this.oController, "focusOnScanField");

        this.oController.onRemoveComponent(oEvent);
        
        assert.ok(oRemoveComponentStub.called, "removeComponent() called");
    });
    
    QUnit.test("onRemoveComponent: test removing a component with no component defined", function (assert) {

        var oButton = {
            "data": function(sKey) {
                return "";
            }
        };
        var oEvent = {
            "getSource": function() {
                return oButton;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        sandbox.stub(this.oController, "focusOnScanField");
        
        var oRemoveComponentStub = sandbox.stub(this.oController._oApplicationUtil, "removeComponent").resolves({});

        this.oController.onRemoveComponent(oEvent);
        
        assert.ok(oRemoveComponentStub.notCalled, "removeComponent() not called");
    });
    
    QUnit.test("onRemoveComponent: test handling removing a component when no components loaded", function (assert) {

        var oButton = {
            "data": function(sKey) {
                return "BRACKET";
            }
        };
        var oEvent = {
            "getSource": function() {
                return oButton;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                } else if (sKey === "/sfcAssemblyData") {
                    return UnitTestUtil.getSfcComponentsResponseData();
                } else if (sKey === "/resource") {
                    return "RES1";
                } else if (sKey === "/plant") {
                    return "P1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);
        sandbox.stub(this.oController, "focusOnScanField");
        
        var oFindComponentIndexStub = sandbox.stub(this.oController,"_findComponentIndex").returns(-1);

        var oRemoveComponentStub = sandbox.stub(this.oController._oApplicationUtil, "removeComponent").resolves({});

        this.oController.onRemoveComponent(oEvent);
        
        assert.ok(oFindComponentIndexStub.called, "_findComponentIndex() called");
        assert.ok(oRemoveComponentStub.notCalled, "removeComponent() not called");
    });
    
    QUnit.test("openCompletePromptDialog", function (assert) {
        var oViewStub = {
            getId: sandbox.stub(),
            addDependent: sandbox.spy()
        };

        this.oParentControlMock = {
                getId: sandbox.stub().returns("parent"),
                addDependent: sandbox.stub()
            };
        
        sandbox.stub(this.oController, "getView").returns(oViewStub);
    	this.oConfirmDialogMock = {
                open: sandbox.spy(),
                setModel: sandbox.spy(),
                getModel: sandbox.stub().returns( {} ),
                destroy: sandbox.stub(),
                setEscapeHandler: sandbox.stub()
            };    	
            var oFragmentStub = sandbox.stub(sap.ui, "xmlfragment").returns(this.oConfirmDialogMock);

            this.oController.openCompletePromptDialog(this.oParentControlMock);
            
            assert.ok(oViewStub.addDependent, "addDependent called on the view.");
            assert.ok(this.oConfirmDialogMock.setEscapeHandler.called, "setEscapeHandler method called.");
            assert.ok(oFragmentStub.called, "Fragment assignment made.");
    });
    
    QUnit.test("_handleConfirmDialogOK", function (assert) {
    	var oConfirmDialogCancelStub = sandbox.stub(this.oController, "_handleConfirmDialogCancel");
        sandbox.stub(this.oController, "focusOnScanField");
    	var oOnCompleteStub = sandbox.stub(this.oController, "onComplete");
    	
    	this.oController._handleConfirmDialogOK();
    	
    	assert.ok(oConfirmDialogCancelStub.called, "Cancel called.");
    	assert.ok(oOnCompleteStub.called, "OnComplete called.");
    });
    
    QUnit.test("_handleConfirmDialogCancel", function (assert) {
    	var oConfirmDialogMock = {
    			close: sinon.stub(),
    			destroy: sinon.stub()    			
    	};
    	this.oController._oConfirmDialog = oConfirmDialogMock;    	
    	var oRemoveDependentStub = sandbox.stub(this.oController, "getView").returns( { removeDependent: sinon.stub() } );
        sandbox.stub(this.oController, "focusOnScanField");
        
    	this.oController._handleConfirmDialogCancel();
    	
    	assert.ok(oRemoveDependentStub.called, "RemoveDependent called.")
    	assert.ok(oConfirmDialogMock.close.called, "ConfirmDialog close method called.")
    	assert.ok(oConfirmDialogMock.destroy.called, "ConfirmDialog destroy method called.")
    });
    
    QUnit.test("onComplete: test completing operation successfully", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return {"sfc": "SFC1"};
                } else if (sKey === "/operationData") {
                    return {"operation": "OPER1"};
                } else if (sKey === "/resource") {
                    return "RES1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);

        var oCompleteResults = {
            queuedOperation: "OPER2",
            sfcs: [ "SFC1" ]
        };

        var oCompleteStub = sandbox.stub(this.oController._oApplicationUtil, "completeSfc").resolves(oCompleteResults);

        // can't use sandbox for function call inside promise
        sinon.stub(this.oController, "navigateToPage");

        this.oController.onComplete()

        assert.ok(oCompleteStub.called, "completeSfc() called");
    });

    QUnit.test("onComplete: test Completing operation and get error", function (assert) {

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return {"sfc": "SFC1"};
                } else if (sKey === "/operationData") {
                    return {"operation": "OPER1"};
                } else if (sKey === "/resource") {
                    return "RES1";
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        
        var oError = {
            "message": "Some Error"
        };

        var oCompleteStub = sandbox.stub(this.oController._oApplicationUtil, "completeSfc").rejects(oError);

        // can't use sandbox for function call inside promise
        sinon.stub(this.oController, "_handleCompleteError");
        
        this.oController.onComplete();

        assert.ok(oCompleteStub.called, "completeSfc() called");
    });

    QUnit.test("_getMaterialImageUri: test getting material image on cloud", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/index.html";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);
        
        var sImageUri = "attachments/download/mat1?lang=en&resolution=124*124";
        
        var sResultUrl = this.oController._getMaterialImageUri(sImageUri);
        assert.equal(sResultUrl, sImageUri, "Image found in production");
    });

    QUnit.test("_getMaterialImageUri: test getting material image in local test", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/test/mock.html";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);
        
        var sImageUri = "attachments/download/mat1?lang=en&resolution=124*124";

        var sResultUrl = this.oController._getMaterialImageUri(sImageUri);
        assert.equal(sResultUrl, "./integration/mock/mockData/ain/lightbulb.png", "Image found in test mode");
    });

    QUnit.test("_getMaterialImageUri: test getting material image in local integration test", function (assert) {
        var sUrl = "https://localhost:5001/dme/assemblypod/test/integration/opaTests.qunit.html";
        sinon.stub(this.oController, "_getUrl").returns(sUrl);
        
        var sImageUri = "attachments/download/mat1?lang=en&resolution=124*124";

        var sResultUrl = this.oController._getMaterialImageUri(sImageUri);
        assert.equal(sResultUrl, "./mock/mockData/ain/lightbulb.png", "Image found in test mode");
    });

    QUnit.test("_refreshComponentList: Test refreshing component list data successfully", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {},
            "refresh": function() {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);
        
        var oModelSetPropertyStub = sandbox.stub(oGlobalModel, "setProperty");
        var oModelRefreshStub = sandbox.stub(oGlobalModel, "refresh");
        var oFocusOnScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");
        
        var aAssembleData = UnitTestUtil.getSfcComponentsResponseData();
        
        sandbox.stub(this.oController._oApplicationUtil, "getSfcAssemblyData").resolves(aAssembleData);
        
        return this.oController._refreshComponentList()
        .then(function () {
            assert.ok(oModelSetPropertyStub.called, "Global Model setProperty() called");
            assert.ok(oModelRefreshStub.called, "Global Model refresh() called");
            assert.ok(oFocusOnScanFieldStub.called, "focusOnScanField() called");
        }.bind(this));
    });
    
    QUnit.test("_refreshComponentList: Test refreshing component list data with error", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);
        
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {},
            "refresh": function() {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);
        
        var oShowMessageToastStub = sandbox.stub(this.oController, "showMessageToast");
        var oFocusOnScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");

        var oErrorObject = {
            message: "ERROR MESSAGE"
        };
        sandbox.stub(this.oController._oApplicationUtil, "getSfcAssemblyData").rejects(oErrorObject);
        
        return this.oController._refreshComponentList()
        .then(function () {
            assert.equal(oShowMessageToastStub.args[0][0].message, oErrorObject.message, "showMessageToast() called with correct error message");
            assert.ok(oFocusOnScanFieldStub.called, "focusOnScanField() called");
        }.bind(this));
    });
    
    QUnit.test("_showCompletePromptOnRefresh: Test displaying complete prompt", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcAssemblyData") {
                    return UnitTestUtil.getSfcComponentsResponseData();
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {},
            "refresh": function() {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);
        
        sandbox.stub(this.oController, "_isAllAssembled").returns(true);
        var oOpenCompleteDialogStub = sandbox.stub(this.oController, "openCompletePromptDialog");

        this.oController._showCompletePromptOnRefresh();

        assert.ok(oOpenCompleteDialogStub.called, "openCompletePromptDialog() called");

    });
    
    QUnit.test("_showCompletePromptOnRefresh: Test not displaying complete prompt", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcAssemblyData") {
                    return UnitTestUtil.getSfcComponentsResponseData();
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {},
            "refresh": function() {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);
        
        sandbox.stub(this.oController, "_isAllAssembled").returns(false);
        var oOpenCompleteDialogStub = sandbox.stub(this.oController, "openCompletePromptDialog");

        this.oController._showCompletePromptOnRefresh();

        assert.notOk(oOpenCompleteDialogStub.called, "openCompletePromptDialog() not called");
    });
    
    QUnit.test("_isAllAssembled: test all components assembled", function (assert) {
        var aComponents = [
            {
                "remainingQuantity": 0
            },
            {
                "remainingQuantity": 0
            },
            {
                "remainingQuantity": 0
            }
        ];
        assert.ok(this.oController._isAllAssembled(aComponents), "All components assembled");
    });

    QUnit.test("_isAllAssembled: test all components assembled", function (assert) {
        var aComponents = [
            {
                "remainingQuantity": 0
            },
            {
                "remainingQuantity": 5
            },
            {
                "remainingQuantity": 6
            }
        ];
        assert.notOk(this.oController._isAllAssembled(aComponents), "Not all components assembled");
    });

    QUnit.test("_isAllAssembled: test when no components defined", function (assert) {
        assert.notOk(this.oController._isAllAssembled([]), "No components loaded");
    });

    QUnit.test("focusOnScanField: test putting focus on Component Scan field with no callback", function (assert) {

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

    QUnit.test("focusOnScanField: test putting focus on Component Scan field with callback", function (assert) {

        var oScanField = {
            "focus": function() {}
        };

        var oGetViewStub = UnitTestUtil.getViewStub(sandbox, this.oController, oScanField, null, null);
        var oScanFieldSpy = sandbox.spy(oScanField, "focus");
        
        var oCallbackObject = {
            callbackFunction: function() {}
        };
        var oCallbackSpy = sandbox.spy(oCallbackObject, "callbackFunction");
        
        var oClock = sinon.useFakeTimers();
        
        this.oController.focusOnScanField(oCallbackObject.callbackFunction, oCallbackObject);

        assert.ok(oGetViewStub.calledOnce, "Controller getView() called once");
        assert.ok(oScanFieldSpy.notCalled, "expect focus() not called on scan field");
        assert.ok(oCallbackSpy.notCalled, "expect callback() not called");
        oClock.tick(500);
        assert.ok(oScanFieldSpy.called, "expect focus() called on scan field");
        assert.ok(oCallbackSpy.called, "expect callback() called");
        oClock.restore();
    });

    QUnit.test("onComponentSelectionChange: test selecting a row in component table", function (assert) {
        var oRowData = {
            component: "BRACKET"
        };
        var oBindingContext = {
            getObject: function() {
                return oRowData;
            }
        };
        var oSelectedItem = {
            getBindingContext: function() {
                return oBindingContext;
            }
        };
        var oTable = {
            getSelectedItem: function() {
                return oSelectedItem;
            }
        };

        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, oTable);
        
        var oSfcDataResponse = UnitTestUtil.getSfcResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oSfcData = oRequestProcessor.sfcResponseMapper(oSfcDataResponse);

        var oGlobalModel = {
            "getProperty": function(sKey) {
                if (sKey === "/sfcData") {
                    return oSfcData;
                }
                return null;
            },
            "setProperty": function(sKey, oValue) {}
        };
        sandbox.stub(this.oController._oApplicationUtil, "getGlobalModel").returns(oGlobalModel);
        this.oController.getView().setModel(oGlobalModel);

        var oShowAssembledDataPopoverStub = sandbox.stub(this.oController, "showAssembledDataPopover");

        this.oController.onComponentSelectionChange({});
        
        assert.ok(oShowAssembledDataPopoverStub.calledWith(oSelectedItem, oSfcData.sfc, oSfcData.operation, "BRACKET"), "showAssembledDataPopover() called");
    
    });
    
    QUnit.test("showAssembledDataPopover: test showing the assembled components data", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);

        var oResponseData = UnitTestUtil.getAssembledComponentsResponseData();
        var oRequestProcessor = this.oController._oApplicationUtil._oRequestProcessor;
        var oAssembledData = oRequestProcessor.assembledComponentsResponseMapper(oResponseData);
        
        sandbox.stub(this.oController._oApplicationUtil, "getAssembledComponentsData").resolves(oAssembledData);
        
        var oOpenPopoverStub = sandbox.stub(this.oController, "openAssembledDataPopover");

        return this.oController.showAssembledDataPopover({}, "SFC1", "OPER1", "BRACKET")
        .then(function () {
            assert.ok(oOpenPopoverStub.called, "openAssembledDataPopover() called");
        }.bind(this));
    });
    
    QUnit.test("showAssembledDataPopover: test when no assembled components data", function (assert) {
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        
        sandbox.stub(this.oController._oApplicationUtil, "getAssembledComponentsData").resolves([]);

        var oFocusOnScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");
        var oOpenPopoverStub = sandbox.stub(this.oController, "openAssembledDataPopover");

        return this.oController.showAssembledDataPopover({}, "SFC1", "OPER1", "BRACKET")
        .then(function () {
            assert.ok(oFocusOnScanFieldStub.called, "openAssembledDataPopover() called");
            assert.ok(oOpenPopoverStub.notCalled, "openAssembledDataPopover() not called");
        }.bind(this));
    });

    QUnit.test("openAssembledDataPopover: test creating / opening the popover", function (assert) {
        var oPopover = {
            openBy: function() {}
        };
        var oCreatePopoverStub = sandbox.stub(this.oController, "createAndOpenAssembledDataPopover");
        var oOpenPopoverSpy = sandbox.stub(oPopover, "openBy");
        
        this.oController.oAssembledDataPopover = null;
        this.oController.openAssembledDataPopover({});
        assert.ok(oCreatePopoverStub.called, "createAndOpenAssembledDataPopover() called");
        this.oController.oAssembledDataPopover = oPopover;
        this.oController.openAssembledDataPopover({});
        assert.ok(oOpenPopoverSpy.called, "openBy() called");
    });

    QUnit.test("createAndOpenAssembledDataPopover: test creating the popover", function (assert) {
        var oFragment = {
            openBy: function() {}
        };
        var oOpenPopoverStub = sandbox.stub(oFragment, "openBy");
        
        UnitTestUtil.getViewStub(sandbox, this.oController, null, null, null, null);
        sandbox.stub(Fragment, "load").resolves(oFragment);
        
        return this.oController.createAndOpenAssembledDataPopover({})
        .then(function () {
            assert.ok(oOpenPopoverStub.called, "openBy() called");
        }.bind(this));
    });

    QUnit.test("onAssembledDataPopoverClose: test handling focus after popover close", function (assert) {
        var oFocusOnScanFieldStub = sandbox.stub(this.oController, "focusOnScanField");
        this.oController._bAssembledDataPopoverOpening = false;
        this.oController.onAssembledDataPopoverClose({});
        assert.ok(oFocusOnScanFieldStub.called, "focusOnScanField() called");
        oFocusOnScanFieldStub.resetHistory();
        
        this.oController._bAssembledDataPopoverOpening = true;
        this.oController.onAssembledDataPopoverClose({});
        assert.ok(oFocusOnScanFieldStub.notCalled, "focusOnScanField() not called");
    });

});
