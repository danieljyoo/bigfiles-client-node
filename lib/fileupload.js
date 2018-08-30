const fs = require('fs-extra')
const path = require('path')
const promisify = require('util').promisify
const fsopen = promisify(fs.open)
const fsread = promisify(fs.read)
const fsclose = promisify(fs.close)

const api = require('./api')

const DEFAULT_PART_SIZE =  5242880 // 5 MB minimum part size by AWS  

async function upload(uploadid, fpath, options) {
  options = options || { }
  var partSize = options.partSize || DEFAULT_PART_SIZE
  var size = fs.statSync(fpath).size
  if (size <= partSize) {
    return await uploadSingle(uploadid, fpath, options)
  } else {
    return await uploadMultipart(uploadid, fpath, options)
  }
}

async function uploadSingle(uploadid, fpath, options) {
  var server = options.api || api
  var buf = await fs.readFile(fpath)
  var res = await server.uploadSingle(uploadid, buf, options.content_type, options)
  var completed = await server.completeMultipart(uploadid, options)
  return completed
}

async function uploadMultipart(uploadid, fpath, options) {
  options = options || { }
  var server = options.api || api
  var parts = [ ]
  var fileparts = calcParts(fpath, {
    partSize: options.partSize || DEFAULT_PART_SIZE
  })
  for (var filepart of fileparts.parts) {
    console.log("Uploading part ", filepart)
    var buf = await readPart(fpath, filepart.position, filepart.length)
    var part = await server.uploadPart(uploadid, filepart.part, buf, options)
    console.log("\tDONE", part)
    parts.push(part)
  }
  var completed = await server.completeMultipart(uploadid, options)
  completed.parts = parts
  return completed
}

function calcParts(fpath, options) {
  options = options || { }
  var partSize = options.partSize || DEFAULT_PART_SIZE
  var size = fs.statSync(fpath).size
  var res = calcPartsFromSize(size, partSize)
  res.fpath = fpath
  return res
}

function calcPartsFromSize(size, partSize) {
  var parts = [ ]
  var nparts = Math.ceil(size / partSize)
  for (var i=0; i<nparts; i++) {
    // 0 - 4, 5 - 9, 10 - 12
    var position = i*partSize
    var length = partSize
    if ((position + partSize) > size) {
      length = (size - position)
    }
    parts.push({
      part: i+1,
      position,
      length
    })
  }
  return { n: nparts, size, partSize, parts }
}

async function readPart(fpath, position, length) {
  var fd = await fsopen(fpath, 'r')
  var offset = 0
  var buf = Buffer.alloc(length)
  var { bytesRead, buffer } = await fsread(fd, buf, offset, length, position)
  await fsclose(fd)
  return buf
}

module.exports = {
  calcParts,
  readPart,
  upload,
  uploadSingle,
  uploadMultipart
}