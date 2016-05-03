# MMM-stib
MagicMirror Module to display the next transports for any given STIB station

## Requirements
npm install
- request
- xml2js

## configuration
Get your Station ID from http://m.stib.be/api/getitinerary.php?line=XX where XX is a line number. Check the station id in the resulting xml.
```
modules: [
    {
        module: 'stib',
        config: {
            // add station ID
            //default = 0
            station: 0
        }
    }
]
```
