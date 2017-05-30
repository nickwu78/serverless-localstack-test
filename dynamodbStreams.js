const { dynamodb, docClient, dynamodbStreams } = require('./aws')
const co = require('co').wrap
const TableName = 'EventsTable'

function getRecords ({ ShardIterator }) {
  return dynamodbStreams.getRecords({
    ShardIterator
  }).promise()
}

const createTable = co(function* (TableName) {
  console.log(`creating table ${TableName}`)
  try {
    yield dynamodb.createTable({
      "AttributeDefinitions": [
          {
             "AttributeName": "id",
             "AttributeType": "S"
          }
       ],
       "KeySchema": [
          {
             "AttributeName": "id",
             "KeyType": "HASH"
          }
       ],
       "ProvisionedThroughput": {
          "ReadCapacityUnits": 1,
          "WriteCapacityUnits": 1
       },
       "StreamSpecification": {
          "StreamEnabled": true,
          "StreamViewType": "NEW_AND_OLD_IMAGES"
       },
       TableName
    }).promise()

    console.log(`created table ${TableName}`)
  } catch (err) {
    if (err.code === 'ResourceInUseException') {
      console.log(`table ${TableName} already exists`)
    } else {
      throw err
    }
  }
})

function putEvent () {
  const id = new Date().toString()
  return docClient.put({
    TableName,
    Key: { id },
    Item: { id }
  }).promise()
}

co(function* () {
  yield createTable(TableName)
  console.log(`creating record`)
  yield putEvent()
  console.log(`created record`)

  const { Streams } = yield dynamodbStreams.listStreams().promise()
  const { StreamArn } = Streams.find(stream => stream.TableName === TableName)
  console.log(`Stream: ${StreamArn}`)

  const { StreamDescription } = yield dynamodbStreams.describeStream({
    StreamArn
  }).promise()

  console.log(`StreamDecription: ${StreamDecription}`)
  const { Shards } = StreamDescription
  const iterators = yield Promise.all(Shards.map(({ ShardId }) => dynamodbStreams.getShardIterator({
    ShardIteratorType: 'TRIM_HORIZON',
    ShardId,
    StreamArn
  }).promise()))

  const results = yield Promise.all(iterators.map(getRecords))
  const records = results.reduce((all, some) => {
    return all.concat(some.Records)
  }, [])

  console.log(JSON.stringify(records, null, 2))
})()
.catch(console.error)

