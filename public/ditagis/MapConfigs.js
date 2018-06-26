define(["require", "exports"], function (require, exports) {
    "use strict";
    const MapConfigs = {
        user : {
            Capabilities: "",
            DisplayName: "",
            Email: null,
            GroupRole: "",
            ID: "",
            Password: "",
            Phone: null,
            PrimaryCapability: null,
            Role: "",
            RoleName: "",
            Status: true,
            Username: "",
            date_create: "",
            expired_date: null,
            last_access: null,
            usser_create: null
        },
        layers: [{
            title: 'Nhà máy',
            id: "NhaMay",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/7",
            outFields: ['*'],
            permission: {
                create: false,
                delete: false,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        },
        {
            title: 'Van',
            id: "Van",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/6",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Lò hơi',
            id: "LoHoi",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/5",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Trạm biến áp',
            id: "TramBienAp",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/4",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Tua bin',
            id: "TuaBin",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/3",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Bồn chứa',
            id: "BonChua",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/2",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Ống khói',
            id: "OngKhoi",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/1",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Camera',
            id: "Camera",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/0",
            outFields: ['*'],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }
        ],
        zoom: 6,
        center: [106.9562792, 16.8799795]
    };
    return MapConfigs;
});