/*global QUnit*/

sap.ui.define([
	"sap/custom/assemblypod/controller/BaseController",
    "sap/custom/assemblypod/test/unit/UnitTestUtil",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, UnitTestUtil, MessageBox, MessageToast) {
	"use strict";

    var sandbox = sinon.createSandbox();

    QUnit.module("BaseController tests", {
        beforeEach: function () {
            this.oController = new Controller();
            UnitTestUtil.getOwnerComponentStub(sandbox, this.oController);
        },

        afterEach: function () {
            this.oController.destroy();
            this._oGetOwnerStub = null;
            sandbox.restore();
        }
    });

    QUnit.test("onInit: test initialization of controller", function (assert) {
        
        this.oController.onInit();
        
        assert.ok(this.oController._oApplicationUtil, "ApplicationUtil() instantiated");
    });

    QUnit.test("navigateToPage: test navigation to a page with string page name input", function (assert) {

        var oRouter = {
            navTo: function(sPage, oData, bValue) {}
        };
        sandbox.stub(this.oController, "getRouter").returns(oRouter);
        var oNavToSpy = sandbox.spy(oRouter, "navTo");
        
        this.oController.navigateToPage("AssemblyPage", {}, false);

        assert.ok(oNavToSpy.called, "Router.navTo() called");
    });

    QUnit.test("navigateToPage: test navigation to a page with event object input", function (assert) {

        var oRouter = {
            navTo: function(sPage, oData, bValue) {}
        };
        sandbox.stub(this.oController, "getRouter").returns(oRouter);
        var oNavToSpy = sandbox.spy(oRouter, "navTo");
        
        this.oController.navigateToPage({"event": "OBJECT"});

        assert.ok(oNavToSpy.notCalled, "Router.navTo() not called");
    });

    QUnit.test("showMessageToast: test displaying a MessageToast", function (assert) {
        var oMessage = {
            "message": "This is the message"
        };
        var oMessageToastStub = sandbox.stub(MessageToast, "show");
        
        var oGetMessageSpy = sandbox.spy(this.oController, "getMessage");

        this.oController.onInit();
        this.oController.showMessageToast(oMessage);

        assert.deepEqual(oGetMessageSpy.args[0][0], oMessage, "getMessage() called with correct value");
        assert.equal(oGetMessageSpy.returnValues[0], oMessage.message, "getMessage() returned correct value");
        assert.equal(oMessageToastStub.args[0][0], oMessage.message, "MessageToast.show() called with correct value");
    });

    QUnit.test("showErrorMessage: test displaying a MessageBox", function (assert) {
        var oMessage = {
            "message": "This is the message"
        };
        var oMessageBoxStub = sandbox.stub(MessageBox, "error");
        
        var oGetMessageSpy = sandbox.spy(this.oController, "getMessage");

        this.oController.onInit();
        this.oController.showErrorMessage(oMessage);

        assert.deepEqual(oGetMessageSpy.args[0][0], oMessage, "getMessage() called with correct value");
        assert.equal(oGetMessageSpy.returnValues[0], oMessage.message, "getMessage() returned correct value");
        assert.equal(oMessageBoxStub.args[0][0], oMessage.message, "MessageBox.error() called with correct value");
    });

    QUnit.test("showInformationMessage: test displaying a MessageBox", function (assert) {
        var oMessage = {
            "message": "This is the message"
        };
        var oMessageBoxStub = sandbox.stub(MessageBox, "information");
        
        var oGetMessageSpy = sandbox.spy(this.oController, "getMessage");

        this.oController.onInit();
        this.oController.showInformationMessage(oMessage);

        assert.deepEqual(oGetMessageSpy.args[0][0], oMessage, "getMessage() called with correct value");
        assert.equal(oGetMessageSpy.returnValues[0], oMessage.message, "getMessage() returned correct value");
        assert.equal(oMessageBoxStub.args[0][0], oMessage.message, "MessageBox.information() called with correct value");
    });
    
    QUnit.test("getMessage: test converting error object to string", function (assert) {
        
        this.oController.onInit();
        
        sandbox.stub(this.oController._oApplicationUtil, "getI18nText").returns("unknown error");
        
        assert.equal(this.oController.getMessage(null), "unknown error", "getMessage() returned unknown error");

        var oError = {"message": "Error message"};
        assert.equal(this.oController.getMessage(oError), "Error message", "getMessage() returned correct message");

        oError = ["Error Message1","Error Message2", "ErrorMesasge3"];
        var sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oController.getMessage(oError), sResult, "getMessage() returned correct array of messages");

        oError = {
            "message": ["Error Message1","Error Message2", "ErrorMesasge3"]
        };
        sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oController.getMessage(oError), sResult, "getMessage() returned correct array of messages");

        oError = {
            "error": {
                "message": ["Error Message1","Error Message2", "ErrorMesasge3"]
            }
        };
        sResult = "Error Message1\nError Message2\nErrorMesasge3";
        assert.equal(this.oController.getMessage(oError), sResult, "getMessage() returned array of messages");

        oError = {
            "error": {
                "message": "Error Message"
            }
        };
        assert.equal(this.oController.getMessage(oError), "Error Message", "getMessage() returned 'correct message");

        assert.equal(this.oController.getMessage("Error Message"), "Error Message", "getMessage() returned correct message");

        assert.equal(this.oController.getMessage({"badtype": "xxx"}), "unknown error", "getMessage() returned unknown error");
    });
});
