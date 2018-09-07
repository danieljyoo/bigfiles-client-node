require('dotenv').config()
const urlupload = require('../lib/urlupload')

// Variables needed by the server library to start the multipart upload
const server = require('bigfiles-server-node')(process.env.BIGFILES_APIKEY)
const TESTMIMETYPE = 'image/jpeg'
const TESTBUCKET = 'test.funcmatic.com'
const TESTKEY = 'image.writeablestream.jpg'
const TESTLARGEKEY = 'image.large.writeablestream.jpg'

const IMAGEURL = 'https://image.pbs.org/video-assets/iZOsUzY-asset-mezzanine-16x9-8YZsCRv.jpg.focalcrop.1920x940.50.10.jpg'
const IMAGELARGEURL = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Earth_poster_large.jpg'

describe('Request pipe', () => {
  it ('should pipe a request of a small file < 5MB', async () => {
    var res = await server.start(TESTBUCKET, TESTKEY, TESTMIMETYPE)
    var uploadid = res.id

    var writable = new BigFilesWritable({ uploadid })
    await request(IMAGEURL).pipe(writable)
  }, 30 * 1000)
  it ('should pipe a request of a large file > 5MB', async () => {
    var res = await server.start(TESTBUCKET, TESTLARGEKEY, TESTMIMETYPE)
    var uploadid = res.id
    var res = await urlupload.upload(uploadid, IMAGELARGEURL, { content_type: TESTMIMETYPE })
    console.log("RES", res)
  }, 30 * 1000)
})