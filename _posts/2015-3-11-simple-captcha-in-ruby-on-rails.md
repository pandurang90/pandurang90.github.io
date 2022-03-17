---
layout: post
title: Simple Captcha in Ruby On Rails
excerpt: Simple Captcha in Ruby On Rails
---

When your application has a form that's available to everyone for eg. Contact us, you will be spammed! So what can we do about it? 

Well, one option is to have all forms secured by authentication... OR we can use a captcha. So, Here is how you can implement your own simple captcha in Ruby on Rails,

First of all we will create Captcha class in lib folder,
<script src="https://gist.github.com/pandurang90/ae0db85f15d562e5a5c5.js"></script>

Here we are dumping the variables into a string using YAML and then encrypt/decrypt.

Then in your Controller,

{% highlight ruby %}
class ContactsController < ApplicationController

  def new
    @captcha = Captcha.new
  end

  def create
    @captcha = Captcha.decrypt(params[:captcha_secret])

    unless @captcha.correct?(params[:captcha])
      flash.now[:alert] = "Please make sure you entered correct value for captcha."
      # Here we need to initialize @captcha with new object in order to show 
      # different captcha each time on form 
      @captcha = Captcha.new
      render :new
    else
      ContactsMailer.notify(contact).deliver
      flash[:notice] = "Your message has been sent successfully"
      redirect_to root_path
    end
  end
end
{% endhighlight %}
In your view,
{% highlight ruby %}
<div class="field">
  <%= hidden_field_tag :captcha_secret, @captcha.encrypt %>
  <%= label_tag :captcha, @captcha.question %>
  <%= text_field_tag :captcha, "" %>
</div>
{% endhighlight %}
That's it. And it will look similar to this,


![_config.yml]({{ site.baseurl }}/images/captcha.png)