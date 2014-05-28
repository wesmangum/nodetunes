/* jshint unused:false */

'use strict';

var artists = global.nss.db.collection('artists');
var albums = global.nss.db.collection('albums');
var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');
var Mongo = require('mongodb');
var _ = require('lodash');



exports.index = (req, res)=>{
  songs.find().toArray((err, aSongs)=>{
    albums.find().toArray((err, aAlbums)=>{
      artists.find().toArray((err, aArtists)=>{
        res.render('songs/index', {songs: aSongs, albums: aAlbums, artists: aArtists, title: 'NodeTunes - Songs'});
      });
    });
  });
};


exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{

    var albumId= Mongo.ObjectID(fields.album[0]);

    albums.find({_id: albumId}).toArray((err, album)=>{

      var artistId = Mongo.ObjectID(album[0].artistID);

      artists.find({_id: artistId}).toArray((err, artist)=>{

        var song = {
          title: fields.title[0],
          file: files.song[0].originalFilename,
          genre: fields.genre[0],
          album: album[0].title,
          albumID: album[0]._id.toString(),
          artist: artist[0].name,
          artistID: artist[0]._id.toString()
        };
        console.log(song);

        songs.save(song, ()=>{
          songs.find({title: song.title}).toArray((err, aSongs)=>{
            if(aSongs.length){
              aSongs.forEach((s, i)=>{
                var path = files.song[0].path;
                console.log('PATH: '+ path);
                if(i < aSongs.length - 1){
                  var sourceData = fs.readFileSync(path);
                  path = path.replace('.','temp.');
                  fs.writeFileSync(path, sourceData);
                }
                createSongDirectory(s, path);
              });
            }

            function createSongDirectory(s, oldPath){
              var newPath = `${__dirname}/../static/audios/songs/${s._id}`;
              if(!fs.existsSync(newPath)){
                fs.mkdirSync(newPath);
                fs.renameSync(oldPath, `${newPath}/${song.file}`);
              }
            }
          });
          res.redirect('/songs');
        });
      });
    });
  });
};

exports.filter = (req, res)=>{
  albums.find().toArray((err, aAlbums)=>{
    songs.find({genre: req.query.genre}).toArray((err, aSongs)=>{
      res.render('songs/index', {songs: aSongs, albums: aAlbums, title: 'NodeTunes - Songs'});
    });
  });
};
