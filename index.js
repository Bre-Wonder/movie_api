/**
 * @file This is the main server file for the myFlix API, a movie database web application.
 * @version 1.0.0
 * @requires express
 * @requires mongoose
 * @requires morgan
 * @requires body-parser
 * @requires passport
 * @requires cors
 */

/**
 * Imports and configures Mongoose to connect to the database.
 * Uses either environment variable CONNECTION_URI or defaults to MongoDB Atlas URL.
 */
const mongoose = require('mongoose');

/**
 * @module Models
 * @requires ./models.js
 */
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


/**
 * Express app instance.
 * @const
 */
const app = express();

/** Middlewares */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/**
 * @middleware auth
 * Initializes Passport authentication.
 */
let auth = require('./auth')(app);

/**
 * @middleware morgan
 * Logs HTTP requests to memoryLog.text.
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'memoryLog.text'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

/**
 * @route GET /
 * @description Welcome message.
 */
app.get('/', (req, res) => {
    res.send('You found my favorite movies!')
});

/**
 * @route GET /documentation
 * @description Serves static HTML documentation.
 */
app.get('/documentation', (req, res) => {
    res.send('public/documentation.html', { root: __dirname});
});

app.use('/documentation', express.static('public'));

/**
 * @route GET /movies
 * @description Return a list of all movies.
 * @access Protected
 */
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

/**
 * @route GET /movies/:movieTitle
 * @description Return data about a single movie by title.
 * @access Protected
 */
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

/**
 * @route GET /genre/:genreName
 * @description Return genre data for a given genre name.
 * @access Protected
 */
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

/**
 * @route GET /director/:directorName
 * @description Return director data for a given director name.
 * @access Protected
 */
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

/**
 * @route POST /users
 * @description Register a new user.
 * @param {string} Username - must be alphanumeric and at least 5 characters.
 * @param {string} Password - required.
 * @param {string} Email - must be valid format.
 */
app.post('/users', 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric character - not allowed').isAlphanumeric(),
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

/**
 * @route GET /users/:Username
 * @description Get user data by username.
 * @access Protected
 */
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

/**
 * @route PUT /users/:Username
 * @description Update user information.
 * @access Protected
 */
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

/**
 * @route POST /users/:Username/movies/:movieId
 * @description Add movie to user's list of favorites.
 * @access Protected
 */
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

/**
 * @route DELETE /users/:Username/movies/:movieId
 * @description Remove movie from user's favorites.
 * @access Protected
 */
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

/**
 * @route DELETE /users/:Username
 * @description Deregister user.
 * @access Protected
 */
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

/**
 * @middleware ErrorHandler
 * @description Catches unhandled errors and responds with 500.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Whoops, something went wrong!');
});

/**
 * @description Starts the server and listens on environment port or default 8080.
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
})