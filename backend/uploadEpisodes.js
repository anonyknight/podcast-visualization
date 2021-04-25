const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
exports.handler = async (event, context, callback) => {
    
    let data = JSON.parse(event["body"])
    var task = await updateClusterTable(data).catch((err) => {console.error(err)})
    console.log(task)
     callback(null, {
           statusCode: 200,
           body: data.clusterId,
           headers:{
             "Access-Control-Allow-Origin" : "*"
           }
       })
};


function updateClusterTable(data)
{
    var params = {
        TableName: "cluster"+data.clusterId,
         Item:{
            "episodeId": data.episodeId,
            "showName": data.showName,
            "showDesc": data.showDesc,
            "language": data.language,
            "episodeName": data.episodeName,
            "episodeDesc": data.episodeDesc,
            "duration": data.duration,
            "clusterId": data.clusterId,
            "title":data.title,
            "thumbnail" : data.thumbnail,
            "author": data.author,
            "date": data.date,
            "liked": data.liked,
            "rating": data.rating,
         }
    }
    return db.put(params).promise();
}
