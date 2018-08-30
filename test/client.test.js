require('dotenv').config()
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
const TESTSMALLKEY = 'images.small.jpg'

const APIKEY = process.env.BIGFILES_APIKEY

describe('Multipart Upload File', () => {
  var uploadid = null
  
  // beforeEach(async () => {

  // })

  it ('should upload a > 5MB image file', async () => {
    var res = await server.start(TESTBUCKET, TESTKEY, TESTMIMETYPE)
    console.log("LARGERES", res)
    var uploadid = res.id

    var res = await bigfiles.upload(uploadid, TESTFILE)
    console.log("RES", res)
  }, 5 * 60 * 1000)

  it ('should upload a small < 5MB image file', async () => {
    var res = await server.start(TESTBUCKET, TESTSMALLKEY, TESTMIMETYPE)
    console.log("SMALLMULT", res)
    var uploadid = res.id

    var res = await bigfiles.upload(uploadid, TESTSMALLFILE, { content_type: TESTMIMETYPE })
    console.log("SMALLRES", res)
  })
})