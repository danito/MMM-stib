/* Get Waitingtimes for Brussels public transport */

/* Magic Mirror
 * Module: stib
 *
 * By Danito https://github.com/danito
 * MIT Licensed.
 */

Module.register("stib", {
    defaults: {
        fetchInterval: 1 * 60 * 1000, // Update every 5 minutes.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        apiBase: "http://m.stib.be/api/getwaitingtimes.php",
        stations: [
            {
                name: "",
                id: [0, 0]
            }
        ]
    },
    getStyles: function () {
        return ["stib.css", "font-awesome.css"];
    },
    // translations
    // Define required translations.
    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json",
            nl: "translations/nl.json",
            fr: "translations/fr.json"
        };
    },
    //override start method.
    start: function () {
        Log.log("starting module: " + this.name);

        for (var c in this.config.stations) {
            var station = this.config.stations[c];
            var id = station.id;
            for (var i in id) {
                var stationid = id[i];
                if (stationid !== 0) {
                    url = this.getUrl(stationid);
                    this.addStation(url, stationid);
                }
            }
        }
        this.stationData = [];
        this.stations = [];
        this.loaded = false;
    },
    // override socket notification handle
    socketNotificationReceived: function (notification, payload) {
        if (notification === "STIB_WAITINGTIMES") {

            console.log(payload);
            if (this.hasStationID(payload.stationid) && (payload.lines.length !== 0)) {
                console.log("stopnma " + payload.lines.stopname[0])
                this.processLines(payload.lines.waitingtime, payload.lines.stopname[0]);
                /* var stopname;
                 var station;
                 var linedata;
                 var lines = {};
                 stopname = payload.lines.stopname[0];
                 station = "S" + payload.stationid.toString();
                 waitingtimes = payload.lines.waitingtime;
                 console.log("STIB Stopname " + stopname + ' ' + station);
                 // lines = {[stopname:{[station:payload.lines.waitingtime]}]};
                 lines[stopname] = {};
                 lines[stopname][station] = {};
                 lines[stopname][station] = linedata;
                 console.log(JSON.stringify(lines));
                 var a = [];
                 var b = [];
                 var c = this.stationData;
                 b[stopname] = [];
                 a[station] = linedata;
                 //c.push(b);
                 c[stopname].push(a);
                 Log.log("HERE WE ARE: " + "STIB DATA");
                 Log.log(c);*/
                this.loaded = true;
            }
        } else if (notification === "FETCH_ERROR") {
            Log.error("Stib Error. Could not fetch data from: " + payload.url);
        } else if (notification === "INCORRECT_URL") {
            Log.error("Stib Error. Incorrect url: " + payload.url);
        } else {
            Log.log("Stib received an unknown socket notification: " + notification);
        }

        this.updateDom(this.config.animationSpeed);
    },
    processLines: function (lines, stopname) {
        console.log("stopname/ " + stopname);
        var w = [];
        var d = [];
        var n = [];
        var s = [];
        var d = this.stationData;
        s[stopname] = [];
        if (this.stations.indexOf(stopname) == -1) {
            this.stations.push(stopname);
            console.log("new sn " + stopname);
        } else {
            console.log("stopname " + stopname + " already in list");
        }
        console.log(this.stations);
        for (var l in lines) {
            s[stopname][lines[l].mode[0] + lines[l].line[0]] = [];
        }

        for (var l in lines) {
            s[stopname][lines[l].mode[0] + lines[l].line[0]][lines[l].destination[0]] = [];

        }
        for (var l in lines) {
            s[stopname][lines[l].mode[0] + lines[l].line[0]][lines[l].destination[0]].push(lines[l].minutes[0]);
        }
        for (var l in lines){
           var sn = stopname; // "MAX WALLER"
           var ln = lines[l].mode[0] + lines[l].line[0]; // "T97"
           var ld = lines[l].destination[0]; // "Louise"
           var lm = lines[l].minutes[0]; // 1
            if (typeof d[sn] === "undefined") { // d["MAX WALLER"] doesn't exist
                d[sn] = s[sn]; // d["MW] = s["MW"]
                console.log("d["+sn+"]");
                console.log(d[sn]);
            } else {
                if (typeof d[sn][ln] === "undefined"){ // d["MW"]["T97"]
                    d[sn][ln]=(s[sn][ln]); //  d["T97"]= s["LOUISE"][mm,mm]
                } else {
                    if (typeof d[sn][ln][ld] === "undefined") {
                        d[sn][ln][ld]=(s[sn][ln][ld]);  // add ["LOUISE"][mm,mm]
                    } else {
                        d[sn][ln][ld] = s[sn][ln][ld]; // update 
                    }
                }
            }
        }
        this.stationData = d;

        console.log(s);
        console.log(d);
    },
    // override dom
    getDom: function () {
        var wrapper = document.createElement("div");
        if (!this.loaded) {
            wrapper.innerHTML = this.translate('LOADING');
            wrapper.className = "dimmed light small";
            return wrapper;
        }
        var table = document.createElement("table");
        table.className = "small";
        var row = document.createElement("tr");
        table.appendChild(row);

        for (var s in this.stations) {
            var row = document.createElement("tr");
            table.appendChild(row);
            var stopCell = document.createElement("td");
            stopCell.colSpan = "4";
            stopCell.className = "stopname";
            stopCell.innerHTML = this.stations[s];
            row.appendChild(stopCell);
            for (var lines in this.stationData[this.stations[s]]) {
                console.log(lines);
                var row = document.createElement("tr");
                table.appendChild(row);
                var lineCell = document.createElement("td");
                lineCell.rowSpan = 2;
                lineCell.innerHTML = lines;
                row.appendChild(lineCell);
                for (var d in this.stationData[this.stations[s]][lines]) {
                    var destCell = document.createElement("td");
                    destCell.className = "destination";
                    destCell.innerHTML = d;
                    row.appendChild(destCell);
                    for (var m in this.stationData[this.stations[s]][lines][d]) {
                        var minCell = document.createElement("td");
                        minCell.className = "minutes";
                        minCell.innerHTML = this.stationData[this.stations[s]][lines][d][m];
                        row.appendChild(minCell);
                    }
                    var row = document.createElement("tr");
                    table.appendChild(row);
                }

            }
            /* for (var line in this.stationData[stops]) {
             for (var l in this.stationData[stops][line]) {
             var row = document.createElement("tr");
             table.appendChild(row);
             var lineCell = document.createElement("td");
             lineCell.rowSpan = 2;
             lineCell.innerHTML = line;
             row.appendChild(lineCell);
             for (var d in this.stationData[stops][line])
             var destCell = document.createElement("td");
             destCell.className = "destination";
             destCell.innerHTML = this.stationData[stops][ids][l]["destination"][0]
             row.appendChild(destCell);
             var minCell = document.createElement("td");
             minCell.innerHTML = this.stationData[stops][ids][l]["minutes"][0]
             row.appendChild(minCell);
             }
             
             }
             */
        }
        return table;

    },
    /* hasStationID()
     * Check if the config contains station id != 0
     */
    hasStationID: function (id) {
        for (var c in this.config.stations) {
            var station = this.config.stations[c];
            if (station.id[0] === id || station.id[1] === id) {
                console.log("STIB Has station id " + id);
                return true;
            }
        }
        return false;
    },
    /*   addStation(id)
     * send id to modhelper (stibFetcher)
     */
    addStation: function (url, stationid) {
        this.sendSocketNotification("ADD_STATION", {
            url: url,
            stationid: stationid,
            fetchInterval: this.config.fetchInterval
        });
    },
    /* getUrl(id)
     * return string
     */
    getUrl: function (id) {
        var params = "?";
        params += "halt=" + id;
        var url = this.config.apiBase + params;
        return url;
    }
});
