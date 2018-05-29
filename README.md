Problem statement -
1) Create a simple one-to-one chat application using socket.io. This chat application
should also capture the events like “other user is typing”.
2) This chat application should also identify the user that it typing. It should have
login and logout feature, with proper notification to other user who is in the chat.
Something like “Aditya has logged out”, “Aditya has joined the chat etc”
3) The chat should be real time and using socket, but for storing the chat history
between two people. It should use mongodb. So, store the chat of users into
mongodb (along with their username) , so that this can be retrived later by user
by scrolling up. (just like facebook messenger)
Hint - use nodejs events to store the chat. Don’t disturb the usual flow of
socket.io code by introduction mongoose save or any other mongoose function.
Perform these database calls in a separate nodejs event. This is how realtime
chat systems usually work.



Steps for application

1. got to the http://ec2-18-221-163-96.us-east-2.compute.amazonaws.com
2. Register yourself 
3. After registered you will prompt to login screen automatically, give your email and password and hut login button.
4. after that you will be redirected to chat page.Yo can chat here.
