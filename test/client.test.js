require('dotenv').config()
const fs = require('fs')
const path = require('path')
const bigfiles = require('../lib/client')

// File we are going to be uploading using the client
const TESTFILE = path.join(__dirname, 'image.test.jpg')

// Variables needed by the server library to start the multipart upload
const server = require('bigfiles-server-node')(process.env.BIGFILES_APIKEY)
const TESTMIMETYPE = 'image/jpeg'
const TESTBUCKET = 'test.funcmatic.com'
const TESTKEY = 'image.test.jpg'

// Small file upload tests
const TESTSMALLFILE = path.join(__dirname, 'image.small.jpg')
const TESTSMALLKEY = 'image.small.jpg'

// Stream Keys
const TESTKEYSTREAM = 'image.stream.jpg'
const TESTSMALLKEYSTREAM = 'image.small.stream.jpg'

// URL
const TESTKEYURL = 'image.url.jpg'
const IMAGEURL = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Earth_poster_large.jpg'
const TESTSMALLKEYURL = 'image.small.url.jpg'
const IMAGESMALLURL = 'https://image.pbs.org/video-assets/iZOsUzY-asset-mezzanine-16x9-8YZsCRv.jpg.focalcrop.1920x940.50.10.jpg'

const APIKEY = process.env.BIGFILES_APIKEY

// describe('Upload File', () => {
//   var uploadid = null
  
//   it ('should upload a > 5MB image file', async () => {
//     var res = await server.start(TESTBUCKET, TESTKEY, TESTMIMETYPE)
//     console.log("LARGERES", res)
//     var uploadid = res.id

//     var res = await bigfiles.upload(uploadid, TESTFILE)
//     console.log("RES", res)
//   }, 5 * 60 * 1000)

//   it ('should upload a small < 5MB image file', async () => {
//     var res = await server.start(TESTBUCKET, TESTSMALLKEY, TESTMIMETYPE)
//     console.log("SMALLMULT", res)
//     var uploadid = res.id

//     var res = await bigfiles.upload(uploadid, TESTSMALLFILE, { content_type: TESTMIMETYPE })
//     console.log("SMALLRES", res)
//   })
// })

// describe('Upload Stream', () => {
//   var uploadid = null

//   it ('should upload a > 5MB image stream', async () => {
//     var res = await server.start(TESTBUCKET, TESTKEYSTREAM, TESTMIMETYPE)
//     console.log("LARGERES", res)
//     var uploadid = res.id

//     var res = await bigfiles.upload(uploadid, fs.createReadStream(TESTFILE))
//     console.log("RES", res)
//   }, 5 * 60 * 1000)

//   it ('should upload a < 5MB image stream', async () => {
//     var res = await server.start(TESTBUCKET, TESTSMALLKEYSTREAM, TESTMIMETYPE)
//     console.log("SMALLMULT", res)
//     var uploadid = res.id

//     var res = await bigfiles.upload(uploadid, fs.createReadStream(TESTSMALLFILE), { content_type: TESTMIMETYPE })
//     console.log("SMALLRES", res)
//   })
// })

describe('Upload URL', () => {
  it ('should upload a > 5MB image from a url', async () => {
    var res = await server.start(TESTBUCKET, TESTKEYURL, TESTMIMETYPE)
    var uploadid = res.id
    console.log("uploadid", uploadid)
    var res = await bigfiles.upload(uploadid, IMAGEURL, { content_type: TESTMIMETYPE })
    console.log("RES", res)
  }, 10 * 60 * 1000)
  it ('should upload a < 5MB image using a url', async () => {
    var res = await server.start(TESTBUCKET, TESTSMALLKEYURL, TESTMIMETYPE)
    var uploadid = res.id
    console.log("uploadid", uploadid)
    var res = await bigfiles.upload(uploadid, IMAGESMALLURL, { content_type: TESTMIMETYPE })
    console.log("RES", res)
  }, 10 * 60 * 1000)
})