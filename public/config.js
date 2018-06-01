var dojoConfig = {
    isDebug:true,
    paths: {
      js: location.href.replace(/\/[^/]+$/, "") + "/ditagis",
      public: location.origin+ "/public",
    },
    map: {
      '*': {
        'css': location.origin + '/javascripts/lib/css.min', // or whatever the path to require-css is
      }
    }
  };