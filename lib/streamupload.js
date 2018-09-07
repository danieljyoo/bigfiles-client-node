const aw = require('awaitify-stream')
const api = require('./api')

const DEFAULT_BASEURL = 'https://c0p55qv0k7.execute-api.us-west-2.amazonaws.com/dev/uploads'
api.setBaseUrl(DEFAULT_BASEURL)


const DEFAULT_PART_SIZE =  5242880 // 5 MB minimum part size by AWS  

async function upload(uploadid, readable, options) {
  options = options || { }
  var partSize = options.partSize || DEFAULT_PART_SIZE
  // 
  reader = aw.createReader(readable)
  var buf = null
  var part = 1
  // read the first part
  console.log("readAsync buf start")
  buf = await reader.readAsync(partSize)
  console.log("readAsync buf done")
  if (buf == null) {
    throw new Error("Nothing to read")
  }
  if (buf != null && buf.length < partSize) {
    var res = await api.uploadSingle(uploadid, buf, options.content_type, options)
    var completed = await api.completeMultipart(uploadid, options)
    return completed
  } 
  if (buf != null && buf.length >= partSize) {
    var parts = [ ]
    var partRes = await api.uploadPart(uploadid, part, buf, options)
    parts.push(partRes)
    part += 1
    while (null !== (buf = await reader.readAsync(partSize))) {
      partRes = await api.uploadPart(uploadid, part, buf, options)
      parts.push(partRes)
      part += 1
    }
    var completed = await api.completeMultipart(uploadid, options)
    return completed.parts = parts
  }
}

module.exports = {
  upload
}