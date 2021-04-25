const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
exports.handler = async (event, context, callback) => {
   var liked = await readLikedEpisodes().catch((err) => {console.error(err)})
   
   let scores = []
   let res = await getClusterScores()
   for(var i=0;i<res.Items.length;i++)
   {
     if (parseInt(res.Items[i].n) == 0)
       scores.push([res.Items[i].clusterId,0])
     else
        scores.push([res.Items[i].clusterId,parseInt(res.Items[i].score)/parseInt(res.Items[i].n)])
   }
    scores.sort(function compare(kv1, kv2) { return kv2[1] - kv1[1]})

   // In tradeoff between precision and recall, we get results from top 3 clusters with lengths 3,2,1
   var recommended = [];
   for(var j=0;j<3;j++)
   {
       console.log(scores[j][0],3-j)
        var recData = await generateRecommendedEpisodes(scores[j][0],3-j);
        if(recData!=null && recData.Items!=null)
        {
            for (var i = 0; i < recData.Items.length; i++) {
                recommended.push(JSON.stringify(recData.Items[i]))
            }
        }
   }
  
   var response = [JSON.stringify(liked), recommended]
   callback(null, {
       statusCode: 200,
       body: JSON.stringify(response),
       headers:{
          "Access-Control-Allow-Origin" : "*"
       }
    });
}

function readLikedEpisodes()
{
    var params = {
      TableName: 'likedEpisodes',
      Limit: 100
    };
    return db.scan(params).promise();
}


function generateRecommendedEpisodes(clusterId,limit)
{
    var params = {
       TableName: 'cluster'+clusterId,
       Limit: limit,
    };
    return db.scan(params).promise();
}

function getClusterScores()
{
     var params = {
       TableName: 'clusterScore',
    };
    return db.scan(params).promise();
}
