const AWS = require('aws-sdk')
AWS.config.update({
  region: 'us-east-1'
})

module.exports = {
  s3: new AWS.S3({
    endpoint: 'http://localhost:4572',
  }),
  dynamodb: new AWS.DynamoDB({
    endpoint: 'http://localhost:4569',
  }),
  docClient: new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:4569',
  }),
  dynamodbStreams: new AWS.DynamoDBStreams({
    endpoint: 'http://localhost:4570',
  })
}
