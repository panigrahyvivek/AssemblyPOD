sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/custom/assemblypod/test/integration/pages/AssemblyPodPage"
], function (Opa5, AssemblyPodPage) {
    "use strict";

    Opa5.createPageObjects({
        onTheMainViewPage: {
            baseClass: AssemblyPodPage,
            viewName: "sap.custom.assemblypod.view.MainView",
            actions: {
            },
            assertions: {
            }
        }
    });
});
