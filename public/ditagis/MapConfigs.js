define(["require", "exports"], function (require, exports) {
    "use strict";
    const MapConfigs = {
        user: {
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
        layers: [
            {
                title: "Tuyến Năng Lượng",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/0",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Tuyến Đường Thải X",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/1",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Tuyến Đường Nước Ngọt",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/2",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Đập Tràn Xả Lũ",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/3",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Trạm Bơm",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/4",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Trạm Biến Áp",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/5",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Tổ Máy Nhiệt Điện",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/6",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Tháp Điều Áp",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/7",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Kênh Nước Làm Má",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/8",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Kênh Dẫn",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/9",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Hố Ga",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/10",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Sông Hồ",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/11",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Hồ Chứa Nước Ngọt",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/12",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Giao Thông",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/13",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Đường Ống",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/14",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Đường Dây Điện",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/15",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Đập Dâng",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/16",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Cửa Lấy Nước",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/17",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Cột Điện",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/18",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Công Trình",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/19",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Cảng",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/20",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Bể Chứa",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/21",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Băng Tải",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/22",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Bãi Xỉ",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/23",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Nhà Máy Điện",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/24",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }, {
                title: "Trụ Sở Công Ty",
                id: "",
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3_GIS/ChuyenDe/FeatureServer/25",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: true,
                    view: true
                },
                queryFields: "",
                groupLayer: "chuyendehientrang"
            }
        ],

        layers1: [{
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