define([
    "dojo/dom-construct",
    "dojo/dom-style",
], function (domConstruct, domStyle) {
    'use strict';
    return class InfosManager {
        constructor(view) {
            this.container = $('<div/>', {
                class: 'dtg-infos-map'
            }).appendTo(document.body);
            this.hide();

        }
        static instance(view) {
            if (!this._instance)
                this._instance = new InfosManager(view);
            return this._instance;
        }
        show(infos, status) {
            while (this.container[0].firstChild) {
                this.container[0].removeChild(this.container[0].firstChild);
            }
            var group_infos = $('<div/>', {
                class: status || "alert-warning",
            }).appendTo(this.container);
            for (const info of infos) {
                $('<div/>', {
                    class: "item-info",
                    text: info
                }).appendTo(group_infos);
            }
            // this.container.text(string);
            view.ui.add(this.container[0], 'top-left');
            if (status) {
                setTimeout(() => {
                    this.hide();
                }, 3000);
            }
        }
        hide() {
            view.ui.remove(this.container[0]);
        }
    }
});