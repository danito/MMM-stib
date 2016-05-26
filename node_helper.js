/* Magic Mirror
 * Node Helper: Stib
 *
* By Danito https://github.com/danito
* MIT Licensed.
*/

var NodeHelper = require("node_helper");
var validUrl = require("valid-url");
var StibFetcher = require("./stibFetcher.js");

module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var self = this;
		var lines = [];

		this.fetchers = [];

		console.log("Starting node helper for: " + this.name);

	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "ADD_STATION") {
			this.createFetcher(payload.url, payload.fetchInterval, payload.stationid);
		}
	},

	/* createFetcher(url, reloadInterval)
	 * Creates a fetcher for a new url if it doesn't exsist yet.
	 * Otherwise it reuses the exsisting one.
	 *
	 * attribute url string - URL of the news feed.
	 * attribute reloadInterval number - Reload interval in milliseconds.
	 */

	createFetcher: function(url, fetchInterval, stationid) {
		var self = this;

		if (!validUrl.isUri(url)) {
			self.sendSocketNotification("INCORRECT_URL", {url: url});
			return;
		}

		var fetcher;
		if (typeof self.fetchers[url] === "undefined") {
			console.log("Create new waiting time fetcher for url: " + url + " - Interval: " + fetchInterval);
			fetcher = new StibFetcher(url, fetchInterval, stationid);

			fetcher.onReceive(function(fetcher) {
				//console.log('Broadcast lines.');
				//console.log(fetcher.lines());
          console.log("STIB node helper " + JSON.stringify(fetcher.lines()));

				self.sendSocketNotification("STIB_WAITINGTIMES", {
					url: fetcher.url(),
					lines: fetcher.lines(),
                                        stationid: fetcher.stationid()
				});
			});

			fetcher.onError(function(fetcher, error) {
				self.sendSocketNotification("FETCH_ERROR", {
					url: fetcher.url(),
					error: error
				});
			});

			self.fetchers[url] = fetcher;
		} else {
			console.log('Use existing waitingtime fetcher for url: ' + url);
			fetcher = self.fetchers[url];
			fetcher.broadcastLines();
		}

		fetcher.startFetch();
	}
});
