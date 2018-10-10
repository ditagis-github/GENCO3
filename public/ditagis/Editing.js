define([
  "../core/ConstName",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
], function (constName, QueryTask, Query) {
  'use strict';
  return class {
    constructor(view, options = {}) {
      this.view = view;
    }
    getCreatedInfo(view) {
      if (view.systemVariable && view.systemVariable.user) {
        return {
          created_user: view.systemVariable.user.Username,
          created_date: new Date().getTime(),
        }
      } else {
        return {
          created_user: 'N/A',
          created_date: new Date().getTime(),
        }
      }
    }
    getUpdatedInfo(view) {
      if (view.systemVariable && view.systemVariable.user)
        return {
          last_edited_user: view.systemVariable.user.Username,
          last_edited_date: new Date().getTime(),
        }
      else
        return {
          created_user: 'N/A',
          created_date: new Date().getTime(),
        }
    }
    getMaNhaMay(options) {
      return new Promise((resolve, reject) => {
        try {
          if (!options.geometry)
            reject('geometry is null')
          if (!this.queryNhaMay)
            this.queryNhaMay = new QueryTask({
              url: this.view.map.findLayerById(defineName.NHAMAYDIEN).url + "/" + this.view.map.findLayerById(defineName.NHAMAYDIEN).layerId
            });
          this.queryNhaMay.execute({
            outFields: [fieldName_NhaMay.MANHAMAY],
            geometry: options.geometry
          }).then(res => {
            if (res) {
              if (res.features.length > 0) {
                let ft = res.features[0];
                if (ft && ft.attributes) {
                  resolve({
                    MaNhaMay: ft.attributes[fieldName_NhaMay.MANHAMAY],
                  });
                }
              }
              else resolve(null);
            } else {
              resolve(null);
            }
          });
        } catch (error) {
          console.log(error)
          reject(error);
        }
      });
    }
    getLocationInfo(options) {

      return new Promise((resolve, reject) => {
        try {
          if (!options.geometry)
            reject('geometry is null')
          if (!this.queryLocation)
            this.queryLocation = new QueryTask({
              url: this.view.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA).url
            });
          this.queryLocation.execute({
            outFields: ['MaXaPhuongTT', 'MaHuyenTp'],
            geometry: options.geometry
          }).then(res => {
            if (res) {
              let ft = res.features[0];
              if (ft && ft.attributes) {
                resolve({
                  XaPhuongTT: ft.attributes['MaXaPhuongTT'],
                  HuyenTXTP: ft.attributes['MaHuyenTp']
                });
              }
            } else {
              resolve(null);
            }
          });
        } catch (error) {
          console.log(error)
          reject(error);
        }
      });
    }
  }
});