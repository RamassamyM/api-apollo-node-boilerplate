'use strict';

module.exports = {
  "plugins": ['plugins/markdown'],
  "recurseDepth": 10,
  "source": {
    "include": ["seeders", "src"],
    "exclude": [],
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "(^|\\/|\\\\|node_modules/|docs)_"
  },
  "sourceType": "module",
  "tags": {
      "allowUnknownTags": true,
      "dictionaries": ["jsdoc","closure"]
  },
  "templates": {
      "cleverLinks": false,
      "monospaceLinks": false
  },
  "opts": {
    "encoding": "utf8",               // same as -e utf8
    "destination": "./jsdoc/",          // same as -d ./out/
    "recurse": true,                  // same as -r
    "tutorials": "./jsdoc/tutorials", // same as -u path/to/tutorials,
    "template": "./node_modules/clean-jsdoc-theme"
  },
}