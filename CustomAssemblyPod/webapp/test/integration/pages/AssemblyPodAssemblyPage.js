sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/custom/assemblypod/test/integration/pages/AssemblyPodPage"
], function (Opa5, Press, AssemblyPodPage) {
    "use strict";

    Opa5.createPageObjects({
        onTheAssemblyPage: {
            baseClass: AssemblyPodPage,
            viewName: "sap.custom.assemblypod.view.AssemblyView",
            actions: {
                iPressTheBreadcrumbLink: function (sBreadcrumbId, iIndex) {
                    return this.waitFor({
                        id: sBreadcrumbId,
                        success: function (oBreadcrumbs) {
                            var oLink = oBreadcrumbs.getLinks()[iIndex];
                            new Press().executeOn(oLink);
                        },
                        autoWait: true
                    });
                },

                iEnterBarcodeValue: function (sId, sBarcodeValue) {
                    return this.waitFor({
                        id: sId,
                        success: function (oInputField) {
                            oInputField.setValue(sBarcodeValue);
                            oInputField.fireChange({value: sBarcodeValue});
                        },
                        autoWait: true
                    });
                },

                iPressOnButtonInConfirmDialog: function (sButtonId) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        success: function (aContent) {
                            if (aContent && aContent.length > 0) {
                                for (var i = 0; i <  aContent.length; i++) {
                                    if (aContent[i].getId() === sButtonId) {
                                        aContent[i].firePress();
                                        break;
                                    }
                                }
                            }
                        }
                    });
                },

                iPressOnTheComponentRemoveButton: function (sTableId, iPosition, iCellIndex) {
                    return this.waitFor({
                        id: sTableId,
                        success: function (oTable) {
                            var oButtonControl = oTable.getItems()[iPosition-1].getCells()[iCellIndex];
                            new Press().executeOn(oButtonControl);
                        }
                    });
                }
            },
            assertions: {
                theTableListItemHasHighlightWithValue: function (sTableId, iPosition, sExpectedHighlight) {
                    return this.waitFor({
                        id: sTableId,
                        success: function (oTable) {
                            var oObjectListItem = oTable.getItems()[iPosition - 1];
                            var sHighlight = oObjectListItem.getHighlight();
                            var sMsg = "The list with id '" + sTableId + "' has an item at position " + iPosition + " with highlight value of " + sExpectedHighlight;
                            Opa5.assert.ok(sHighlight === sExpectedHighlight, sMsg);
                        },
                        autoWait: true
                    });
                }
            }
        }
    });
});
