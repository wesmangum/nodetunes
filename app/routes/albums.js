/* jshint unused:false */

'use strict';

var artists = global.nss.db.collection('artists');
var albums = global.nss.db.collection('albums');
var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');
var Mongo = require('mongodb');


exports.index = (req, res)=>{

  albums.find().toArray((err, aAlbums)=>{
    artists.find().toArray((err, aArtists)=>{
      res.render('albums/index', {albums: aAlbums, artists: aArtists, title: 'NodeTunes - Albums'});
    });
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>
  {
    var cover = files.cover[0];

    var album = {
      title: fields.title[0],
      cover: cover.originalFilename,
      artistID: fields.artist[0]
    };

    albums.save(album, ()=>
    {
      albums.find({title: album.title, cover: album.cover}).toArray((err, aAlbums)=>
      {
        if(aAlbums.length)
        {
          aAlbums.forEach((a, i)=>
          {
            var path = cover.path;
            if(i < aAlbums.length - 1)
            {
              var sourceData = fs.readFileSync(cover.path);
              path = path.replace('.','temp.');
              fs.writeFileSync(path, sourceData);
            }
            createArtistDirectory(a, path);
          });
        }

        function createArtistDirectory(a, oldPath)
        {
          var newPath = `${__dirname}/../static/img/albums/${a._id}`;
          if(!fs.existsSync(newPath))
          {
            fs.mkdirSync(newPath);
            fs.renameSync(oldPath, `${newPath}/${cover.originalFilename}`);
          }
        }
      });

      res.redirect('/albums');
    });
  });
};


exports.show = (req, res)=>{

  var albumId = req.params.id;

  songs.find({albumID: albumId}).toArray((err, songs)=>{
    res.render('albums/show', {title: 'NodeTunes - Albums', songs: songs});
  });

};
