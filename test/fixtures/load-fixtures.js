'use strict';

const fs = require('fs');
const path = require('path');

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../src', relPath), 'utf8'));
}

// Config files
global.defaultArticConfig = loadJSON('configFiles/default_articConfig.json');
global.defaultArticDesign = loadJSON('configFiles/default_articDesign.json');

// DB configs
global.aeDbConfig = loadJSON('demoDBs/ae/ae_DBconfig.json');
global.emaDbConfig = loadJSON('demoDBs/ema/ema_DBconfig.json');
global.epgdorsalDbConfig = loadJSON('demoDBs/epgdorsal/epgdorsal_DBconfig.json');

// Bundle data
global.msajc003_bndl = loadJSON('demoDBs/ae/msajc003_bndl.json');
global.ae_bundleList = loadJSON('demoDBs/ae/ae_bundleList.json');
global.dfgspp_mo1_prosody_0024_bndl = loadJSON('demoDBs/ema/dfgspp_mo1_prosody_0024_bndl.json');
global.JDR10_bndl = loadJSON('demoDBs/epgdorsal/JDR10_bndl.json');

// Schemas
global.annotationFileSchema = loadJSON('schemaFiles/annotationFileSchema.json');
global.bundleListSchema = loadJSON('schemaFiles/bundleListSchema.json');
global.bundleSchema = loadJSON('schemaFiles/bundleSchema.json');
global.DBconfigFileSchema = loadJSON('schemaFiles/DBconfigFileSchema.json');
global.globalDBSchema = loadJSON('schemaFiles/globalDBschema.json');
global.articConfigSchema = loadJSON('schemaFiles/articConfigSchema.json');
global.designSchema = loadJSON('schemaFiles/designSchema.json');

// Hardcoded data from mockedData.js
var dataArr = [1, 2, 3, 4, 5, 6, 7, 8];
var buf = new Float32Array(dataArr).buffer;
global.parsedWavJSO = {
  "ChunkID": "RIFF",
  "ChunkSize": 116214,
  "Format": "WAVE",
  "Subchunk1ID": "fmt ",
  "Subchunk1Size": 16,
  "AudioFormat": 1,
  "NumChannels": 1,
  "SampleRate": 20000,
  "ByteRate": 40000,
  "BlockAlign": 2,
  "BitsPerSample": 16,
  "Subchunk2ID": "data",
  "Subchunk2Size": 0,
  "Data": [1, 2, 3, 4, 5, 6, 7, 8],
  "origArrBuf": buf
};

// Helper function from mockedData.js
global.getItemFromJSON = function (anno, itemID) {
  for (var x = 0; x < anno.levels.length; x++) {
    for (var j = 0; j < anno.levels[x].items.length; j++) {
      var item = anno.levels[x].items[j];
      if (item.id === itemID) {
        return item;
      }
    }
  }
  return undefined;
};
