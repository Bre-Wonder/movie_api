const express = require('express');
const app = express ();

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
        title: 'Emperor New Groove'
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
    res.sendFile('public/documentation.html', { root: __dirname});
});

app.use('/documentation.html', express.static('public'));

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.listen(8080, () => {
    console.log ('Your movies are being spied on');
})