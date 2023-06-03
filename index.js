const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', 
 { useNewUrlParser: true, useUnifiedToplogy: true});

const express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    path = require('path');

const bodyParser = require('body-parser');
const { generateKey } = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'memoryLog.text'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));
    

let topMovies = [
    {
      title: 'Hunt for the Wilderpeople'
    },
    {
        title: 'Roman Holiday'
    },
    {
        title: 'The Parent Trap'
    },
    {
        title: 'Sisterhood of the Traveling Pants'
    },
    {
        title: 'Emperor\'s New Groove'
    },
    {
        title: 'The Little Mermaid'
    },
    {
        title: 'Ocean\'s Eleven'
    },
    {
        title: 'Crazy Rich Asians'
    },
    {
        title: 'La La Land'
    },
    {
        title: 'Romancing the Stone'
    },
    {
        title: 'How to Loose a A Guy in Ten Days'
    }

]

app.get('/', (req, res) => {
    res.send('You found my favorite movies!')
});

app.get('/documentation', (req, res) => {
    res.send('public/documentation.html', { root: __dirname});
});

app.use('/documentation', express.static('public'));

// get a list of all movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:movieTitle', (req, res) => {
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
app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne({ genreName: req.params.genreName})
        .then((genre) => {
            res.json(genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// find a movie director by director name
app.get('/movies/director/:directorNames', (req, res) => {
    Movies.findOne({ directorNames: req.params.directorNames})
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//creating a user
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username})
        .then ((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + 'already exist');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: req.body.Password,
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

//updating user information
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    {new: true},
    (err, updateUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
    });
});

//adding a favorite movies to a user's list
app.post('/users/:Username/movies/:movieTitle', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.movieTitle }    
    },
    { new: true},
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//COME BACK TO THIS ONE--
app.delete('/users/:Username/movies/:movieTitle', (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.movieTitle} // Is $push the right operator?
    },
    
    )
});

// deregister a user
app.delete('/users/:Username', (req, res) => {
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

app.listen(8080, () => {
    console.log ('Your movies are being spied on');
});