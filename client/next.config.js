module.exports = {
  // make next a bit more responsive to fs changes.
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300;
    return config;
  }
};
