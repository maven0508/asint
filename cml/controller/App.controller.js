sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("com.mvn.util.controller.App", {
		onInit: function () {
			var oData = {
				sType : false,
				sMode : true,
				aClient : [{ key : "Asint DEV" },{ key : "Asint QA" },{ key : "Indorama" },{ key : "Covestro" }],
				sSourceDataStore: "",
				sSourceDefinition: "",
				sSourceReading: "",
				sDestinationDataStore: "",
				sDestinationDefinition: "",
				sDestinationReading: "",
				sPayload: "",
				sAjaxDataStoreUrl: "/asint/idms/v1/configuration/*sMode*/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
				sAjaxDefinitionPersonaUrl: "/asint/idms/v1/configuration/*sMode*/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/persona/*sPersonaId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
				sAjaxReadingPersonaUrl: "/asint/idms/v1/configuration/*sMode*/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/persona/*sPersonaId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
				sAjaxCallTemplate: "$.ajax({ type: 'POST', url: '*url*', contentType: 'application/json', data: '*payload*', }).done(function () { console.log('SUCCESS'); }).fail(function (msg) { console.log('FAIL'); }).always(function (msg) { console.log('ALWAYS'); });",
			};
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel, "mDataStore");
		},
		copyToClipboard: function (text) {
			var dummy = document.createElement("textarea");
			// to avoid breaking orgain page when copying more words
			// cant copy when adding below this code
			// dummy.style.display = 'none'
			document.body.appendChild(dummy);
			//Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
			dummy.value = text;
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
		},
		onUiAction: function (sType) {
			var mModel = this.getView().getModel("mDataStore");
			switch (sType) {
				case "reset":
					mModel.setProperty("/", {
						sMode : true,
						aClient : [{ key : "Asint DEV" },{ key : "Asint QA" },{ key : "Indorama" },{ key : "Covestro" }],
						sSourceDataStore: "",
						sSourceDefinition: "",
						sSourceReading: "",
						sDestinationDataStore: "",
						sDestinationDefinition: "",
						sDestinationReading: "",
						sPayload: "",
						sAjaxDataStoreUrl: "/asint/idms/v1/configuration/*sMode*/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
						sAjaxDefinitionPersonaUrl: "/asint/idms/v1/configuration/*sMode*/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/persona/*sPersonaId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
						sAjaxReadingPersonaUrl: "/asint/idms/v1/configuration/*sMode*/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/persona/*sPersonaId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
						sAjaxCallTemplate: "$.ajax({ type: 'POST', url: '*url*', contentType: 'application/json', data: '*payload*', }).done(function () { console.log('SUCCESS'); }).fail(function (msg) { console.log('FAIL'); }).always(function (msg) { console.log('ALWAYS'); });",
					});
					break;
				case "generatePayload":
					this.fnGeneratePayload();
					break;
				case "copyPayload":
					this.copyToClipboard(mModel.getProperty("/sPayload"));
					MessageBox.success("Payload copied to clipboard successfully");
					break;
			}
		},
		fnGeneratePayload: function () {
			var mModel = this.getView().getModel("mDataStore");
			var oTemp = {
				oSourceDatastore: JSON.parse(mModel.getProperty("/sSourceDataStore", "")),
				oSourceDefinition: JSON.parse(mModel.getProperty("/sSourceDefinition", "")),
				oSourceReading: JSON.parse(mModel.getProperty("/sSourceReading", "")),
				oDestinationDatastore: JSON.parse(mModel.getProperty("/sDestinationDataStore", "")),
				oDestinationDefinition: JSON.parse(mModel.getProperty("/sDestinationDefinition", "")),
				oDestinationReading: JSON.parse(mModel.getProperty("/sDestinationReading", "")),
				oDatastore: {
					locationTemplateId: "",
					dataSourceList: [],
					objectType: "",	
					readingCount : 0
				},
				oDefinition: {
					refList: [],
					sectionList: [],
					apiList: [],
					personaId: ""
				},
				oReading: {
					refList: [],
					sectionList: [],
					apiList: [],
					personaId: ""
				}
			};
			
			// set sMode EQU / FL
			var sEquFl = "";
			if(mModel.getProperty("/sMode")){
				sEquFl = "equipment";
			}else{
				sEquFl = "functionallocation";
			}

			// Override Destination Datasource and Object Type
			oTemp.oDatastore.locationTemplateId = oTemp.oDestinationDatastore.locationTemplateId;
			oTemp.oDatastore.dataSourceList = oTemp.oSourceDatastore.dataSourceList;
			oTemp.oDatastore.objectType = sEquFl === "equipment" ? "EQU" : "FL";

			// Override Destiation Definition Persona {apiList, refList, sectionList}
			oTemp.oDefinition.apiList = oTemp.oSourceDefinition.personaDetail.apiList;
			oTemp.oDefinition.refList = oTemp.oSourceDefinition.personaDetail.refList;
			oTemp.oDefinition.sectionList = oTemp.oSourceDefinition.personaDetail.sectionList;
			oTemp.oDefinition.personaId = oTemp.oDestinationDefinition.personaId ? oTemp.oDestinationDefinition.personaId : oTemp.oDestinationDefinition.personaDetail.personaId;

			// Override Reading Definition Persona {apiList, refList, sectionList}
			oTemp.oReading.apiList = oTemp.oSourceReading.personaDetail.apiList;
			oTemp.oReading.refList = oTemp.oSourceReading.personaDetail.refList;
			oTemp.oReading.sectionList = oTemp.oSourceReading.personaDetail.sectionList;
			oTemp.oReading.personaId = oTemp.oDestinationReading.personaId ? oTemp.oDestinationReading.personaId : oTemp.oDestinationReading.personaDetail.personaId;

			// Preparing Request URL 
			var sEquipmentTemplateId = oTemp.oDestinationDatastore.equipmentTemplateId ? oTemp.oDestinationDatastore.equipmentTemplateId : oTemp.oDestinationDefinition.equipmentTemplateId ? oTemp.oDestinationDefinition.equipmentTemplateId : oTemp.oDestinationReading.equipmentTemplateId,
				sEquipmentTemplateVersion = oTemp.oDestinationDatastore.equipmentTemplateVersion ? oTemp.oDestinationDatastore.equipmentTemplateVersion : oTemp.oDestinationDefinition.equipmentTemplateVersion ? oTemp.oDestinationDefinition.equipmentTemplateVersion : oTemp.oDestinationReading.equipmentTemplateVersion,
				sLocationTemplateId = oTemp.oDestinationDatastore.locationTemplateId,
				sDefinitionPersonaId = oTemp.oDestinationDefinition.personaId ? oTemp.oDestinationDefinition.personaId : oTemp.oDestinationDefinition.personaDetail.personaId,
				sReadingPersonaId = oTemp.oDestinationReading.personaId ? oTemp.oDestinationReading.personaId : oTemp.oDestinationReading.personaDetail.personaId;

			// Datastore
			var sTemp = "";
			sTemp = JSON.parse(JSON.stringify(mModel.getProperty("/sAjaxDataStoreUrl")));
			sTemp = sTemp.replace("*sEquipmentTemplateId*", sEquipmentTemplateId);
			sTemp = sTemp.replace("*sLocationTemplateId*", sLocationTemplateId);
			sTemp = sTemp.replace("*sEquipmentTemplateVersion*", sEquipmentTemplateVersion);
			sTemp = sTemp.replace("*sMode*",sEquFl);
			mModel.setProperty("/sAjaxDataStoreUrl", sTemp);

			// Definition
			sTemp = "";
			sTemp = JSON.parse(JSON.stringify(mModel.getProperty("/sAjaxDefinitionPersonaUrl")));
			sTemp = sTemp.replace("*sEquipmentTemplateId*", sEquipmentTemplateId);
			sTemp = sTemp.replace("*sLocationTemplateId*", sLocationTemplateId);
			sTemp = sTemp.replace("*sEquipmentTemplateVersion*", sEquipmentTemplateVersion);
			sTemp = sTemp.replace("*sPersonaId*", sDefinitionPersonaId);
			sTemp = sTemp.replace("*sMode*",sEquFl);
			mModel.setProperty("/sAjaxDefinitionPersonaUrl", sTemp);

			// Reading
			sTemp = "";
			sTemp = JSON.parse(JSON.stringify(mModel.getProperty("/sAjaxReadingPersonaUrl")));
			sTemp = sTemp.replace("*sEquipmentTemplateId*", sEquipmentTemplateId);
			sTemp = sTemp.replace("*sLocationTemplateId*", sLocationTemplateId);
			sTemp = sTemp.replace("*sEquipmentTemplateVersion*", sEquipmentTemplateVersion);
			sTemp = sTemp.replace("*sPersonaId*", sReadingPersonaId);
			sTemp = sTemp.replace("*sMode*",sEquFl);
			mModel.setProperty("/sAjaxReadingPersonaUrl", sTemp);

			// Appending Final Payload
			sTemp = "";
			sTemp = mModel.getProperty("/sAjaxCallTemplate");
			sTemp = sTemp.replace("*url*", mModel.getProperty("/sAjaxDataStoreUrl"));
			sTemp = sTemp.replace("*payload*", JSON.stringify(oTemp.oDatastore));
			mModel.setProperty("/sPayload", mModel.getProperty("/sPayload") + sTemp);

			sTemp = "";
			sTemp = mModel.getProperty("/sAjaxCallTemplate");
			sTemp = sTemp.replace("*url*", mModel.getProperty("/sAjaxDefinitionPersonaUrl"));
			sTemp = sTemp.replace("*payload*", JSON.stringify(oTemp.oDefinition));
			mModel.setProperty("/sPayload", mModel.getProperty("/sPayload") + sTemp);

			if(mModel.getProperty("/sType")){
			sTemp = "";
			sTemp = mModel.getProperty("/sAjaxCallTemplate");
			sTemp = sTemp.replace("*url*", mModel.getProperty("/sAjaxReadingPersonaUrl"));
			sTemp = sTemp.replace("*payload*", JSON.stringify(oTemp.oReading));
			mModel.setProperty("/sPayload", mModel.getProperty("/sPayload") + sTemp);
			}

		}
	});
});
