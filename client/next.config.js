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
    }
  }
  else if (
    phase === PHASE_PRODUCTION_BUILD
  ) {
    if (process.env.NEXT_PUBLIC_BASE_URI === 'ingress-nginx-controller.ingress-nginx') {
      console.log(`${phase}: generating source maps...`)
      return {
        productionBrowserSourceMaps: true
      }
    }
  }

  return {
    /* config options for all phases except development here */
    defaultConfig: {}
  }
}
