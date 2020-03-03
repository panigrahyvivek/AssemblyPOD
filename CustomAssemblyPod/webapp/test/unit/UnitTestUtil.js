/**
 * This class provides static convenience functions for unit tests.
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/util/FileAccess"
], function (JSONModel, FileAccess) {
    return {
        TEST_URI: "test_uri",
        TEST_I18N_KEY: "TEST1",
        TEST_I18N_VALUE: "VALUE1",
        
        getViewStub: function (sandbox, oController, oScanField, oBreadcrumb, oLink, oDefaultControl) {
            var oModel = {
                "setProperty": function(sName, oValue) {
                    if (sName === "/workCenter") {
                        this._sWorkCenter = oValue;
                    } else if (sName === "/resource") {
                        this._sResource = oValue;
                    } else if (sName === "/plant") {
                        this._sPlant = oValue;
                    }
                },
                "getProperty": function(sName) {
                    if (sName === "/workCenter") {
                        return this._sWorkCenter;
                    } else if (sName === "/resource") {
                        return this._sResource;
                    } else if (sName === "/plant") {
                        return this._sPlant;
                    }
                    return null;
                }
            };
            var oView = {
                "byId": function(sId) {
                    if (sId === "scanField" || sId === "scanComponent") {
                        return oScanField;
                    } else if (sId === "headerBreadcrumb") {
                        return oBreadcrumb;
                    } else if (sId === "headerPageDescription") {
                        return oLink;
                    } else if (oDefaultControl) {
                        return oDefaultControl;
                    }
                    return null;
                },
                "setModel": function(oModel) {
                    this._oModel = oModel;
                },
                "getModel": function() {
                    return this._oModel;
                },
                "addDependent": function() {}
            };
            oView.setModel(oModel);
            
            return sandbox.stub(oController, "getView").returns(oView);
        },
        
        getOwnerComponent: function () {
            var oRouter = {
                "navTo": function(sPage, oData, bValue) {}
            };
            var oOwner = {
                "setRouter": function(oRouter) {
                    this._oRouter = oRouter;
                },
                "getRouter": function() {
                    return this._oRouter;
                },
                "getManifestEntry": function(sKey) {
                    return "test_uri";
                },
                "getGlobalModel": function() {
                    return new JSONModel();
                }
            };
            oOwner.setRouter(oRouter);
            
            return oOwner;
        },
        
        getOwnerComponentStub: function (sandbox, oController) {
            var oOwner = this.getOwnerComponent();
            return sandbox.stub(oController, "getOwnerComponent").returns(oOwner);
        },
        
        getI18nResourceBundleStub: function (sandbox, oController) {
            var oResourceBundle = {
                "getText": function(sKey, aArgs) {
                    if (sKey === "TEST1") {
                        return "VALUE1";
                    }
                    return sKey;
                }
            };
            return sandbox.stub(oController, "getI18nResourceBundle").returns(oResourceBundle);
        },
        
        getSfcResponseData: function (bEmptyResponse, sStatusCode, sStatusText) {
            if (typeof bEmptyResponse !== "undefined" && bEmptyResponse) {
                return {};
            }
            var oSfcData = FileAccess.getJson("sap/custom/assemblypod/test/integration/mock/mockData/sfcs/sfc1.json");
            oSfcData.status.code = "401";
            oSfcData.status.name = "New";
            if (jQuery.trim(sStatusCode)) {
                oSfcData.status.code = sStatusCode;
                oSfcData.status.name = sStatusText;
            }
            return oSfcData;
        },
        
        getSfcComponentsResponseData: function () {
            return [
                {
                    "plant": "P1",
                    "component": "BRACKET",
                    "componentVersion": "A",
                    "componentDescription": "BRACKET Component",
                    "requiredQuantity": 2,
                    "remainingQuantity": 2,
                    "assembledQuantity": 0,
                    "componentSequence": 10,
                    "unitOfMeasure": "",
                    "assemblyDataType": ""
                },
                {
                    "plant": "P1",
                    "component": "COMP2",
                    "componentVersion": "B",
                    "componentDescription": "Component #2",
                    "requiredQuantity": 5,
                    "remainingQuantity": 5,
                    "assembledQuantity": 0,
                    "componentSequence": 20,
                    "unitOfMeasure": "",
                    "assemblyDataType": ""
                }
            ];
        },
        
        getAssembledComponentsResponseData: function () {
            return [
                {
                    "assemblyId": "1",
                    "component": "BRACKET",
                    "componentVersion": "A",
                    "description": "BRACKET Component",
                    "assembledQuantity": 2,
                    "assembledDate": "2020-01-10 18:58:24",
                    "unitOfMeasure": "EA",
                    "assemblyDataFields": [
                        {
                            "fieldName": "SERIAL_NUMBER",
                            "fieldValue": "1234-4567-00-ES"
                        },
                        {
                            "fieldName": "LOT_NUMBER",
                            "fieldValue": "002-001_LOT"
                        },
                        {
                            "fieldName": "LOT_NUMBER",
                            "fieldValue": "VL-000010200231"
                        },
                        {
                            "fieldName": "COMMENTS",
                            "fieldValue": "Barcode 1"
                        }
                    ]
                }
            ];
        },
        
        getMaterialFileAttachmentsResponseData: function () {
            return {
                "@odata.context": "$metadata#Materials(bom(bom,version),assemblyDataType(dataType),routing(routing,version),removalComponentDataType(dataType),inventoryDataType(dataType))/$entity",
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
        },
        
        getMaterialFileImageResponseData: function () {
            return {
                "d": {
                    "__metadata": {
                        "id": "https://dm-internal-ain-milestone-ain.cfapps.eu10.hana.ondemand.com:443/ain/odata.svc/GetAllDocuments('FC6832F039F94F3186F0814D9B689ED3')",
                        "uri": "https://dm-internal-ain-milestone-ain.cfapps.eu10.hana.ondemand.com:443/ain/odata.svc/GetAllDocuments('FC6832F039F94F3186F0814D9B689ED3')",
                        "type": "ODataEntities.GetAllDocuments"
                    },
                    "documentID": "FC6832F039F94F3186F0814D9B689ED3",
                    "name": "lightbulb.png",
                    "description": "Lightbulb",
                    "mimeGroup": "Image",
                    "mimeGroupCode": "2"
                }
            };
        }
    };
});
