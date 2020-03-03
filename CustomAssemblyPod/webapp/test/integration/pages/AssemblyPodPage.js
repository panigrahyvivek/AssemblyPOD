sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/dm/dme/test/integration/pages/BasePage"
], function (Opa5, BasePage) {
    "use strict";

    return BasePage.extend("sap.custom.assemblypod.test.integration.pages.AssemblyPodPage", {
        // ********** Actions *******

        // ********** Assertions
        iShouldSeeTheField: function (sId) {
            return this.theFieldIsDisplayed(sId);
        },
        iShouldSeeTextValue: function (sId, sValue) {
            return this.theControlPropertyShouldHaveValue(sId, "text", sValue);
        },
        iShouldSeeADialog: function (sAssertMessage) {
            return this.waitFor({
                pollingInterval: 100,
                check: function () {
                    return !!sap.ui.test.Opa5.getJQuery()(".sapMDialog").length;
                },
                success: function () {
                    var sMessage = "Found a Dialog";
                    if (typeof sAssertMessage !== "undefined" && sAssertMessage !== "") {
                        sMessage = sAssertMessage;
                    }
                    Opa5.assert.ok(true, sMessage);
                }/* do not use autoWait - it causes message box to not close ,
                autoWait : true */
            });
        }
    });
});
