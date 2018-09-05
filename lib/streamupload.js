const aw = require('awaitify-stream')
const api = require('./api')

const DEFAULT_PART_SIZE =  5242880 // 5 MB minimum part size by AWS  

async function upload(uploadid, readable, options) {
  options = options || { }
  var partSize = options.partSize || DEFAULT_PART_SIZE
  // 
  reader = aw.createReader(readable)
  var buf = null
  var part = 1
  // read the first part
  buf = await reader.readAsync(partSize)
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