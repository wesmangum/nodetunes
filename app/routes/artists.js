'use strict';

var multiparty = require('multiparty');
var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var fs = require('fs');

exports.index = (req, res)=>{
  artists.find().toArray((err, aArtists)=>
  {
    res.render('artists/index', {artists: aArtists, title: 'NodeTunes - Artists'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>
  {
    var photo = files.photo[0];

    var artist = {
      name: fields.name[0],
      photo: photo.originalFilename
    };

    artists.save(artist, ()=>
    {
      artists.find({name: artist.name, photo: artist.photo}).toArray((err, aArtists)=>
      {
        if(aArtists.length)
        {
          aArtists.forEach((a, i)=>
          {
            var path = photo.path;
            if(i < aArtists.length - 1)
            {
              var sourceData = fs.readFileSync(photo.path);
              path = path.replace('.','temp.');
              fs.writeFileSync(path, sourceData);
            }
            createArtistDirectory(a, path);
          });
        }

        function createArtistDirectory(a, oldPath)
        {
          var newPath = `${__dirname}/../static/img/artists/${a._id}`;
          if(!fs.existsSync(newPath))
          {
            console.log('THIS THING 1');
            fs.mkdirSync(newPath);
            console.log('THIS THING 2');
            fs.renameSync(oldPath, `${newPath}/${photo.originalFilename}`);
            console.log('THIS THING 3');
          }
        }
      });

      res.redirect('/artists');
    });
  });
};

exports.show = (req, res)=>{
  var artistId = req.params.id;

  songs.find({artistID: artistId}).toArray((err, songs)=>{
    res.render('artists/show', {title: 'NodeTunes - Albums', songs: songs});
  });

};
