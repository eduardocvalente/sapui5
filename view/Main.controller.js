sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, JSONModel, Fragment) {
    "use strict";
    return Controller.extend("myapp.view.Main", {

        onInit: function () {
            // Cria e configura um JSONModel
            var oModel = new JSONModel({
                invoices: [],       // Lista de notas fiscais
                selectedInvoice: {},// Nota selecionada para exibir detalhes
                newInvoice: {       // Modelo para criar nova nota
                    NumeroNota: "",
                    Valor: "",
                    Cliente: { Nome: "" },
                    Fornecedor: { Nome: "" }
                }
            });
            this.getView().setModel(oModel);

            // Carrega as notas fiscais ao iniciar
            this._loadInvoices();
        },

        //------------------------------------------------------
        // CARREGAR NOTAS (GET)
        //------------------------------------------------------
        _loadInvoices: function () {
            var oModel = this.getView().getModel();
            fetch("http://localhost:5029/api/v1/Invoice")
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
        // PESQUISAR (FILTRAR) LISTA
        //------------------------------------------------------
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oList = this.byId("invoiceList");
            var oBinding = oList.getBinding("items");

            var aFilters = [];
            if (sQuery) {
                // Filtra pelo campo 'NumeroNota' (ajuste se precisar)
                var oFilter = new sap.ui.model.Filter(
                    "NumeroNota",
                    sap.ui.model.FilterOperator.Contains,
                    sQuery
                );
                aFilters.push(oFilter);
            }
            oBinding.filter(aFilters);
        },

        //------------------------------------------------------
        // ABRIR DIALOG DE CRIAÇÃO
        //------------------------------------------------------
        onOpenCreateDialog: function () {
            var oView = this.getView();

            // Carrega fragment de forma assíncrona (se ainda não existir)
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
        // CANCELAR CRIAÇÃO
        //------------------------------------------------------
        onCancelCreate: function () {
            this._oCreateDialog.close();
        },

        //------------------------------------------------------
        // SALVAR NOVA NOTA (POST)
        //------------------------------------------------------
        onSaveInvoice: function () {
            var oModel = this.getView().getModel();
            var oNewInvoice = oModel.getProperty("/newInvoice");

            // Monta o body conforme sua API
            // Exemplo simples c/ NumeroNota, Valor, Cliente e Fornecedor
            var oBody = {
                NumeroNota: oNewInvoice.NumeroNota,
                Valor: parseFloat(oNewInvoice.Valor),
                Cliente: {
                    Nome: oNewInvoice.Cliente.Nome
                },
                Fornecedor: {
                    Nome: oNewInvoice.Fornecedor.Nome
                }
            };

            fetch("http://localhost:5029/api/v1/Invoice", {
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
                // Fecha o diálogo
                this._oCreateDialog.close();
                // Limpa o formulário
                oModel.setProperty("/newInvoice", {
                    NumeroNota: "",
                    Valor: "",
                    Cliente: { Nome: "" },
                    Fornecedor: { Nome: "" }
                });
                // Recarrega as notas para ver a nova
                this._loadInvoices();
            })
            .catch(error => {
                console.error(error);
                MessageToast.show("Ocorreu um erro ao salvar a nota fiscal.");
            });
        },

        //------------------------------------------------------
        // AO SELECIONAR UMA NOTA -> Mostra DETALHES em Dialog
        //------------------------------------------------------
        onSelectInvoice: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var oInvoice = oContext.getObject();

            // Seta no model a nota selecionada
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
            this._oDetailDialog.close();
        }
    });
});
