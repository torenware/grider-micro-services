const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD
} = require('next/constants');

module.exports = (phase, { defaultConfig }) => {

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      webpackDevMiddleware: config => {
        config.watchOptions.poll = 300;
        return config;
      },
      future: {
        webpack5: false,
      },
      sourceMap: true,
    }
  }
  else if (
    phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER
  ) {
    if (process.env.NEXT_PUBLIC_BASE_URI === 'ingress-nginx-controller.ingress-nginx') {
      console.log(`${phase}: generating source maps...`)
      return {
        generateBuildId: async () => {
          if (process.env.LAST_COMMIT) {

            console.log('Got LAST_COMMIT');
            return process.env.LAST_COMMIT;
          }
          return null;
        },
        productionBrowserSourceMaps: true,
        future: {
          webpack5: false,
        },
      }
    }
  }

  return {
    /* config options for all phases except development here */
    defaultConfig: {}
  }
}
