const api = require('./api')
const DEFAULT_BASEURL = 'https://c0p55qv0k7.execute-api.us-west-2.amazonaws.com/dev/uploads'
api.setBaseUrl(DEFAULT_BASEURL)

const { Writable } = require('stream')
const DEFAULT_PART_SIZE =  5242880
//const DEFAULT_PART_SIZE =  16384 * 2 

class BigFilesWritable extends Writable {
  constructor(options) {
    options = options || { }
    //options.highWaterMark = options.highWaterMark || DEFAULT_PART_SIZE
    // Calls the stream.Writable constructor
    super(options)

    this.uploadid = options.uploadid
    this.totalBytes = 0
    this.part = 1
    this.buffers = [ { 
      status: 'ACCEPT',
      buf: Buffer.alloc(DEFAULT_PART_SIZE),
      index: 0
    }, {
      status: 'ACCEPT',
      buf: Buffer.alloc(DEFAULT_PART_SIZE),
      index: 0
    } ]
    this.bufActiveIndex = 0
    this.bufStart = 0
  }

  _write(chunk, encoding, done) {
    //console.log(`Received chunk (${chunk.length} bytes) encoding=${encoding}`)
    var active = this.getActiveBuffer()
    var copyLength = bytesLeft(active) - chunk.length
    console.log(`Active buffer start=${active.index} (${copyLength} bytes left)`)
    if (copyLength < 0) {
      chunk.copy(active.buf, active.index, 0, bytesLeft(active))
      active.index += copyLength
      var overflow = this.getOverflowBuffer()
      chunk.copy(overflow.buf, overflow.index, bytesLeft(active))
      overflow.index += (chunk.length - copyLength)
    } else {
      chunk.copy(active.buf, active.index)
      active.index += chunk.length
    }
    this.totalBytes += chunk.length
    if (isFull(active)) {
      console.log("Buffer is full")
      done(false) // we initiate backpressure 
      console.log("backpressrure")
      this.swapBuffers()
      console.log("swapped")
      return api.uploadPart(this.uploadid, this.part, active.buf)
      .then((data) => {
        console.log('upload buffer finished', data)
        console.log("UPLOADED")
        console.log('DRAIN')
        this.emit('drain')
      })
    } else {
      done()
    }
  }

  _final(callback) {
    console.log("FINAL", this.totalBytes)
    var active = this.getActiveBuffer()
    if (this.totalBytes <= DEFAULT_PART_SIZE) {
      console.log('uploadSingle')
      return api.uploadSingle(this.uploadid, active.buf, 'image/jpeg')
      .then((data) => {
        console.log("COMPLETED")
        return api.completeMultipart(this.uploadid)
      })
      .then((data) => {
        console.log("CALLBCK")
        callback()
      })
    } else if (active.index > 0) {
      console.log("final upload")
      this.uploadPart(this.uploadid, this.part, active.buf)
      .then((data) => {
        console.llog
        return api.completeMultipart(this.uploadid)
      })
      .then((data) => {
        callback()
      })
    }
    api.completeMultipart(this.uploadid)
    .then((data) => {
      callback()
    })
  }

  getActiveBuffer() {
    return this.buffers[this.bufActiveIndex]
  }

  getOverflowBuffer() {
    var overflowIndex = (this.bufActiveIndex + 1) % this.buffers.length
    return this.buffers[overflowIndex]
  }

  swapBuffers() {
    this.bufActiveIndex = (this.bufActiveIndex + 1) % this.buffers.length
  }

  async uploadBuffer(buffer) {
    console.log('UPLOADING')
    var res = await api.uploadPart(this.uploadid, this.part, buffer.buf)
    console.log("UPLOADED")
    console.log('DRAIN')
    this.emit('drain')
    return res
  }

  upload(buffer) {
    return new Promise((resolve, reject) => {
      buffer.index = 0
      resolve(buffer)
    })
  }
}


function bytesLeft(buffer) {
  return buffer.buf.length - buffer.index
}

function isFull(buffer) {
  return bytesLeft(buffer) == 0
}


module.exports = BigFilesWritable

// options <Object>

// highWaterMark <number> Buffer level when stream.write() starts returning false. Default: 16384 (16kb), or 16 for objectMode streams.
// decodeStrings <boolean> Whether or not to decode strings into Buffers before passing them to stream._write(). Default: true.
// objectMode <boolean> Whether or not the stream.write(anyObj) is a valid operation. When set, it becomes possible to write JavaScript values other than string, Buffer or Uint8Array if supported by the stream implementation. Default: false.
// emitClose <boolean> Whether or not the stream should emit 'close' after it has been destroyed. Default: true.
// write <Function> Implementation for the stream._write() method.
// writev <Function> Implementation for the stream._writev() method.
// destroy <Function> Implementation for the stream._destroy() method.
// final <Function> Implementation for the stream._final() method.