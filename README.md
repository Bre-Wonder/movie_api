# myFlix API

### Project Description: 
The objective of this projest was to build a server-side component of a web applications meant to user to interact with movies. Each user will be able to review a listing of movies and be able to add them to their favorites list. Movies have different pieces of information that the user can look at such as director, genre, and summary. A user can also create, update, and delete a profile. 

### Technologies Used: 
Express | Node.js | MongoDB | 


### How to start up this project?
I'm a MAC user, all instructions will be geared that way since that's the way that I have mine set up. 

Installing Node: 
  Create an Apple Developer Account
  From your Apple Developer account, download Xcode from the App Store. Make sure to install it.
  In your terminal, run `xcode-select --install`
  Check to see which shell is being used on your terminal
  See Installing and Updating for `nvm` on their repository
  Test to see if installation was successful by running `command -v nvm`
  To install the latest version of Node run - `nvm install lts/*` or `nvm install --lts`
  To check your version of node or to confirm it was installed run `node -v`

Install Express: 
  In your command line in the terminal, run `npm install express`

Install body-parser:
  In your command line in the terminal, run `npm install body-parser`

Note: It will be helpful when writing your endpoints to know which will need to be Created, Updated, Read, and Deleted. 



### API Used:
I built my own API in this project through EXPRESS and Node.js. API is hosted in Heroku.


### What would I do differently? 
A helpful contribution to this API would have been to have an endpoint for a user's favorite movies. An endpoint like this would allow for quicker load times instead of the current solution. Right now all the movies are loading from the database and filtering out the ones that are not the user's favorite list. Depending on how big the application may get, this could prevent a lag in waiting for all the movies to load. This allows for the application to be more scalable with a bigger database. 


GitHub Repository site: https://github.com/Bre-Wonder/movie_api

Live Site: API hosted on Heroku