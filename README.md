**My first project on discord.**

## Denis Discord Bot

Denis Discord Bot is a nice useful bot you can use on your discord server. It has alot of commands you can use and have fun with.

## Commands:

- [x] 8ball game
- [x] show discord avatar and server avatar
- [x] define words
  - [x] get urban definitions
  - [x] get serious definitions
- [x] send a random fact
- [x] search pictures online
- [x] send random memes from reddit
- [x] send info about movies & tv shows
  - [x] send what is hot recently if you don't provide a query
- [x] send roasts
- [x] send random topics to talk about

<br><br>

## Music Commands:

- [x] play [youtube,soundcloud,spotify] by using queries/song or video links/playlist links
- [x] pause
- [x] show lyrics of current playing song or a custom song
- [x] show what's currently playing
- [x] play a song then put at the top of the queue
- [x] play a song then immediately play it without affecting the queue
- [x] manage song queue by clearing portions or the whole thing
- [x] clear all songs put by a certain user from the queue
- [x] loop a song
- [x] restart a song from the beginning
- [x] skip a song, even to a index from the queue
- [x] add multiple songs at the same time in the queue
- [x] seek to a certain time in the song
- [x] fast forward by certain seconds
- [x] rewind by certain seconds
- [x] show play history. [Will clear if the bot leaves the channel]
- [x] shuffle the queue

## Dev environment:

After cloning the project you have to install the npm libraries.
This bot uses the Discord.js v13 package. To run it, you need to have a node version of 16.6 or higher.

Don't forget to provide your own API Keys in your .env file. All API's used in the bot are free and available for everyone to use.

## What to write on your .env file

TOKEN= <br>
moviedb= <br>
google_search= <br>
TMDBproxy= <br>
SpotifyClientID= <br>
SpotifyClientSecret= <br>
SpotifyRefreshToken= <br>

TMDB proxy is created in cases if the bot is making too many requests to tmdb. You can create your own by using the code at: <br>
https://tmdb-proxy.deniscerri.repl.co

Apart from the images scraper library, the bot also uses a costum google search api for faster results. You need to create your own at:

```
https://developers.google.com/custom-search/v1/overview
```

You can get the Spotify codes by looking through the play-dl documentation.

Generated URL should be like this

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=277062273344&scope=bot%20applications.commands
```

Replace CLIENT_ID with your bot. You can find it it Discord's Developer portal, General Information, Application ID

Alot of the bot's commands are powered through REST API calls.
I thank every developer that have made the projects this bot depends on. :)
