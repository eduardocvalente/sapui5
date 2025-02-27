sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";
    return Controller.extend("myapp.view.Main", {
        onInit: function () {
            var oModel = new JSONModel();
            this.getView().setModel(oModel);
            this._loadInvoices();
        },

        _loadInvoices: function () {
            var oModel = this.getView().getModel();
            fetch("http://localhost:5029/api/v1/Invoice")
                .then(response => response.json())
                .then(data => oModel.setData({ invoices: data }))
                .catch(error => console.error("Erro ao buscar notas fiscais", error));
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oList = this.getView().byId("invoiceList");
            var oBinding = oList.getBinding("items");
            var aFilters = [];
            if (sQuery) {
                var oFilter = new sap.ui.model.Filter("NumeroNota", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(oFilter);
            }
            oBinding.filter(aFilters);
        },

        onSelectInvoice: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var oInvoice = oContext.getObject();
            MessageToast.show("Nota Fiscal Selecionada: " + oInvoice.NumeroNota);
        }
    });
});