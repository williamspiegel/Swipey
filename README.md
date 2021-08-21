# Swipey Classic for Reddit
Swipey Classic for Reddit is a mobile-focused, carousel-oriented, Reddit browser. This implementation is built in React Native.

I stopped working on this due to the countless days I spent trying to optimize performance for the full screen carousel layout, but I am very open to Pull Requests, so send any that you can come up with!

I'm likely going to rewrite this app using a different SDK because React Native does not meet my performance requirements for the carousel UI that I want to build.

# Known issues and incomplete features

 - Very poor comment collapsing performance on low-end Android phones. 
	 - This is mainly caused by the lack of first party support for more complicated lists like there are in Flutter. Although I could build out a derivative implementation of Flatlist to support my needs, it will probably be faster to rewrite the whole app in either Flutter or pure native code with the help of KMM.
 - Very poor response time to voting on posts on both platforms
 - Voting on comments hasn't been implemented
 - Commenting on posts and comments hasn't been implemented yet
 - No switching between subreddits
	 - I may build this out if I have time. I also wanted to consider supporting subscribing to subreddits without being logged in with the use of local storage
 - Various crashes when viewing certain posts 
	 - from what I've seen it's caused by posts with multiple images. I haven't gotten around to completing the Image slider for this.
 - Logging in requires you to restart the app in order for certain features to work properly
