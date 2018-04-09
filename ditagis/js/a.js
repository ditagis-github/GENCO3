view.on("key-down", function (evt) {
    var newExtent = view.extent;
    console.log([newExtent.xmax, newExtent.xmin, newExtent.ymax, newExtent.ymin]);
    if (newExtent.xmax > last_ext.xmax) {
        console.log("1");
        view.extent = last_ext;
        console.log([view.extent.xmax, view.extent.xmin, view.extent.ymax, view.extent.ymin]);
        evt.stopPropagation();
    }
    else if (newExtent.xmin < last_ext.xmin) {
        view.extent = last_ext;
        console.log("2");
        console.log([view.extent.xmax, view.extent.xmin, view.extent.ymax, view.extent.ymin]);
        evt.stopPropagation();
    }
    else if (newExtent.ymin < last_ext.ymin) {
        view.extent = last_ext;
        console.log("3");
        console.log([view.extent.xmax, view.extent.xmin, view.extent.ymax, view.extent.ymin]);
        evt.stopPropagation();
    }
    else if (newExtent.ymax > last_ext.ymax) {
        view.extent = last_ext;
        console.log("4");
        console.log([view.extent.xmax, view.extent.xmin, view.extent.ymax, view.extent.ymin]);
        evt.stopPropagation();
    }
    else {
        last_ext = view.extent;
    }
});