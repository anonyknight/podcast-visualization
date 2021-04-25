const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
exports.handler = async (event, context, callback) => {
    
    let rating = event["queryStringParameters"]['rating']
    let episodeId =  event["queryStringParameters"]['episodeId']
    let clusterId =  event["queryStringParameters"]['clusterId']
      
     var res = await GetItem(episodeId).catch((err) => {console.error(err)})
     await updateEpisodeRating(episodeId, clusterId, rating).catch((err) => {console.error(err)})
     await updateClusterScore(clusterId,res.Item.rating ,rating)
     callback(null, {
           statusCode: 200,
           body: 'Liked Rating Updated',
           headers:{
              "Access-Control-Allow-Origin" : "*"
           }
       })
};

function updateEpisodeRating(episodeId, clusterId, rating)
{
    var liked = false
    if(rating>0)
    {
        liked = true
    }
    var params = {
        TableName: "likedEpisodes",
        Key: {
            "episodeId": episodeId,
        },
        UpdateExpression: "SET rating = :rating, liked =:liked",
        ExpressionAttributeValues: {
            ":rating": rating,
            ":liked": liked
        }
    }
    return db.update(params).promise();
}

function GetItem(episodeId)
{
    var params = {
    TableName:"likedEpisodes",
    Key:{
        "episodeId": episodeId,
        },
    };

    return db.get(params).promise();
}

function updateClusterScore(clusterId,oldRating,newRating)
{
    var params = {
        TableName: "clusterScore",
        Key: {
            "clusterId": clusterId,
        },
        UpdateExpression: "SET score = score + :delta",
        ExpressionAttributeValues: {
            ":delta": parseInt(newRating)-parseInt(oldRating)
        }
    }
    return db.update(params).promise();
}
