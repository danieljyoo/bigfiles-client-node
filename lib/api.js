
const request = require('request-promise-native')

var baseUrl = null

function setBaseUrl(url) {
  baseUrl = url
}

async function uploadSingle(uploadid, buf, content_type, options) {
  var { url } = await putObjectUrl(uploadid, buf, options)
  var requestOptions = {
    method: 'PUT',
    url: url,
    body: buf,
    encoding: null,
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': content_type
    }
  }
  var res = await request(requestOptions)
  return {
    uploadid,  
    etag: res.headers.etag
  }
}

async function uploadPart(uploadid, part, buf, options) {
  var { url } = await uploadPartUrl(uploadid, part, options)
  var requestOptions = {
    method: 'PUT',
    url: url,
    body: buf,
    encoding: null,
    resolveWithFullResponse: true
  }
  var res = await request(requestOptions)
  return {
    uploadid, part, 
    etag: res.headers.etag
  }
}

async function putObjectUrl(uploadid, buf, options) {
  var requestOptions = {
    method: 'GET',
    url: `${baseUrl}/${uploadid}/put`,
    json: true
  }
  return await request(requestOptions)
}

async function uploadPartUrl(uploadid, part, options) {
  var requestOptions = {
    method: 'GET',
    url: `${baseUrl}/${uploadid}/${part}`,
    json: true
  }
  return await request(requestOptions)
}

async function completeMultipart(uploadid, options) {
  var requestOptions = {
    method: 'POST',
    url: `${baseUrl}/${uploadid}`,
    body: {},
    json: true
  }
  var res = await request(requestOptions)
  return res
}

async function abortMultipart(uploadid, options) {
  var requestOptions = {
    method: 'DELETE',
    url: `${baseUrl}/${uploadid}`,
    json: true
  }
  var res = await request(requestOptions)
  return res
}

module.exports = {
  setBaseUrl,
  uploadPart,
  uploadSingle,
  completeMultipart,
  abortMultipart
}