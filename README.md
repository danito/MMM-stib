# MMM-stib
MagicMirror Module to display the next transports for any given STIB station

## Requirements
npm install
- request
- xml2js
## install
clone or download and extract MMM-Stib to MagickMirror/modules/stib (rename the folder).

## configuration
Get your Station IDs from http://m.stib.be/api/getitinerary.php?line=XX&iti=Y where XX is a line number and Y is 1 or 2 (for one or return way). Check the station ids in the resulting xml.
```
modules: [
    {
        module: 'stib',
        config: {
            // add station ID
            //default = 0
            stations: [
                       {name:"Trone",
                        id:[8302,8301]
                       },
                       {name:"Luxembourg",
                        id: [1131,1162]
                       }
                      ] 
        }
    }
]
```
