const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
exports.handler = async (event, context, callback) => {
   
   let clusterId = event['queryStringParameters']['clusterId']
   await readEpisodes(clusterId).then(data =>
   {
       callback(null, {
           statusCode: 200,
           body: JSON.stringify(data.Items),
           headers:{
               "Access-Control-Allow-Origin" : "*"
           }
       })
   }).catch((err) => {console.error(err)})
};

function readEpisodes(clusterId)
{
    var params = {
      TableName: 'cluster'+clusterId,
      Limit: 7,
    };
    return db.scan(params).promise();
}
