const fileupload = require('./fileupload')
const streamupload = require('./streamupload')
const isStream = require('is-stream')
const api = require('./api')
const DEFAULT_BASEURL = 'https://c0p55qv0k7.execute-api.us-west-2.amazonaws.com/dev/uploads'

class Client {

  constructor(options) { 
    this.baseurl = options.baseurl || process.env.BIGFILES_BASEURL || DEFAULT_BASEURL
    api.setBaseUrl(this.baseurl)
  }

  async upload(uploadid, src, options) {
    options = options || { }
    if (typeof src === 'string') {
      return await fileupload.upload(uploadid, src, options)
    }
    if (isStream(src)) {
      return await streamupload.upload(uploadid, src, options)
    }
  }

  async cancel(uploadid, options) {
    options = options || { }
    return await api.abortMultipart(uploadid, options)
  }
}

function createClient(options) {
  options = options || { }
  return new Client(options)
}

module.exports = createClient()