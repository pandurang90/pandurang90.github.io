---
title: "WebRTC Opentok in Ruby On Rails for Text chat"
description: "Building text chat on OpenTok's WebRTC platform inside a Rails application."
publishDate: "2017-03-17"
tags: ["ruby", "rails", "webrtc", "opentok"]
---
This post will take you through adding text chat functionality using Opentok (a WebRTC platform) in Ruby on Rails. 

OpenTok is a WebRTC platform for embedding live video, voice, and messaging into your websites and mobile apps. Opentok has its own signalling server. We will be using the OpenTok signaling API.
First, we will make the basic setup for using Opentok service. Here we will be using ‘opentok’ ruby gem.

1) Add opentok gem to your Gemfile.
```ruby
gem ‘opentok’
```

2) Then create a session that will attempt to transmit streams directly between clients.
```ruby title="chats_controller.rb"
class ChatsController < ApplicationController
  def chat
    opentok = OpenTok::OpenTok.new OPENTOK_API_KEY, OPENTOK_SECRET_KEY
    @session = opentok.create_session
    @session_id = @session.session_id
    # generate opentok token
    @token = session.generate_token
  end
end
```

Store session id and token somewhere in the database, so that you can use it later on.
Here token gets expired in 30 days(default value). You will need to regenerate after 30 days.

3) Now it’s time to connect to session that we have created above, Add this to your HTML page,
```erb title="chat.html.erb"
<%= form_tag '#', class: 'chat_form' do %>
   <%= text_field_tag ‘message’, id: ‘chat_msg’%>
   <%= submit_tag ‘send’%>
<% end %>

<script src='//static.opentok.com/v2/js/opentok.min.js'></script>
<script type="text/javascript">
 $(document).ready(function(){
   var apiKey = <%= OPENTOK_API_KEY %>
   // use same session_id and token that we have generated above.
   var sessionID = "<%= @session_id %>"
   var token = "<%= @token %>"

   var session = OT.initSession(apiKey, sessionID);
   session.connect(token, function(error) {
     if (error) {
       console.log('Unable to connect: ', error.message);
     }
     else {console.log('Connected to the session.');}
   }); 

   // send message to text_chat channel using signal method on form submit
   $(".chat_form").submit(function(event) {
      event.preventDefault();
      if($('#chat_msg').val() != ""){
         session.signal({
            data:$('#chat_msg').val(),
            type:"text_chat"
            },
            function(error) {
              $('#chat_msg').val('');
            }
          );
      }
   });

   // listen for the signal on text_chat channel
   // in order to receive message sent to channel text_chat
   session.on('signal:text_chat', function(event) {
      message = event.data
      // do some stuff here with message,
      // maybe show in chat window/store in database if needed
   });

});
```

A signal is sent using the `signal()` method of the Session object. One can receive a signal by listening to a signal event dispatched by session object.
So, All clients who are connected to the same session and listening to same signal type(`text_chat` here) will receive a message as soon as someone publishes to channel `text_chat`.