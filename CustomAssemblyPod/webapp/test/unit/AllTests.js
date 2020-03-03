
sap.ui.define([], function () {
    "use strict";

    // UI5 sets it to hidden, make the report not scrollable in Karma
    document.getElementsByTagName("html")[0].style.overflow = "auto";

    QUnit.module("Assembly POD Unit All", function () {
        sap.ui.require([
            "sap/ui/thirdparty/sinon-4",
            "sap/custom/assemblypod/test/unit/controller/BaseControllerTest",
            "sap/custom/assemblypod/test/unit/controller/MainViewControllerTest",
            "sap/custom/assemblypod/test/unit/controller/AssemblyViewControllerTest",
            "sap/custom/assemblypod/test/unit/controller/BarcodeControllerTest",
            "sap/custom/assemblypod/test/unit/util/ApplicationUtilTest",
            "sap/custom/assemblypod/test/unit/util/RequestProcessorTest",
            "sap/custom/assemblypod/test/unit/util/FormatterTest"
        ]);
    });
});
