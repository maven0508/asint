sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller,JSONModel,MessageBox) {
	"use strict";

	return Controller.extend("com.mvn.util.controller.Test", {
		onInit: function () {
            var oData = {
                sOldDestinationDsPayload : "",
                sOldDestinationPPayload : "",
                sSourceDsPayload : "",
                sSourcePPayload : "",
                sAjaxDataStoreUrl :"/asint/idms/v1/configuration/functionallocation/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
                sAjaxPersonaUrl :"/asint/idms/v1/configuration/functionallocation/template/*sEquipmentTemplateId*/location/template/*sLocationTemplateId*/persona/*sPersonaId*/data?equipmentTemplateVersion=*sEquipmentTemplateVersion*&uomsystem=metric",
                sAjaxCallTemplate : "$.ajax({ type: 'POST', url: '*url*', contentType: 'application/json', data: '*payload*', }).done(function () { console.log('SUCCESS'); }).fail(function (msg) { console.log('FAIL'); }).always(function (msg) { console.log('ALWAYS'); });",
                sPayload : ""
            };
             var oModel = new JSONModel(oData);
             this.getView().setModel(oModel,"mDataStore");
        },
        onUiAction: function(sType){
            var mModel = this.getView().getModel("mDataStore");
            switch(sType){
                case "new":
                    mModel.setProperty("/sOldDestinationDsPayload","");
                    mModel.setProperty("/sOldDestinationPPayload","");
                    mModel.setProperty("/sSourceDsPayload","");
                    mModel.setProperty("/sSourcePPayload","");
                    mModel.setProperty("/sPayload","");                    
                    break;
                case "clearOp":
                    mModel.setProperty("/sSourceDsPayload","");
                    mModel.setProperty("/sSourcePPayload","");
                    break; 
                case "clearNp":
                    mModel.setProperty("/sPayload","");
                    break;
                case "generatePayload":
                        this.fnGeneratePayload(mModel.getProperty("/sOldDestinationDsPayload"),mModel.getProperty("/sOldDestinationPPayload"),
                        mModel.getProperty("/sSourceDsPayload"),mModel.getProperty("/sSourcePPayload"));
                    break; 
                case "copyPayload":
                        this.copyToClipboard(mModel.getProperty("/sPayload"));
                        MessageBox.success("Payload copied to clipboard successfully");
                    break;
            }
        },

        copyToClipboard : function (text) {
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

        fnGeneratePayload: function(sOldDesDsPayload,sOldDesPPayload,sSourceDsPayload,sSourcePPayload){
            var mModel = this.getView().getModel("mDataStore");
            var oTemp = {
                oDSPayload : JSON.parse(sOldDesDsPayload),
                oPPayload: JSON.parse(sOldDesPPayload),
                oSrcDSPayload : JSON.parse(sSourceDsPayload),
                oSrcPPayload : JSON.parse(sSourcePPayload)
            }
            oTemp.oDSPayload.dataSourceList = oTemp.oSrcDSPayload.dataSourceList;
            oTemp.oDSPayload.objectType = oTemp.oSrcDSPayload.objectType;
            oTemp.oPPayload.apiList = oTemp.oSrcPPayload.personaDetail.apiList;
            oTemp.oPPayload.personaId = oTemp.oPPayload.personaId;
            oTemp.oPPayload.refList = oTemp.oSrcPPayload.personaDetail.refList;
            oTemp.oPPayload.sectionList = oTemp.oSrcPPayload.personaDetail.sectionList;
            debugger;

            var tempVar = mModel.getProperty("/sAjaxDataStoreUrl");
            tempVar = tempVar.replace("*sEquipmentTemplateId*",oTemp.oPPayload.equipmentTemplateId);
            tempVar = tempVar.replace("*sLocationTemplateId*",oTemp.oDSPayload.locationTemplateId);
            tempVar = tempVar.replace("*sEquipmentTemplateVersion*",oTemp.oPPayload.equipmentTemplateVersion);
            mModel.setProperty("/sAjaxDataStoreUrl",tempVar);

            tempVar = mModel.getProperty("/sAjaxPersonaUrl");
            tempVar = tempVar.replace("*sEquipmentTemplateId*",oTemp.oPPayload.equipmentTemplateId);
            tempVar = tempVar.replace("*sLocationTemplateId*",oTemp.oDSPayload.locationTemplateId);
            tempVar = tempVar.replace("*sEquipmentTemplateVersion*",oTemp.oPPayload.equipmentTemplateVersion);
            tempVar = tempVar.replace("*sPersonaId*",oTemp.oPPayload.personaId);
            mModel.setProperty("/sAjaxPersonaUrl",tempVar);

                //delete
                delete(oTemp.oDSPayload.changedBy);
                delete(oTemp.oDSPayload.changedOn);
                delete(oTemp.oDSPayload.createdBy);
                delete(oTemp.oDSPayload.createdOn);
                delete(oTemp.oDSPayload.deleted);
                delete(oTemp.oDSPayload.equipmentTemplateId);
                delete(oTemp.oDSPayload.equipmentTemplateVersion); 
                delete(oTemp.oPPayload.deleted);
                delete(oTemp.oPPayload.objectType);
                delete(oTemp.oPPayload.equipmentTemplateId);
                delete(oTemp.oPPayload.equipmentTemplateVersion);
                delete(oTemp.oPPayload.personaDetail);
          

            
            // DS Paload Generation
            tempVar = mModel.getProperty("/sAjaxCallTemplate");
            tempVar = tempVar.replace("*url*",mModel.getProperty("/sAjaxDataStoreUrl"));
            tempVar = tempVar.replace("*payload*",JSON.stringify(oTemp.oDSPayload));
            mModel.setProperty("/sPayload",mModel.getProperty("/sPayload") + tempVar);

            // P Paload Generation
            tempVar = mModel.getProperty("/sAjaxCallTemplate");
            tempVar = tempVar.replace("*url*",mModel.getProperty("/sAjaxPersonaUrl"));
            tempVar = tempVar.replace("*payload*",JSON.stringify(oTemp.oPPayload));
            mModel.setProperty("/sPayload",mModel.getProperty("/sPayload") + tempVar);

            
        }
	});
});
