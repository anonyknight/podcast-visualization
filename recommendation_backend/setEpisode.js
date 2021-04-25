const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
exports.handler = async (event, context, callback) => {
    
    let rating = event["queryStringParameters"]['rating']
    let episodeId =  event["queryStringParameters"]['episodeId']
    let clusterId =  event["queryStringParameters"]['clusterId']
      
      // Tasks can be run parallely
      // Update Episode Rating
      // Update Cluster Score
      // Update liked table (copy over from cluster table)
    var task1 = await updateEpisodeRating(episodeId, clusterId, rating).catch((err) => {console.error(err)})
    var task2 = await updateClusterScore(clusterId,rating).catch((err) => {console.error(err)})
    var task3 = await copyOverData(episodeId,clusterId).catch((err) => {console.error(err)})
    console.log(task1,task2,task3)
     callback(null, {
           statusCode: 200,
           body: 'Cluster Rating Updated',
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
        TableName: "cluster"+clusterId,
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

function updateClusterScore(clusterId,rating)
{
    var params = {
        TableName: "clusterScore",
        Key: {
            "clusterId": clusterId,
        },
        UpdateExpression: "SET score = score + :delta, n = n + :acc",
        ExpressionAttributeValues: {
            ":delta": parseInt(rating),
            ":acc": 1
        }
    }
    return db.update(params).promise();
}

async function copyOverData(episodeId,clusterId)
{
    let episodeData = await getItem(episodeId,clusterId)
    await removeItem(episodeId,clusterId)
    if(episodeData.Item)
    {
        await updateLikedTable(episodeData.Item)
    }
}

function getItem(episodeId, clusterId)
{
    var params = {
    TableName:"cluster"+clusterId,
    Key:{
        "episodeId": episodeId,
        },
    };

    return db.get(params).promise();
}

function removeItem(episodeId, clusterId)
{
    var params = {
    TableName:"cluster"+clusterId,
    Key:{
        "episodeId": episodeId,
        },
    };

    return db.delete(params).promise();
}

function updateLikedTable(data)
{
  var params = {
        TableName: "likedEpisodes",
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
