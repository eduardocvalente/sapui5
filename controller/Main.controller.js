sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, JSONModel, Fragment) {
    "use strict";
    return Controller.extend("myapp.controller.Main", {

        onInit: function () {
            // Cria o modelo com propriedades para a listagem, detalhes e criação de nota fiscal
            var oModel = new JSONModel({
                invoices: [],
                selectedInvoice: {},
                // Modelo para criação de nova nota fiscal
                newInvoice: {
                    customer: {
                        name: "",
                        email: "",
                        address: {
                            zipCode: "",
                            street: "",
                            number: "",
                            neighborhood: "",
                            complement: "",
                            city: "",
                            state: "",
                            isDefault: true,
                            latitude: 0,
                            longitude: 0
                        }
                    },
                    supplier: {
                        name: "",
                        email: "",
                        address: {
                            zipCode: "",
                            street: "",
                            number: "",
                            neighborhood: "",
                            complement: "",
                            city: "",
                            state: "",
                            isDefault: true,
                            latitude: 0,
                            longitude: 0
                        }
                    },
                    items: [
                        {
                            productId: "",
                            quantity: 0,
                            unitPrice: 0
                        }
                    ]
                }
            });
            this.getView().setModel(oModel);
            this._loadInvoices();
        },

        //------------------------------------------------------
        // CARREGAR NOTAS FISCAIS (GET)
        //------------------------------------------------------
        _loadInvoices: function () {
            var oModel = this.getView().getModel();
            fetch("https://localhost:7130/api/v1/Invoice?page=1&pageSize=15&offset=15&asc=true")
                .then(response => response.json())
                .then(data => {
                    oModel.setProperty("/invoices", data);
                })
                .catch(error => {
                    console.error("Erro ao buscar notas fiscais:", error);
                    MessageToast.show("Não foi possível carregar as notas fiscais.");
                });
        },

        //------------------------------------------------------
        // PESQUISAR NOTAS (FILTRAGEM LOCAL)
        //------------------------------------------------------
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oList = this.byId("invoiceList");
            var oBinding = oList.getBinding("items");

            var aFilters = [];
            if (sQuery) {
                var oFilter = new sap.ui.model.Filter(
                    "NumeroNota", // ajuste o campo conforme o retorno da API
                    sap.ui.model.FilterOperator.Contains,
                    sQuery
                );
                aFilters.push(oFilter);
            }
            oBinding.filter(aFilters);
        },

        //------------------------------------------------------
        // ABRIR DIALOG DE CRIAÇÃO DA NOTA FISCAL
        //------------------------------------------------------
        onOpenCreateDialog: function () {
            var oView = this.getView();
            if (!this._oCreateDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "myapp.view.CreateInvoiceDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oCreateDialog = oDialog;
                    oView.addDependent(this._oCreateDialog);
                    this._oCreateDialog.open();
                }.bind(this));
            } else {
                this._oCreateDialog.open();
            }
        },

        //------------------------------------------------------
        // CANCELAR CRIAÇÃO DA NOTA
        //------------------------------------------------------
        onCancelCreate: function () {
            if (this._oCreateDialog) {
                this._oCreateDialog.close();
            }
        },

        //------------------------------------------------------
        // SALVAR NOVA NOTA FISCAL (POST)
        //------------------------------------------------------
        onSaveInvoice: function () {
            var oModel = this.getView().getModel();
            var oNewInvoice = oModel.getProperty("/newInvoice");

            var oBody = {
                customer: {
                    name: oNewInvoice.customer.name,
                    email: oNewInvoice.customer.email,
                    address: {
                        zipCode: oNewInvoice.customer.address.zipCode,
                        street: oNewInvoice.customer.address.street,
                        number: oNewInvoice.customer.address.number,
                        neighborhood: oNewInvoice.customer.address.neighborhood,
                        complement: oNewInvoice.customer.address.complement,
                        city: oNewInvoice.customer.address.city,
                        state: oNewInvoice.customer.address.state,
                        isDefault: oNewInvoice.customer.address.isDefault,
                        latitude: oNewInvoice.customer.address.latitude,
                        longitude: oNewInvoice.customer.address.longitude
                    }
                },
                supplier: {
                    name: oNewInvoice.supplier.name,
                    email: oNewInvoice.supplier.email,
                    address: {
                        zipCode: oNewInvoice.supplier.address.zipCode,
                        street: oNewInvoice.supplier.address.street,
                        number: oNewInvoice.supplier.address.number,
                        neighborhood: oNewInvoice.supplier.address.neighborhood,
                        complement: oNewInvoice.supplier.address.complement,
                        city: oNewInvoice.supplier.address.city,
                        state: oNewInvoice.supplier.address.state,
                        isDefault: oNewInvoice.supplier.address.isDefault,
                        latitude: oNewInvoice.supplier.address.latitude,
                        longitude: oNewInvoice.supplier.address.longitude
                    }
                },
                items: oNewInvoice.items
            };

            fetch("https://localhost:7130/api/v1/Invoice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oBody)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erro ao criar nota fiscal.");
                }
                return response.json();
            })
            .then(data => {
                MessageToast.show("Nota Fiscal criada com sucesso!");
                if (this._oCreateDialog) {
                    this._oCreateDialog.close();
                }
                oModel.setProperty("/newInvoice", {
                    customer: {
                        name: "",
                        email: "",
                        address: {
                            zipCode: "",
                            street: "",
                            number: "",
                            neighborhood: "",
                            complement: "",
                            city: "",
                            state: "",
                            isDefault: true,
                            latitude: 0,
                            longitude: 0
                        }
                    },
                    supplier: {
                        name: "",
                        email: "",
                        address: {
                            zipCode: "",
                            street: "",
                            number: "",
                            neighborhood: "",
                            complement: "",
                            city: "",
                            state: "",
                            isDefault: true,
                            latitude: 0,
                            longitude: 0
                        }
                    },
                    items: [
                        {
                            productId: "",
                            quantity: 0,
                            unitPrice: 0
                        }
                    ]
                });
                this._loadInvoices();
            })
            .catch(error => {
                console.error(error);
                MessageToast.show("Ocorreu um erro ao salvar a nota fiscal.");
            });
        },

        //------------------------------------------------------
        // AO SELECIONAR UMA NOTA FISCAL, MOSTRAR DETALHES
        //------------------------------------------------------
        onSelectInvoice: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var oInvoice = oContext.getObject();
            var oModel = this.getView().getModel();
            oModel.setProperty("/selectedInvoice", oInvoice);
            this._openDetailDialog();
        },

        //------------------------------------------------------
        // ABRIR DIALOG DE DETALHES
        //------------------------------------------------------
        _openDetailDialog: function () {
            var oView = this.getView();
            if (!this._oDetailDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "myapp.view.DetailInvoiceDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oDetailDialog = oDialog;
                    oView.addDependent(this._oDetailDialog);
                    this._oDetailDialog.open();
                }.bind(this));
            } else {
                this._oDetailDialog.open();
            }
        },

        //------------------------------------------------------
        // FECHAR DIALOG DE DETALHES
        //------------------------------------------------------
        onCloseDetail: function () {
            if (this._oDetailDialog) {
                this._oDetailDialog.close();
            }
        }

    });
});
