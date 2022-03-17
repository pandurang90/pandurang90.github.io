---
layout: post
title: Client side SSL Certificate Authentication with Rails and Nginx
excerpt: Client side SSL Certificate Authentication with Rails and Nginx
---


Recently, I worked on one application which required SSL client certificate based authentication.
So just wanted to share it with you all about how it can be integrated in Rails application.


This article is about using SSL certificates installed into a web browser to authenticate against a Ruby on Rails application with Nginx.


Steps for creating certificates,

1) First thing you will need is to configure openssl.cnf, check following gist for configuring your openssl.cnf , as its big file so cant embed here. [https://gist.github.com/pandurang90/dbe6a67339747ef5bacf](https://gist.github.com/pandurang90/dbe6a67339747ef5bacf) 
In this configuration important thing is setting path to CA dir,
{% highlight bash %}
[ CA_default ]
dir = /path/to/ca
{% endhighlight %}
this is the path where you are going create your CA.

2) Then you will need to create your own CA(Certificate Authority) that issues Digital certificates.
For that we will use CA.pl script is a perl script that supplies the relevant command line arguments to the openssl command for some common certificate operations. It is intended to simplify the process of certificate creation and management by the use of some simple options.
{% highlight bash %}
cd /path/to/ca
CA.pl -newca 
{% endhighlight %}
Make sure here you enter domain name in common name field when asked in this.

3) Now generate web server CSR
{% highlight bash %}
openssl req -new -nodes -keyout www.example.org.key -out www.example.org.csr
{% endhighlight %}
then self sign web server Certificate
{% highlight bash %}
openssl ca -config /etc/openssl.cnf -policy policy_anything -out www.example.org.crt -infiles www.example.org.csr
{% endhighlight %}
that gives you web server certificates

4) Now its time to configure nginx server,
 https://gist.github.com/pandurang90/8f0c11819db4c866d985

5) Generating Client certificate, 
{% highlight ruby %}
CERT_DIR = "path/to/ca"
user_name = "test user"
id = 1

def create_p12
  subj = "/C=US/ST=YourState/L=city/O=example/OU=example/CN=#{user_name})/emailAddress=#{email}"
  dir_name  = "#{CERT_DIR}#{id}"
  Dir.mkdir(dir_name) unless File.directory?(dir_name)
  create_cert(subj)
  sign_cert
  generate_p12
end

def create_cert(subj)
  system("openssl req -new -sha1 -newkey rsa:1024 -nodes -keyout #{CERT_DIR}#{id}/#{user_name}.key -out #{CERT_DIR}#{id}/#{user_name}.csr -subj '#{subj}'")
end

def sign_cert
  system("openssl ca -batch -config /usr/lib/ssl/openssl.cnf -policy policy_anything -extensions ssl_client -out #{CERT_DIR}#{id}/#{user_name}.crt -infiles #{CERT_DIR}#{id}/#{user_name}.csr")
end

def generate_p12
  system("openssl pkcs12 -export -clcerts -in #{CERT_DIR}#{id}/#{user_name}.crt -certfile #{CERT_DIR}demoCA/cacert.pem -inkey #{CERT_DIR}#{id}/#{user_name}.key -out #{CERT_DIR}#{id}/#{user_name}.p12 -name '#{name}' -passout pass:#{export_password} ")
end
{% endhighlight %}
Here,
{% highlight ruby %}
subj = "/C=US/ST=YourState/L=city/O=example/OU=example/CN=#{user_name})/emailAddress=#{email}"
{% endhighlight %}
is a subject for certificate which can be unique for each user or same based on settings in your openssl.cnf.

6) Install your certificate on web browser(p12 file), then hit url of website and it will ask to submit client certificate , just select required certificate from list and submit. Then in your controller you can get certificate using,
{% highlight ruby %}
cert = request.env["HTTP_X_SSL_CLIENT_S_DN"]
{% endhighlight %}
as we have initialized variable in nginx configuration.
{% highlight bash %}
proxy_set_header X-SSL-Client-S-DN   $ssl_client_cert 
{% endhighlight %}
You can check more options on [http://nginx.org/en/docs/http/ngx_http_ssl_module.html](http://nginx.org/en/docs/http/ngx_http_ssl_module.html)

7) You can verify whether certificate submitted by user is valid or not , using
{% highlight ruby %}
request.env["HTTP-X-CLIENT-VERIFY"]
{% endhighlight %}
returns the result of client certificate verification: “SUCCESS”, “FAILED”, and “NONE” if a certificate was not present.