---
layout: post
title: Transfer files over netcat using Applescript
excerpt: Transfer files over netcat using Applescript
---

At my workplace me and one of my colleague used to transfer files like database dumps etc. for projects from one machine to another.


I came across netcat (nc command) and when we tried that it just worked so quickly, i got surprised with the speed with which it got transferred. :)
So i wrote applescript that transfers file using netcat, with dialog boxes.

<script src="https://gist.github.com/pandurang90/8538105.js"></script>

after saving(netcat.scpt) this file to your machine just type in your terminal
osascript your_path/netcat.scpt
It will simplify your work to transfer file rather than remembering syntax for netcat 
  OR 
if you want more shortcut to do this you can add it to .bash_profile file
{% highlight bash %}
alias netcat='osascript your_path/netcat.scpt'
{% endhighlight %}

and then just type `netcat` in terminal.. enjoy :)
