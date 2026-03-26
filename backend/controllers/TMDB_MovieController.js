const { getMovieData, TMDB_ENDPOINT } = require("../utils/tmdbEndpoints");

async function getNowPlaying(req,res){
    try{
        const nowPlayingData = await getMovieData(TMDB_ENDPOINT.fetchNowPlaying);
        res.status(200).json({
            message: "Now Playing Data fetched sucessfully",
            nowPlaying:nowPlayingData
        })

    }catch(err){
        res.status(400).json({
            message:"Someting Went wrong!",
            error: err,
        })

    }
    

}

function getFromThisEndPointKey(endpointKey,customMessage) {
  return async (req, res) => {
    try {
      const response = await getMovieData(endpointKey);
      res.status(200).json({
        message: customMessage || "Data fetched successfully",
        data: response,
      });
    } catch (err) {
      res.status(400).json({
        message: "Something went wrong!",
        error: err.message || err,
      });
    }
  };
}



module.exports = {getNowPlaying,getFromThisEndPointKey}