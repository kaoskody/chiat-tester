
import _ from 'lodash';
import express from 'express';
import downloadDirectory from '../utils/downloadDirectory';
import {Server} from 'http';
import serveStatic from 'serve-static';
import fs from 'fs';
import Bluebird from 'bluebird';
import path from 'path';

Bluebird.promisifyAll(fs);

const app = express();
const server = Server(app);

app.use(serveStatic(__dirname + '/public'));

app.get('/api/games.json', function(req, res) {
  const gameDirectory = path.resolve(process.cwd(), process.argv[2] || '');

  const gameName = gameDirectory.split('/').pop();

  res.err = downloadDirectory(gameDirectory).then(game=> {
    res.json({game});
  });
});

server.listen(3000);

/*
 There are three contexts I want to be able to load a chiat game:
 1. Within a web app
 2. Within a react-native app
 3. Within a node server

 Compile each source file into a es5 file that exports a function that takes a new require function. Then I can inject each file into 
 the app in question.
*/
