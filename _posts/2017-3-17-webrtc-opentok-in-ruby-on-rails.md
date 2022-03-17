---
layout: post
title: WebRTC Opentok in Ruby On Rails for Text chat
excerpt: WebRTC Opentok in Ruby On Rails for Text chat
---

This post will take you through adding text chat functionality using Opentok (a WebRTC platform) in Ruby on Rails. 

OpenTok is a WebRTC platform for embedding live video, voice, and messaging into your websites and mobile apps. Opentok has its own signalling server. We will be using the OpenTok signaling API.
First, we will make the basic setup for using Opentok service. Here we will be using ‘opentok’ ruby gem.

1) Add opentok gem to your Gemfile.
{% highlight ruby %}
gem ‘opentok’
{% endhighlight %}

2) Then create a session that will attempt to transmit streams directly between clients.
<script src="https://gist.github.com/pandurang90/8b7484bfa4a74ab382d0.js"></script>

Store session id and token somewhere in the database, so that you can use it later on.
Here token gets expired in 30 days(default value). You will need to regenerate after 30 days.

3) Now it’s time to connect to session that we have created above, Add this to your HTML page,
<script src="https://gist.github.com/pandurang90/8a58452ff9ed3f3b3775.js"></script>

A signal is sent using the `signal()` method of the Session object. One can receive a signal by listening to a signal event dispatched by session object.
So, All clients who are connected to the same session and listening to same signal type(`text_chat` here) will receive a message as soon as someone publishes to channel `text_chat`.