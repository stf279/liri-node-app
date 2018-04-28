require("dotenv").config();
var keys = require('./keys.js');
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
var request = require("request");
var fs = require('fs');

// get the API key values from the .env file via keys.js
var spotifyKeys = new Spotify(keys.spotify);
var twitterKeys = new Twitter(keys.twitter);

let userFunction = process.argv[2];

var userParameters = process.argv[3];

for(let i=4; i<process.argv.length; i++){
	userParameters += `+${process.argv[i]}`;
}

let timeStamp;
function getTimeStamp(){
    timeStamp = new Date(); 
}

function userInput(){
	switch(userFunction){

        case 'my-tweets':
		getTwitter();
		break;

		case 'spotify-this-song':
		getSpotify();
		break;

		case 'movie-this':
		getMovie();
		break;

		case 'do-what-it-says':
		getSays();
		break;
		
	}
};

function getTwitter(){

	var parameters = {
		screen_name: userParameters, 
		count: 5 
    };

    twitterKeys.get('statuses/user_timeline', parameters, function(error, tweets, response){
		if (!error) {
	        for (let i=0; i<tweets.length; i++) {
	            var returnedData = ('Tweet Number: ' + (i+1) + '\n' + tweets[i].created_at + '\n' + tweets[i].text + '\n');
	            console.log(returnedData);
                console.log("-------------------------");
                getTimeStamp();
                fs.appendFile("log.txt", `***New Log Entry at ${timeStamp}***\nNEW TWITTER SEARCH EVENT:\nNunmber ${i+1}:\nCreated On: ${tweets[i].created_at}\nContent: ${tweets[i].text}\n`,function(err){
                    if(err){
                    console.log(`error writing to the log: ${err}`)
                    }
                })
	        }
        }
        else {

            console.log("THERE WAS AN ERROR PLEASE TRY AGAIN")
            
        };
	});
} 

function getSpotify(){

	let searchTerm;
	if(userParameters === undefined){
        searchTerm = "The Sign Ace of Base";
        console.log("searching for The Sign by Ace of Base");
	}else{
        // if there are search terms, use the userParameter that was formatted by our for loop
		searchTerm = userParameters;
	}
	//execute the spotify search using the searchTerm
	spotifyKeys.search({type:'track', query:searchTerm}, function(error,data){
	    if(error){
	        console.log(`error: ${error}`);
	        return;
	    }else{
            // if no error was encountered, print the return data: 
	  		console.log("Artist Name: " + data.tracks.items[0].artists[0].name);
            console.log("Song Name: " + data.tracks.items[0].name);

            // check to see if the preview URL returned is null. Spotify returns null for preview URL 
            // when you query a song that is not available to stream in your region. If it is null, return 
            // some information to that effect. If it's not null, return the preview URL
            if (data.tracks.items[0].preview_url == null){
                console.log("Preview URL is not available - song is not available to stream in your region")
            }
            else{
                console.log("Preview URL: " + data.tracks.items[0].preview_url);
            };
            console.log("Album Name: " + data.tracks.items[0].album.name);
            getTimeStamp();
            fs.appendFile("log.txt", `***New Log Entry at ${timeStamp}***\nNEW SONG SEARCH EVENT:\nArtist Name: ${data.tracks.items[0].artists[0].name}\nSong Name: ${data.tracks.items[0].name}\nPreview URL: ${data.tracks.items[0].preview_url}\nAlbum Name:${data.tracks.items[0].album.name}\n------\n`,function(err) {
            });
	    }
	});
}