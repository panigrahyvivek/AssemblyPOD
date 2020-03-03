sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/dm/dme/test/integration/pages/Arrangements",
    "sap/dm/dme/localService/DmeMockServer"
], function (Opa5, Arrangements, MockServer) {
    "use strict";

    QUnit.module("Assembly POD", function (hooks) {
        hooks.before(function (assert) {
            var loadingDone = assert.async();

            Opa5.extendConfig({
                arrangements: Arrangements.getInstance()
            });

            // This mock server is used when the app is started as Component by Karma
            MockServer.init({
                sManifestPath: "sap/custom/assemblypod/manifest.json",
                sMockServerConfigPath: "sap/custom/assemblypod/test/integration/mock/requestMapping.json",
                sMockDataFolderPath: "sap/custom/assemblypod/test/integration/mock/mockData/"
            });

            sap.ui.require([
                "sap/custom/assemblypod/test/integration/pages/AssemblyPodMainPage",
                "sap/custom/assemblypod/test/integration/pages/AssemblyPodAssemblyPage"
                // Placing the Journey within a callback will guarantee that the required files are loaded prior
                // to launching the Journey.
            ], function () {
                loadingDone();
            });
        });

        sap.ui.require([
            "sap/custom/assemblypod/test/integration/NavigationJourney",
            "sap/custom/assemblypod/test/integration/AssembleJourney"
        ]);
    });
});
