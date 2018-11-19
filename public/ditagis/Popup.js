var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define([
    "ditagis/core/LinkAPI",
    "dojo/on", "dojo/dom-construct",
    "ditagis/support/HightlightGraphic",
    "ditagis/support/Editing",
    "esri/symbols/SimpleLineSymbol", "esri/core/watchUtils", "esri/PopupTemplate",
],
    function (LinkAPI, on, domConstruct, HightlightGraphic, EditingSupport,
        SimpleLineSymbol, watchUtils, PopupTemplate,
    ) {
        "use strict";
        class Popup {

            constructor(view) {
                this.view = view;
                this.options = {
                    hightLength: 100
                };
                // this.fireFields = ['created_user', 'created_date', 'last_edited_user', 'last_edited_date', 'XaPhuongTT', 'HuyenTXTP', 'TinhTrang', 'ChapThuanCuaSo', 'LoaiTram', 'DoCaoTram'];
                this.fireFields = ['OBJECTID', 'MaTruSo', 'MaNhaMay', 'MaDoiTuong'];
                this.editingSupport = new EditingSupport();
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
                        if (layer.id == defineName.NHAMAY || layer.id == defineName.NHAMAYDIEN) {
                            actions.push({
                                id: "add-attachment",
                                title: "Thêm hình ảnh",
                                className: "esri-icon-attachment",
                            });
                            actions.push({
                                id: "delete-attachment",
                                title: "Cập nhật",
                                className: "esri-icon-check-mark",
                                visible: false
                            });
                            actions.push({
                                id: "link-website",
                                title: "Thông số quan trắc",
                                className: "esri-icon-link",
                                visible: false
                            });
                        }
                        if (layer.id.includes("camera")) {
                            layer.popupTemplate = new PopupTemplate({
                                content: (target) => {
                                    return this.contentImages(target);
                                },
                                title: layer.title,
                                actions: actions
                            });
                        } else {

                            layer.popupTemplate = new PopupTemplate({
                                content: (target) => {
                                    if (layer.id == defineName.NHAMAY || layer.id == defineName.NHAMAYDIEN) {
                                        this.layerActions.items.find(function (action) {
                                            return action.id === 'delete-attachment';
                                        }).visible = false;
                                        this.layerActions.items.find(function (action) {
                                            return action.id === 'add-attachment';
                                        }).visible = true;
                                    }
                                    return this.contentPopup(target);
                                },
                                title: layer.title,
                                actions: actions
                            });
                        }

                    }

                });
                this.view.popup.watch('visible', (newValue) => {
                    if (!newValue) {
                        this.listInterval.forEach(interval => clearInterval(interval)); // xóa interval
                        this.listInterval = []; // xóa hết giá trị

                        this.hightlightGraphic.clear();
                    }
                    var selectedFeature = this.view.popup.selectedFeature;
                    if (selectedFeature && selectedFeature.sourceLayer && selectedFeature.sourceLayer.id === "cameraLYR" && this.view.popup.dockEnabled) {
                        $(".esri-popup .esri-widget").css({
                            "top": "41px",
                            "right": "24px",
                            "width": "84%",
                            "height": "100%",
                            "max-height": "97%"
                        });
                    }
                    else {
                        $('.esri-popup .esri-widget').removeAttr('style');
                    }
                });
                this.view.popup.watch('dockEnabled', (newValue) => {
                    var selectedFeature = this.view.popup.selectedFeature;
                    if (selectedFeature.sourceLayer.id === "cameraLYR" && newValue) {
                        var link_url = selectedFeature.attributes["LinkAPI"];
                        if (link_url) {
                            var url = `${LinkAPI.CAMERA}${link_url}/`;
                            this.getCameraImage(url);
                            $(".esri-popup .esri-widget").css({
                                "top": "41px",
                                "right": "24px",
                                "width": "84%",
                                "height": "100%",
                                "max-height": "97%"
                            });
                        }
                    }
                    else {
                        $('.esri-popup .esri-widget').removeAttr('style');
                    }
                });
                this.view.popup.watch('selectedFeature', (newVal, oldVal) => {
                    // nếu giá trị mới khác giá trị cũ
                    if (newVal !== oldVal) {
                        this.listInterval.forEach(interval => clearInterval(interval)); // xóa interval
                        this.listInterval = []; // xóa hết giá trị
                    }
                    var selectedFeature = this.view.popup.selectedFeature;
                    if (selectedFeature && selectedFeature.sourceLayer && selectedFeature.sourceLayer.id === "cameraLYR" && this.view.popup.dockEnabled) {
                        $(".esri-popup .esri-widget").css({
                            "top": "41px",
                            "right": "24px",
                            "width": "84%",
                            "height": "100%",
                            "max-height": "97%"
                        });
                    }
                    else {
                        $('.esri-popup .esri-widget').removeAttr('style');
                    }
                });
                this.view.popup.on("trigger-action", (evt) => {
                    this.triggerActionHandler(evt);
                });
            }
            get layerActions() {
                if (this.view.popup.selectedFeature)
                    return this.view.popup.selectedFeature.layer.popupTemplate.actions;
            }
            get layer() {
                if (this.view.popup.selectedFeature.layer.id == defineName.NHAMAY) {
                    return this.view.map.findLayerById(defineName.NHAMAYDIEN);
                }
                return this.view.popup.selectedFeature.layer;
            }
            get attributes() {
                return this.view.popup.selectedFeature.attributes;
            }
            triggerActionHandler(event) {
                let actionId = event.action.id,
                    selectedFeature = this.view.popup.viewModel.selectedFeature,
                    layer = selectedFeature.layer;
                if (!layer) return;
                const per = layer.permission;
                switch (actionId) {
                    case "update":
                        if (per && per.edit) {
                            if (event.action.className === 'esri-icon-check-mark') {
                                this.editFeature();
                            } else {
                                this.showEdit();
                            }
                        }
                        break;
                    case "delete":
                        if (per && per.delete) {
                            if (confirm("Chắc chắn xóa đối tượng?")) {
                                this.deleteFeature();
                            }

                        }
                        break;
                    case "add-attachment":
                        {
                            this.addAttachments();
                            break;
                        }
                    case "delete-attachment":
                        {
                            this.deleteAttachments();
                            break;
                        }
                    case "link-website":
                        {
                            var win = window.open("http://buonkuop.vn:2016/pclb/default.aspx", '_blank');
                            win.focus();
                            break;
                        }
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
                                this.editField(field, model, divInfo);
                            }
                        }
                    } else if (outFields[0] == "*") {
                        this.editField(field, model, divInfo);
                    }

                }
                if (this.layer.hasAttachments) {
                    divInfo.innerHTML += `<legend>Tệp đính kèm</legend>
                    <div class="attachment-popup" id="attachment-popup"></div>`;
                    this.layer.getAttachments(this.attributes['OBJECTID']).then(res => {
                        let attachmentPopup = $("#attachment-popup");
                        let form = $("<form/>", {
                            enctype: "multipart/form-data",
                            method: "post",
                            html: `<input value="json" name="f" hidden/>`
                        }).appendTo(attachmentPopup);
                        let fileInput = $("<input/>", {
                            type: "file",
                            name: "attachment",
                            multiple: true
                        });
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
                let updateAction = this.layerActions.find(function (action) {
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
            addAttachments() {
                let container = domConstruct.create('div', {
                    id: 'show-edit-container',
                    class: 'popup-content'
                });
                let divInfo = domConstruct.create('div', {
                    class: 'form-horizontal'
                }, container);
                let model = {};
                if (this.layer.hasAttachments) {
                    divInfo.innerHTML += `<legend>Tệp đính kèm</legend>
                    <div class="attachment-popup" id="attachment-popup"></div>`;
                    this.layer.getAttachments(this.attributes['OBJECTID']).then(res => {
                        let attachmentPopup = $("#attachment-popup");
                        let form = $("<form/>", {
                            enctype: "multipart/form-data",
                            method: "post",
                            html: `<input value="json" name="f" hidden/>`
                        }).appendTo(attachmentPopup);
                        let fileInput = $("<input/>", {
                            type: "file",
                            name: "attachment",
                            multiple: true
                        });
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
                this.kendoModel = kendo.observable(model);
                kendo.bind($(container), this.kendoModel);
                this.view.popup.content = container;
                this.view.popup.title = this.layer.title;
                this.layerActions.find(function (action) {
                    return action.id === 'delete-attachment';
                }).visible = true;
                this.layerActions.find(function (action) {
                    return action.id === 'add-attachment';
                }).visible = false;
            }
            editField(field, model, divInfo) {
                let inputHTML = '';
                if (field.type === 'oid' || (this.isFireField(field.name) && this.attributes[field.name]))
                    return;
                if (field.domain && field.domain.type === "codedValue") {
                    let domain = field.domain,
                        codedValues = domain.codedValues;
                    let optionHTML = codedValues.map(m => `<option value="${m.code}">${m.name}</option>`);
                    inputHTML = `
                                        <select class="form-control" data-bind="value:${field.name}">
                                            <option value='-1'>Chọn ${field.alias}</option>
                                            ${optionHTML}
                                        </select>
                                    `;
                } else {
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
                                let attachElement = this.renderAttachmentPopup(attachInfo, {
                                    edit: true
                                });
                                attachmentPopup.append(attachElement);
                            }
                        });
                    } else {
                        kendo.alert("Không thể thêm tệp đính kèm");
                    }
                });
            }
            renderAttachmentPopup(item, props = {
                edit: false
            }) {
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
                const graphic = target.graphic,
                    attributes = graphic.attributes;
                let container = $('<div/>', {
                    class: 'popup-content',
                });
                var link_url = attributes["LinkAPI"];
                $('<img/>', {
                    id: "img_camera",
                }).appendTo(container);
                kendo.ui.progress($(".esri-popup .esri-widget"), true);

                if (link_url) {
                    var url = `${LinkAPI.CAMERA}${link_url}/`;
                    this.getCameraImage(url);
                    var interval = setInterval(() => {
                        this.getCameraImage(url);
                    }, 5000);
                    this.listInterval.push(interval);

                }
                return container[0].outerHTML;
            }
            getCameraImage(url) {
                $.ajax({
                    url: url,
                    success: (result) => {
                        if ($("#img_camera")[0]) {
                            kendo.ui.progress($(".esri-popup .esri-widget"), false);
                            if (result) {
                                // $("#img_camera")[0].setAttribute('src', result);
                                $("#img_camera")[0].setAttribute('src', "../public/images/error-camera.jpg");
                            } else {
                                $("#img_camera")[0].setAttribute('src', "../public/images/error-camera.jpg");
                                this.listInterval.forEach(interval => clearInterval(interval)); // xóa interval
                                this.listInterval = []; // xóa hết giá trị
                            }
                        }
                    }
                });
            }
            contentPopup(target) {
                return __awaiter(this, void 0, void 0, function* () {
                    const graphic = target.graphic,
                        layer = graphic.layer || graphic.sourceLayer,
                        attributes = graphic.attributes;
                    if (layer.id == defineName.NHAMAY || layer.id == defineName.NHAMAYDIEN) {
                        if (attributes["Ma"] == "buonkoup" || attributes["Ma"] == "buontuasrah" || attributes["Ma"] == "srepok3") {
                            this.layerActions.find(function (action) {
                                return action.id === 'link-website';
                            }).visible = true;
                        } else {
                            this.layerActions.find(function (action) {
                                return action.id === 'link-website';
                            }).visible = false;
                        }
                    }
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
                        } else if (outFields[0] == "*") {
                            this.showField(field, attributes, table);
                        }

                    }
                    if (layer.id == defineName.NHAMAY || layer.id == defineName.NHAMAYDIEN) {
                        this.showCongSuatNhaMay(attributes, table);
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
                    tdValue.text('Đang tải...')
                    var manhamay = attributes[fieldName_NhaMay.MANHAMAY];
                    tdValue.addClass('pre-line');
                    tdValue[0].id = manhamay;
                    if (manhamay) {
                        var p = $('p').appendTo(tdValue);
                        var interval = setInterval(() => {
                            $.ajax({
                                url: `${LinkAPI.CONGSUAT}${manhamay}`,
                                success: function (result) {
                                    if (result) {
                                        var text = '';
                                        for (const key in result) {
                                            text += `${key}: ${result[key]}\r\n`
                                        }
                                        $(`#${manhamay}`).text(text);
                                    }

                                }
                            });
                        }, 10000);
                        this.listInterval.push(interval);
                    }

                } else if (value) {
                    let input, content = value,
                        formatString;
                    if (field.domain && field.domain.type === "codedValue") {
                        const codedValues = field.domain.codedValues;
                        content = codedValues.find(f => {
                            return f.code === value;
                        }).name;
                    } else if (field.type === 'date')
                        formatString = 'DateFormat';
                    if (formatString)
                        content = `{${field.name}:${formatString}}`;
                    tdValue.text(content);
                }
            }
            showCongSuatNhaMay(attributes, table) {
                let row = $('<tr/>').appendTo(table);
                $('<th/>', {
                    text: "Công suất"
                }).appendTo(row);
                let tdValue = $('<td/>').appendTo(row);
                var manhamay = attributes[fieldName_NhaMay.MANHAMAY];
                tdValue.addClass('pre-line');
                tdValue[0].id = manhamay;
                if (manhamay) {
                    var p = $('p').appendTo(tdValue);
                    var interval = setInterval(() => {
                        $.ajax({
                            url: `${LinkAPI.CONGSUAT}${manhamay}`,
                            success: function (result) {
                                if (result) {
                                    var text = '';
                                    for (const key in result) {
                                        text += `${key}: ${result[key]}\r\n`
                                    }
                                    $(`#${manhamay}`).text(text);
                                }

                            }
                        });
                    }, 10000);
                    this.listInterval.push(interval);
                }
            }
            deleteAttachments() {
                if (!this.attributes || !this.kendoModel)
                    kendo.alert("Có lỗi xảy ra trong quá trình cập nhật");
                if (this.kendoModel.get('deleteAttachment') && this.kendoModel.get('deleteAttachment').length > 0) {
                    this.layer.deleteAttachments({
                        objectId: this.attributes.OBJECTID,
                        deletes: this.kendoModel.get('deleteAttachment')
                    });
                    this.kendoModel.set('deleteAttachment', []);
                }
                this.layerActions.find(function (action) {
                    return action.id === 'delete-attachment';
                }).visible = false;
                this.layerActions.find(function (action) {
                    return action.id === 'add-attachment';
                }).visible = true;
                let query = this.layer.createQuery();
                query.outFields = ['*'];
                query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
                this.layer.queryFeatures(query).then(res => {
                    this.view.popup.open({
                        features: res.features
                    });
                });
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
                    } else
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