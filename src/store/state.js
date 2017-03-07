import localStorage from 'store'

export default {
  loading: false,
  apiUrl: null,
  config: {
    protocol: null,
    host: null,
    port: null,
    prefix: null,
    secret: null
  },
  originalSetup: null,
  core: {
    collections: {},
    endpoints: {}
  },
  setup: {
    collections: {},
    endpoints: {}
  },
  showDocs: localStorage.get('showDocs')
}
