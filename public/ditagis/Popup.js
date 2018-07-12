var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "dojo/on", "dojo/dom-construct",
    "ditagis/support/HightlightGraphic",
    "ditagis/support/Editing",
    "esri/symbols/SimpleLineSymbol", "esri/core/watchUtils", "esri/PopupTemplate"],
    function (require, exports, on, domConstruct, HightlightGraphic, EditingSupport,
        SimpleLineSymbol, watchUtils, PopupTemplate) {
        "use strict";
        class Popup {

            constructor(view) {
                this.view = view;
                this.options = {
                    hightLength: 100
                };
                this.fireFields = ['created_user', 'created_date', 'last_edited_user', 'last_edited_date', 'XaPhuongTT', 'HuyenTXTP', 'TinhTrang', 'ChapThuanCuaSo', 'LoaiTram', 'DoCaoTram'];
                this.editingSupport = new EditingSupport();
                this.hightlightGraphic = new HightlightGraphic(view, {
                    symbolMarker: {
                        type: 'simple-marker',
                        color: 'rgba(0, 0, 0, 0.2)',
                        style: 'circle',
                        size: '18px'
                    },
                    symbolLine: new SimpleLineSymbol({
                        outline: {
                            color: '#7EABCD',
                            width: 2
                        }
                    })
                });
                this.listInterval = [];
            }
            isFireField(fieldName) {
                return this.fireFields.indexOf(fieldName) !== -1;
            }
            startup() {
                this.view.on('layerview-create', (evt) => {
                    let layer = evt.layer;
                    if (layer.type == 'feature') {
                        var content;
                        let actions = [];
                        if (layer.permission.edit) {
                            actions.push({
                                id: "update",
                                title: "Cập nhật",
                                className: "esri-icon-edit",
                            });
                        }
                        if (layer.permission.delete) {
                            actions.push({
                                id: "delete",
                                title: "Xóa",
                                className: "esri-icon-erase",
                            });
                        }
                        if (layer.id == 'cameraLYR') {
                            layer.popupTemplate = new PopupTemplate({
                                content: (target) => {
                                    return this.contentImages(target);
                                },
                                title: layer.title,
                                actions: actions
                            });
                        }
                        else
                            layer.popupTemplate = new PopupTemplate({
                                content: (target) => {
                                    return this.contentPopup(target);
                                },
                                title: layer.title,
                                actions: actions
                            });
                    }
                });
                this.view.popup.watch('visible', (newValue) => {
                    if (!newValue) {
                        this.listInterval.forEach(interval => clearInterval(interval)); // xóa interval
                        this.listInterval = []; // xóa hết giá trị

                        this.hightlightGraphic.clear();
                    }
                });
                this.view.popup.watch('selectedFeature', (newVal, oldVal) => {
                    // nếu giá trị mới khác giá trị cũ
                    if (newVal !== oldVal) {
                        this.listInterval.forEach(interval => clearInterval(interval)); // xóa interval
                        this.listInterval = []; // xóa hết giá trị
                    }
                });
                this.view.popup.on("trigger-action", (evt) => {
                    this.triggerActionHandler(evt);
                });
            }
            get layer() {
                return this.view.popup.selectedFeature.layer;
            }
            get attributes() {
                return this.view.popup.selectedFeature.attributes;
            }
            triggerActionHandler(event) {
                let actionId = event.action.id, selectedFeature = this.view.popup.viewModel.selectedFeature, layer = selectedFeature.layer, attributes = selectedFeature.attributes, objectid = attributes.OBJECTID;
                const per = layer.permission;
                switch (actionId) {
                    case "update":
                        if (per && per.edit) {
                            if (event.action.className === 'esri-icon-check-mark') {
                                this.editFeature();
                            }
                            else {
                                this.showEdit();
                            }
                        }
                        break;
                    case "delete":
                        if (per && per.delete) {
                            this.deleteFeature();
                        }
                        break;
                    case "hoan-cong":
                        kendo.confirm("Xác nhận hoàn công trạm BTS").then(f => {
                            layer.applyEdits({
                                updateFeatures: [{
                                    attributes: {
                                        objectId: objectid,
                                        TinhTrang: 3
                                    }
                                }]
                            }).then(r => {
                                if (r.updateFeatureResults[0].error) {
                                    kendo.alert("Có lỗi xảy ra trong quá trình thực hiện");
                                }
                                else {
                                    kendo.alert("Thao tác thành công");
                                }
                            });
                        });
                        break;
                    case "cap-phep":
                        if (attributes.TenDoanhNghiep) {
                            kendo.confirm("Chấp nhận cấp phép trạm BTS").then(f => {
                                layer.applyEdits({
                                    updateFeatures: [{
                                        attributes: {
                                            objectId: objectid,
                                            TinhTrang: 2
                                        }
                                    }]
                                }).then(r => {
                                    if (r.updateFeatureResults[0].error) {
                                        kendo.alert("Có lỗi xảy ra trong quá trình thực hiện");
                                    }
                                    else {
                                        kendo.alert("Cấp phép thành công");
                                    }
                                });
                            }, e => {
                                layer.applyEdits({
                                    updateFeatures: [{
                                        attributes: {
                                            objectId: objectid,
                                            TinhTrang: 4
                                        }
                                    }]
                                }).then(r => {
                                    if (r.updateFeatureResults[0].error) {
                                        kendo.alert("Có lỗi xảy ra trong quá trình thực hiện");
                                    }
                                    else {
                                        kendo.alert("Thao tác thành công");
                                    }
                                });
                            });
                        }
                        else {
                            const codedValues = layer.fields.find(f => f.name === "TenDoanhNghiep").domain.codedValues;
                            let dialog = $("<div/>").appendTo(document.body);
                            dialog.kendoDialog({
                                width: "400px",
                                title: "Chọn doanh nghiệp",
                                closable: false,
                                modal: false,
                                content: "<input style='width:100%'></input>",
                                actions: [{
                                    text: 'Cấp phép',
                                    action: function () {
                                        let val = dialog.find('input').val();
                                        layer.applyEdits({
                                            updateFeatures: [{
                                                attributes: {
                                                    objectId: objectid,
                                                    TinhTrang: 2,
                                                    TenDoanhNghiep: val
                                                }
                                            }]
                                        }).then(r => {
                                            if (r.updateFeatureResults[0].error) {
                                                kendo.alert("Có lỗi xảy ra trong quá trình thực hiện");
                                            }
                                            else {
                                                kendo.alert("Thao tác thành công");
                                            }
                                        });
                                    }
                                },
                                {
                                    text: 'Không cấp phép',
                                    action: function () {
                                        layer.applyEdits({
                                            updateFeatures: [{
                                                attributes: {
                                                    objectId: objectid,
                                                    TinhTrang: 4,
                                                }
                                            }]
                                        }).then(r => {
                                            if (r.updateFeatureResults[0].error) {
                                                kendo.alert("Có lỗi xảy ra trong quá trình thực hiện");
                                            }
                                            else {
                                                kendo.alert("Thao tác thành công");
                                            }
                                        });
                                    }
                                },
                                {
                                    text: 'Đóng',
                                }
                                ],
                                close: function () {
                                    dialog.data("kendoDialog").destroy();
                                    dialog.remove();
                                }
                            });
                            let cb = dialog.find('input');
                            cb.kendoDropDownList({
                                dataSource: codedValues,
                                dataTextField: "name",
                                dataValueField: "code"
                            });
                        }
                        break;
                    default:
                        break;
                }
            }
            showEdit() {
                let container = domConstruct.create('div', {
                    id: 'show-edit-container',
                    class: 'popup-content'
                });
                let divInfo = domConstruct.create('div', {
                    class: 'form-horizontal'
                }, container);
                divInfo.innerHTML += '<legend>Thông tin</legend>';
                let model = {};
                var outFields = this.layer.outFields;
                for (let field of this.layer.fields) {
                    if (outFields && outFields.length > 1) {
                        for (let outField of outFields) {
                            if (outField == field.name) {
                                this.editField(field,model,divInfo);
                            }
                        }
                    }
                    else if (outFields[0] == "*") {
                        this.editField(field,model,divInfo);
                    }
                    
                }
                if (this.layer.hasAttachments) {
                    divInfo.innerHTML += `<legend>Tệp đính kèm</legend>
      <div class="attachment-popup" id="attachment-popup"></div>`;
                    this.layer.getAttachments(this.attributes['OBJECTID']).then(res => {
                        let attachmentPopup = $("#attachment-popup");
                        let form = $("<form/>", {
                            enctype: "multipart/form-data", method: "post",
                            html: `<input value="json" name="f" hidden/>`
                        }).appendTo(attachmentPopup);
                        let fileInput = $("<input/>", { type: "file", name: "attachment", multiple: true });
                        fileInput.change(this.onInputAttachmentChangeHandler.bind(this));
                        form.append(fileInput);
                        if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                            for (let item of res.attachmentInfos) {
                                let attachElement = this.renderAttachmentPopup(item, {
                                    edit: true
                                });
                                attachmentPopup.append(attachElement);
                            }
                        }
                    });
                }
                this.view.popup.content = container;
                this.kendoModel = kendo.observable(model);
                kendo.bind($(container), this.kendoModel);
                this.view.popup.title = this.layer.title;
                let updateAction = this.view.popup.actions.find(function (action) {
                    return action.id === 'update';
                });
                updateAction.className = 'esri-icon-check-mark';
                watchUtils.once(this.view.popup, 'selectedFeature').then(result => {
                    updateAction.className = 'esri-icon-edit';
                });
                watchUtils.once(this.view.popup, 'visible').then(result => {
                    updateAction.className = 'esri-icon-edit';
                });
            }
            editField(field,model,divInfo) {
                let inputHTML = '';
                if (field.type === 'oid' || this.isFireField(field.name))
                    return;
                if (field.domain && field.domain.type === "codedValue") {
                    let domain = field.domain, codedValues = domain.codedValues;
                    let optionHTML = codedValues.map(m => `<option value="${m.code}">${m.name}</option>`);
                    inputHTML = `
                                        <select class="form-control" data-bind="value:${field.name}">
                                            <option value='-1'>Chọn ${field.alias}</option>
                                            ${optionHTML}
                                        </select>
                                    `;
                }
                else {
                    let inputType = field.type === "string" ? "text" :
                        field.type === "date" ? "date" : "number";
                    inputHTML = `<input class="form-control" type="${inputType}" data-bind="value:${field.name}">`;
                }
                let html = `
                            <div class="form-group">
                            <label class="col-sm-4 control-label" for="textinput">${field.alias}</label>
                            <div class="col-sm-8">
                                ${inputHTML}
                            </div>
                            </div>`;
                if (field.type === "date")
                    model[field.name] = new Date(this.attributes[field.name]);
                else
                    model[field.name] = this.attributes[field.name];
                divInfo.innerHTML += html;
            }
            onInputAttachmentChangeHandler(e) {
                let fileInput = e.target;
                let file = fileInput.files[0];
                if (file.size > 20000000) {
                    kendo.alert("Dung lượng tệp quá lớn");
                    return;
                }
                this.layer.addAttachments(this.attributes.OBJECTID, fileInput.form).then(addRes => {
                    if (addRes.addAttachmentResult.success) {
                        let attachmentPopup = $("#attachment-popup");
                        this.layer.getAttachments(this.attributes.OBJECTID).then(getRes => {
                            let attachInfo = getRes.attachmentInfos.find(f => f.id === addRes.addAttachmentResult.objectId);
                            if (attachInfo) {
                                let attachElement = this.renderAttachmentPopup(attachInfo, { edit: true });
                                attachmentPopup.append(attachElement);
                            }
                        });
                    }
                    else {
                        kendo.alert("Không thể thêm tệp đính kèm");
                    }
                });
            }
            renderAttachmentPopup(item, props = { edit: false }) {
                let itemDiv = $('<div/>', {
                    class: 'attachment-item'
                });
                let itemName = $('<div/>', {
                    class: 'attachment-name'
                }).appendTo(itemDiv);
                let aItemName = $('<a/>', {
                    href: item.src,
                    text: item.name,
                    target: '_blank'
                }).appendTo(itemName);
                if (props.edit) {
                    let itemDelete = $('<div/>', {
                        class: 'delete-attachment esri-icon-trash'
                    }).appendTo(itemDiv);
                    on(itemDelete, 'click', () => {
                        if (!this.kendoModel.get('deleteAttachment'))
                            this.kendoModel.set('deleteAttachment', []);
                        this.kendoModel.get('deleteAttachment').push(item.id);
                        itemDiv.remove();
                    });
                }
                return itemDiv;
            }
            contentImages(target) {
                let container = $('<div/>', {
                    class: 'popup-content',
                });
                let image = $('<img/>', {
                    src: "../public/images/genco3.jpg"
                }).appendTo(container);
                return container[0].outerHTML;
            }
            contentPopup(target) {
                return __awaiter(this, void 0, void 0, function* () {
                    const graphic = target.graphic, layer = graphic.layer, attributes = graphic.attributes;
                    var outFields = layer.outFields;
                    this.hightlightGraphic.clear();
                    this.hightlightGraphic.add(graphic);
                    let container = $('<div/>', {
                        class: 'popup-content',
                    });
                    let table = $('<table/>', {}).appendTo(container);
                    for (let field of layer.fields) {
                        if (outFields && outFields.length > 1) {
                            for (let outField of outFields) {
                                if (outField == field.name) {
                                    this.showField(field, attributes, table);
                                }
                            }
                        }
                        else if (outFields[0] == "*") {
                            this.showField(field, attributes, table);
                        }

                    }
                    if (layer.hasAttachments) {
                        layer.getAttachments(attributes['OBJECTID']).then(res => {
                            if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                                let div = $('<div/>', {
                                    class: 'attachment-container'
                                }).appendTo($(this.view.popup.container).find(".popup-content"));
                                $('<legend/>', {
                                    innerHTML: 'Tệp đính kèm'
                                }).appendTo(div);
                                let url = `${layer.url}/${layer.layerId}/${attributes['OBJECTID']}`;
                                for (let item of res.attachmentInfos) {
                                    let attachElement = this.renderAttachmentPopup(item);
                                    div.append(attachElement);
                                }
                            }
                        });
                    }
                    return container[0].outerHTML;
                });
            }
            showField(field, attributes, table) {
                let value = attributes[field.name];
                if (field.type === 'oid')
                    return;
                let row = $('<tr/>').appendTo(table);
                let tdName = $('<th/>', {
                    text: field.alias
                }).appendTo(row);
                let tdValue = $('<td/>').appendTo(row);
                if (field.name == 'CongSuat') {
                    var manhamay = attributes["Ma"];
                    tdValue[0].id = manhamay;
                    if (manhamay) {
                        var interval = setInterval(() => {
                            $.ajax({
                                url: `https://ditagis.com/genco3/congsuat/${manhamay}`, success: function (result) {
                                    $(`#${manhamay}`).text(result);
                                }
                            });
                        }, 1000);
                        this.listInterval.push(interval);
                    }

                }
                else if (value) {
                    let input, content = value, formatString;
                    if (field.domain && field.domain.type === "codedValue") {
                        const codedValues = field.domain.codedValues;
                        content = codedValues.find(f => { return f.code === value; }).name;
                    }
                    else if (field.type === 'date')
                        formatString = 'DateFormat';
                    if (formatString)
                        content = `{${field.name}:${formatString}}`;
                    tdValue.text(content);
                }
            }
            editFeature() {
                let applyAttributes = {
                    objectId: this.attributes.OBJECTID
                };
                if (!this.attributes || !this.kendoModel)
                    kendo.alert("Có lỗi xảy ra trong quá trình cập nhật");
                if (this.kendoModel.get('deleteAttachment') && this.kendoModel.get('deleteAttachment').length > 0) {
                    this.layer.deleteAttachments({
                        objectId: this.attributes.OBJECTID,
                        deletes: this.kendoModel.get('deleteAttachment')
                    });
                    this.kendoModel.set('deleteAttachment', []);
                }
                for (let field of this.layer.fields) {
                    let value = this.kendoModel.get(field.name);
                    if (!value ||
                        (value && value == -1))
                        continue;
                    if (field.type === 'date') {
                        if (value.getTime() <= 0)
                            continue;
                        applyAttributes[field.name] = value.getTime();
                    }
                    else
                        applyAttributes[field.name] = value;
                }
                const updatedInfo = this.editingSupport.getUpdatedInfo(this.view);
                for (let i in updatedInfo) {
                    applyAttributes[i] = updatedInfo[i];
                }
                this.layer.applyEdits({
                    updateFeatures: [{
                        attributes: applyAttributes
                    }]
                }).then((res) => {
                    let updateFeatureResults = res.updateFeatureResults;
                    if (updateFeatureResults[0].objectId) {
                        let query = this.layer.createQuery();
                        query.outFields = ['*'];
                        query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
                        this.layer.queryFeatures(query).then(res => {
                            this.view.popup.open({
                                features: res.features
                            });
                        });
                    }
                });
            }
            deleteFeature() {
                this.layer.applyEdits({
                    deleteFeatures: [{
                        objectId: this.attributes.OBJECTID
                    }]
                }).then((res) => {
                    if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
                        this.view.popup.close();
                    }
                });
            }

        }
        return Popup;
    });
