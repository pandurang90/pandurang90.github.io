---
title: "WebRTC Opentok in Ruby On Rails for Text chat"
description: "Building text chat on OpenTok's WebRTC platform inside a Rails application."
publishDate: "2017-03-17"
tags: ["ruby", "rails", "webrtc", "opentok"]
---
This post will take you through adding text chat to a Ruby on Rails application using OpenTok (a WebRTC platform).

OpenTok is a WebRTC platform for embedding live video, voice and messaging into your websites and mobile apps. OpenTok has its own signaling server, and we will be using the OpenTok signaling API.

:::note
OpenTok is now the Vonage Video API, and the Ruby gem has moved on since this was written. The flow below still shows how signaling works. I also fixed two bugs in the original code: curly quotes that Ruby can't parse, and `session.generate_token` where it should have been `@session.generate_token`.
:::

First, we will do the basic setup for the OpenTok service. Here we will be using the `opentok` Ruby gem.

**1. Add the opentok gem to your Gemfile.**

```ruby
gem 'opentok'
```

**2. Create a session that will attempt to transmit streams directly between clients.**

```ruby title="chats_controller.rb"
class ChatsController < ApplicationController
  def chat
    opentok = OpenTok::OpenTok.new OPENTOK_API_KEY, OPENTOK_SECRET_KEY
    @session = opentok.create_session
    @session_id = @session.session_id
    # generate an OpenTok token
    @token = @session.generate_token
  end
end
```

Store the session id and token somewhere in the database, so that you can use them later on. The token expires in 30 days (the default), so you will need to regenerate it after that.

**3. Now it's time to connect to the session we created above.** Add this to your HTML page:

```erb title="chat.html.erb"
<%= form_tag '#', class: 'chat_form' do %>
  <%= text_field_tag 'message', nil, id: 'chat_msg' %>
  <%= submit_tag 'send' %>
<% end %>

<script src='//static.opentok.com/v2/js/opentok.min.js'></script>
<script type="text/javascript">
 $(document).ready(function(){
   var apiKey = "<%= OPENTOK_API_KEY %>";
   // use the same session_id and token that we generated above.
   var sessionID = "<%= @session_id %>";
   var token = "<%= @token %>";

   var session = OT.initSession(apiKey, sessionID);
   session.connect(token, function(error) {
     if (error) {
       console.log('Unable to connect: ', error.message);
     }
     else {console.log('Connected to the session.');}
   });

   // send the message to the text_chat channel using the signal method on form submit
   $(".chat_form").submit(function(event) {
      event.preventDefault();
      if($('#chat_msg').val() != ""){
         session.signal({
            data: $('#chat_msg').val(),
            type: "text_chat"
            },
            function(error) {
              $('#chat_msg').val('');
            }
          );
      }
   });

   // listen for signals on the text_chat channel
   // in order to receive messages sent to it
   session.on('signal:text_chat', function(event) {
      var message = event.data;
      // do something with the message here,
      // maybe show it in a chat window, or store it in the database if needed
   });
 });
</script>
```

A signal is sent using the `signal()` method of the Session object, and you receive one by listening for the signal event dispatched by the session object.

So all clients connected to the same session and listening to the same signal type (`text_chat` here) will receive a message as soon as someone publishes to the `text_chat` channel.
