const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
exports.handler = async (event, context, callback) => {

    // Reset cluster score table
    // Copy back over from liked table to respective cluster table
    for(var i=0;i<=4;i++) await resetClusterScores(i).catch((err) => {console.error(err)})
    
    var likedData = await getLikedData().catch((err) => {console.error(err)})
    for(var i=0;i<likedData.Items.length;i++)
    {    
        await removeLikedData(likedData.Items[i]).catch((err) => {console.error(err)})
         await writeToCluserTable(likedData.Items[i]).catch((err) => {console.error(err)})
    }
   
     callback(null, {
           statusCode: 200,
           body: 'Reset Succeeded',
           headers:{
              "Access-Control-Allow-Origin" : "*"
           }
       })
};

function resetClusterScores(clusterId)
{
    var params = {
        TableName: "clusterScore",
        Key: {
            "clusterId": clusterId.toString(),
        },
        UpdateExpression: "SET score = :zero, n = :zero",
        ExpressionAttributeValues: { ":zero": 0 }
    }
    return db.update(params).promise();
}

function getLikedData()
{
    var params = {
    TableName:"likedEpisodes",
    Limit:100,
    };

    return db.scan(params).promise();
}

function removeLikedData(data)
{
    var params = {
    TableName:"likedEpisodes",
    Key:{
        "episodeId": data.episodeId,
        },
    };

    return db.delete(params).promise();
}

function writeToCluserTable(data)
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
            "liked": false,
            "rating": 0,
         }
    }
    return db.put(params).promise();
}
