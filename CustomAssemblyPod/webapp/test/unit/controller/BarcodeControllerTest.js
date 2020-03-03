sap.ui.require(
	[
		"sap/custom/assemblypod/controller/Barcode.controller"
	],
	function(Barcode) {
		"use strict";
		
	    QUnit.module("Barcode Controller tests", {

	    });
		
		var barcodeData = "[)>06{GS}11ZThis is a test{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1FCSFC123{GS}1ISABCDEF{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{RS}{EOT}";
		
		QUnit.test("parseBarcode_isComponent", function(assert) {
			var result = Barcode.parseBarcode(barcodeData);
			
			assert.equal(result.component, "BRACKET", "The component of 'BRACKET' was found.");
			assert.equal(result.dataFields[0].fieldName, "SERIAL_NUMBER", "The dataType of 'SERIAL_NUMBER' was found.");
			assert.equal(result.dataFields[0].fieldValue, "1234-4567-00-ES", "The dataTypeValue of '1234-4567-00-ES' was found.");
			assert.equal(result.isComponent, true, "The parsing action determined that the barcode scan is indeed a component to be assembled.");
		});
		
		QUnit.test("parseBarcode_NotAComponent", function(assert) {
			var barcodeData = "123456";
			var result = Barcode.parseBarcode(barcodeData);
			
			assert.equal(result.component, null, "No component was found.");
			assert.equal(result.dataType, null, "The dataType was not found");
			assert.equal(result.dataTypeValue, null, "The dataTypeValue is null");
			assert.equal(result.isComponent, false, "The parsing action determined that the barcode scan is NOT a component to be assembled.");
		});
		
		QUnit.test("_getISO15434ScanData_hasRS", function(assert) {
			var result = Barcode._getISO15434ScanData(barcodeData);
			
			var hasHeader = result.indexOf("[)>");
			var hasEOT = result.indexOf("{EOT}");
			var hasGS = result.indexOf("{GS}");
			assert.equal(hasHeader, -1, "Header should not be found");
			assert.equal(hasEOT, -1, "End of Text, '{EOT}', should not be found");
			assert.ok(hasGS>-1, "A Group Separator '{GS}' should be found");
		});
		
		QUnit.test("_getISO15434ScanData_NoRS", function(assert) {
			var barcodeData1 = "[)>06{GS}11ZThis is a test{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{EOT}";
			var result = Barcode._getISO15434ScanData(barcodeData1);
			
			var hasHeader = result.indexOf("[)>");
			var hasEOT = result.indexOf("{EOT}");
			var hasRS = result.indexOf("{RS}");
			var hasGS = result.indexOf("{GS}");
			assert.equal(hasHeader, -1, "Header should not be found");
			assert.equal(hasEOT, -1, "End of Text, '{EOT}', should not be found");
			assert.equal(hasRS, -1, "Record Separator, '{RS}', should not be found");
			assert.ok(hasGS>-1, "A Group Separator '{GS}' should be found");
		});
		
		QUnit.test("_parseScanElements_checkLength", function(assert) {
			var scanElements = Barcode._getISO15434ScanData(barcodeData);
			var arrayElements = Barcode._parseScanElements(scanElements);
			
			assert.equal(arrayElements.length, 13, "Array Elements are the correct size");
		});
		
		QUnit.test("_parseScanElements_NoArray", function(assert) {
			var scanElements = Barcode._getISO15434ScanData("somedata");
			var arrayElements = Barcode._parseScanElements(scanElements);
			
			assert.equal(arrayElements, null, "Array Elements are null");
		});
		
		QUnit.test("_translateData", function(assert) {
			var barcodeData2 = "[)>06{GS}11ZThis is a test{GS}19PBRACKET{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1FCSFC123{GS}1ISABCDEF{GS}{RS}{EOT}";
			var scanElements = Barcode._getISO15434ScanData(barcodeData2);
			var arrayElements = Barcode._parseScanElements(scanElements);
			
			var result = Barcode._translateData(arrayElements)                     ;
			
			assert.equal(result.component, "BRACKET", "The component of 'BRACKET' was found.");
			assert.equal(result.dataFields[0].fieldName, "SERIAL_NUMBER", "The dataType of 'SERIAL_NUMBER' was found.");
			assert.equal(result.dataFields[0].fieldValue, "1234-4567-00-ES", "The dataTypeValue of '1234-4567-00-ES' was found.");
			
			assert.equal(result.dataFields[1].fieldName, "COMMENTS", "The dataType of 'COMMENTS' was found.");
			assert.equal(result.dataFields[1].fieldValue, "This is a test", "The dataTypeValue of 'This is a test' was found.");
			
			assert.equal(result.dataFields[2].fieldName, "SFC", "The dataType of 'SFC' was found.");
			assert.equal(result.dataFields[2].fieldValue, "SFC123", "The dataTypeValue of 'SFC123' was found.");
			
			assert.equal(result.dataFields[3].fieldName, "INVENTORY_ID_SFC", "The dataType of 'INVENTORY_ID_SFC' was found.");
			assert.equal(result.dataFields[3].fieldValue, "ABCDEF", "The dataTypeValue of 'ABCDEF' was found.");
			
		});
		
		QUnit.test("_translateData_InvalidDataFormat", function(assert) {
			var barcodeData1 = "[)>07{GS}11ZThis is a test{GS}19PBRACKET{GS}26PPART_0001{GS}T002-001_LOT{GS}15S1234-4567-00-ES{GS}KPO-001-0003993{GS}1WRCO-0003-003939923{GS}VVENDOR_1{GS}D12122009{GS}TVL-000010200231{EOT}";
			var scanElements = Barcode._getISO15434ScanData(barcodeData1);
			var arrayElements = Barcode._parseScanElements(scanElements);
			
			var result = Barcode._translateData(arrayElements);
			
			assert.equal(result, null, "Data Format is incorrect (07) and therefore not supported");
		});
		
		
		QUnit.test("_addDataField", function(assert) {
			var aDataFields = [];
			var sDataField = "SOME_DATA_FIELD";
			var sValue = "SOMEVALUE";
			
			aDataFields = Barcode._addDataField(aDataFields, sDataField, sValue);
			
			assert.equal(aDataFields[0].fieldName, sDataField , "The field name is correct");
			assert.equal(aDataFields[0].fieldValue, sValue , "The field value is correct");
		});
		
	});