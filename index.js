const express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    path = require('path');

const app = express();

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

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/movies/:movieName', (req, res) => {
    res.send('Here are all the movie Titles')
});

app.get('/movies/genre/:genreName', (req, res) => {
    res.send('Listed is the genre of the movies')
});

app.get('/movies/director/:directorNames', (req, res) => {
    res.send('Listed is the name of the Director')
});

app.post('/users', (req, res) => {
    res.send('You created a new user')
});

app.put('/users/:id', (req, res) => {
    res.send('You updated info for one of our users')
});

app.post('/users/:id/:movieTitle', (req, res) => {
    res.send('You added a movie to your favorites list')
});

app.delete('/users/:id/:movieTitle', (req, res) => {
    res.send('You have taken this movie off of your favorites list')
});

app.delete('/users/:id', (req, res) => {
    res.send('You have deleted this user')
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Whoops, something went wrong!');
});

app.listen(8080, () => {
    console.log ('Your movies are being spied on');
});