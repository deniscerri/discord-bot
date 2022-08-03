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
- [x] clear all songs that are put by users who have left the queue
- [x] move songs around the queue to the top or swap songs positions
- [x] set song volume
- [x] loop a song
- [x] restart a song from the beginning
- [x] skip a song, even to a index from the queue
- [x] add multiple songs at the same time in the queue
- [x] seek to a certain time in the song
- [x] fast forward by certain seconds
- [x] rewind by certain seconds
- [x] show play history. [Will clear if the bot leaves the channel]
- [x] shuffle the queue

## Screenshots of some commands: 

<p float="left">
  <img src="https://user-images.githubusercontent.com/64997243/181926249-830425e3-2acb-4b6d-b762-682a20340f78.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926253-ad040cd5-1690-4688-9a21-a8ac1b76d0cc.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926259-7a7ac9ec-4cc4-4a4f-82aa-da198b48abce.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926261-7d64ed60-8fbe-4b32-8e17-cbb8cc413e07.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926263-afebb362-a28e-461e-9991-9a09afff1a62.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926265-f733e1f4-b8d8-4132-9d2a-128659d3c4e4.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926268-efced1b0-0449-42e0-bdcd-e2e173de5b68.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926269-8aaa1f08-86f2-4d41-bc05-92ba31cc3b1a.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926272-3337c25b-d58d-4bc5-b97c-ef739a210bea.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926274-d29b1d1d-e59b-41d7-847a-5284f1dc6c5d.png" width="50%" />
  <img src="https://user-images.githubusercontent.com/64997243/181926276-43f794fd-acfe-4e06-a276-e80f427d2e92.png" width="50%" />
</p>




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
