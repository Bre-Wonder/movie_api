const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    path = require('path');
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const { generateKey } = require('crypto');
const cors = require('cors');

const passport = require('passport');
require('./passport');

mongoose.connect( process.env.CONNECTION_URI || "mongodb+srv://BreWonderClusterAdmin:roselovely1994@cluster0.zrdk4ni.mongodb.net/myFlixDB?retryWrites=true&w=majority", 
 { useNewUrlParser: true});
/*mongoose.connect('mongodb://localhost:27017/myFlixDB', 
 { useNewUrlParser: true});*/  //hosting database locally

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

let auth = require('./auth')(app);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'memoryLog.text'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

/**
 * Endpoint URL - Sends the request to pull all the movies from the data base.
 * 
 * @param {array} body of data format
 * @return {array} a list of movies
 * 
 */
app.get('/', (req, res) => {
    res.send('You found my favorite movies!')
});

app.get('/documentation', (req, res) => {
    res.send('public/documentation.html', { root: __dirname});
});

app.use('/documentation', express.static('public'));

// get a list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
      .then ((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// find movie by title
app.get('/movies/:movieTitle', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.movieTitle})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
           console.error(err);
           res.status(500).send('Error: ' + err);
        });
});

// find a movie genre by genre name
app.get('/genre/:genreName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName})
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// find a movie director by director name
app.get('/director/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName})
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//creating a user
app.post('/users', 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanuemeric character - not allowed').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username})
        .then ((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + ' already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
            .then ((user) =>{res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
          }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error' + error);
        });
});

//find user information
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({Username: req.params.Username })
    .then((user) => {
      res.json(user);
      })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

//updating user information
app.put('/users/:Username', 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanuemeric character - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', {session: false}), (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()){
      return res.status(422).json ({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    {new: true},
  ) .then (
        (updatedUser) => {   
          res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

//adding a favorite movies to a user's list
app.post('/users/:Username/movies/:movieId', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.movieId}    
    },
    { new: true},
    ).then(
        (updatedUser) => {
                res.json(updatedUser);
        })
      .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          });
});

// delete a movie from user favorite movie list
app.delete('/users/:Username/movies/:movieId', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.movieId}
    },
    { new: true},
    ).then(
        (updatedUser) => {   
          res.json(updatedUser);
        })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// deregister a user
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then ((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status (200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Whoops, something went wrong!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
})