var dojoConfig = {
    isDebug:true,
    paths: {
      js: location.href.replace(/\/[^/]+$/, "") + "/ditagis",
      ditagis: location.origin+ "/public/ditagis",
    },
    map: {
      '*': {
        'css': location.origin + '/javascripts/lib/css.min', // or whatever the path to require-css is
      }
    }
  };