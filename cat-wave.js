var twitter = require("ntwitter")
    , PushBullet = require('pushbullet')
    , five = require("johnny-five")
    , board
    , pin;

var config = require('./config');

board = new five.Board();

board.on("ready", function() {

  // Create a new `servo` hardware instance.
 pin = new five.Pin({
  pin: config.pin,
  type: "digital"
 });

 console.log("INIT: pin object, testing a wave");
 catwave();

});

function pinhigh() {
    	if(board.isReady) { 
		try {
			pin.high();
		} catch(err) {
			console.log("ERROR: problem raising voltage");
		}
	}
}

function pinlow() {
    	if(board.isReady) { 
		try {
			pin.low();
		} catch(err) {
			console.log("ERROR: problem lowering voltage");
		}
	}
}

function wavestart() {
	console.log("Starting the wave");
	pinhigh();
}

function wavestop() {
	console.log("Stopping the wave");
    	if(board.isReady) { 
		try {
			pinlow();
		} catch(err) {
			console.log("ERROR: problem lowering voltage");
		}
	}
}


function catwave() {
	console.log("Waving!");

	try {
		wavestart();
		setTimeout(wavestop, 20000);
	}
	catch(err) {
		console.log("ERROR: problem calling catwave");
	}
}

var twit = new twitter({
    consumer_key:         config.twitter.consumer_key
  , consumer_secret:      config.twitter.consumer_secret
  , access_token_key:     config.twitter.access_token_key
  , access_token_secret:  config.twitter.access_token_secret
});


twit.stream('statuses/filter', config.twitter.search, function(stream) {
  stream.on('data', function (data) {
    catwave();
    console.log(data.created_at + " : " + data.user.name + " : " + data.user.screen_name + " : " + data.text);
    var url = "https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str;
    var notification = data.user.name + ": " + data.text + " " + url;

    for (var account in config.pushbullet) {
	pusher = new Pushbullet(account);
	pusher.note(config.pushbullet[account], "Cat Wave", notification, function(error, response) {});
    }

  });
});

