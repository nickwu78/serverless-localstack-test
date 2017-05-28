const fs = require('fs')
const AWS = require('aws-sdk')
const co = require('co').wrap
const s3 = new AWS.S3({
  endpoint: 'http://localhost:4572',
  s3ForcePathStyle: true
})

const Bucket = 'testbucket'
const KB = 1024
const MB = 1024 * KB
const hundredMegs = 100 * MB

co(function* () {
  yield s3.createBucket({ Bucket }).promise()
  console.log('created bucket')

  let size = KB
  while (size < hundredMegs) {
    let key = (size / KB) + 'KB of nonsense'
    console.log('putting', key)
    yield s3.putObject({
      Key: key,
      Bucket,
      Body: new Buffer(size)
    })
    .promise()

    size *= 2
    console.log('successfully put', key)
  }
})()
