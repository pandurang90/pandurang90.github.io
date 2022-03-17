---
layout: post
title: Custom Http Basic authentication using Gin framework
excerpt: Custom Http Basic authentication using Gin framework
---

Recently, I have been working with gin framework in golang. So in our case, we needed to add HTTP basic authentication. 

gin framework provides basic auth in following way where we need to provide accounts information(pairs of username and passwords) 

<script src="https://gist.github.com/pandurang90/a2a801ec2ce3f75264d849013224781d.js"></script>

But It does not work well when you want to authenticate username and password against database. 
So I wrote following middleware to handle it.

<script src="https://gist.github.com/pandurang90/e893b644b62c6ea0ff8a4095df05eb93.js"></script>

This way it avoids you to specify all username/password pairs in middleware for basicauth.
