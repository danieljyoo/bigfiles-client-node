const http = require('http')
const https = require('https')

const api = require('./api')
const streamupload = require('./streamupload')

const DEFAULT_PART_SIZE =  5242880 // 5 MB minimum part size by AWS  

async function upload(uploadid, url, options) {
  var getOptions = {
    // hostname: 'www.google.com',
    // port: 80,
    // path: '/upload',
    // method: 'POST',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded',
    //   'Content-Length': Buffer.byteLength(postData)
    // }
  }
  var readable = await getPromise(url, getOptions)
  console.log("got readable stream", readable)
  return await streamupload.upload(uploadid, readable, options)
}

async function getPromise(url, options) {
  return new Promise((resolve, reject) => {
    var request = url.startsWith('http://') && http || url.startsWith('https://') && https
    request.get(url, (res) => {
      resolve(res)
    }).on('error', (e) => {
      reject(err)
    })
  })
}

module.exports = {
  upload
}