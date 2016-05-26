var request = require('request');
var parseString = require('xml2js').parseString;
var stibFetcher = function(url,reloadInterval,stationid) {
  var self = this;

  var realoadTimer = null;
  var lines = [];

  var fetchFailedCallback = function() {};
  var linesReceivedCallback = function() {};
  
  /*
  *
  */
  var fetchStib = function() {

    clearTimeout(realoadTimer);
    realoadTimer = null;

    request(url, function(err, response, data) {
      if (err) {
        fetchFailedCallback(self,err);
        scheduleTimer();
        return;
      }
      if (response.statusCode == 200) {
       
        // get json from data (xml)
        parseString(data, function(error, results) {
          var newLines = [];
          for (var e in results) {
             lines = results[e];           
          }
     
        //  console.log("STIB results waitingtime " + JSON.stringify(lines));
   
          self.broadcastLines();
          scheduleTimer();
        });
      } else {
        fetchFailedCallback(self,response.statusCode);
        scheduleTimer();
        return;
      }
    });
  };

    var scheduleTimer = function() {
    clearTimeout(realoadTimer);
    realoadTimer = setTimeout(function(){
      fetchStib();
    },reloadInterval);
  };
  
  /* public methods */

	/* startFetch()
	 * Initiate fetchCalendar();
	 */
	this.startFetch = function() {
		fetchStib();
	};

  
  /* broadcastItems()
	 * Broadcast the exsisting events.
	 */
	this.broadcastLines = function() {
		//console.log('Broadcasting ' + events.length + ' events.');
		linesReceivedCallback(self);
	};

  /* onReceive(callback)
  * Sets the on success callback
  *
  * argument callback function - The on success callback.
  */
  this.onReceive = function(callback) {
    linesReceivedCallback = callback;
  };

  /* onError(callback)
  * Sets the on error callback
  *
  * argument callback function - The on error callback.
  */
  this.onError = function(callback) {
    fetchFailedCallback = callback;
  };
  /* url()
  * Returns the url of this fetcher.
  *
  * return string - The url of this fetcher.
  */
  this.url = function() {
    return url;
  };
  this.stationid = function() {
      return stationid;
  };
  
  /* lines()
  * Returns current available events for this fetcher.
  *
  * return array - The current available events for this fetcher.
  */
  this.lines = function() {
                console.log("STIB this.lines " + JSON.stringify(lines));

    return lines;
  };
};

module.exports = stibFetcher;
