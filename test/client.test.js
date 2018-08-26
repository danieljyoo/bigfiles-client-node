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
const APIKEY = process.env.BIGFILES_APIKEY

describe('Multipart Upload File', () => {
  var uploadid = null
  
  beforeEach(async () => {
    var res = await server.start(TESTBUCKET, TESTKEY, TESTMIMETYPE)
    uploadid = res.id
  })

  it ('should upload a > 5MB image file', async () => {
    var res = await bigfiles.upload(uploadid, TESTFILE)
    console.log("RES", res)
  }, 5 * 60 * 1000)
})