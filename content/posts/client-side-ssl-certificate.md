---
title: "Client side SSL Certificate Authentication with Rails and Nginx"
description: "Setting up client-side SSL certificate authentication with Rails behind Nginx."
publishDate: "2014-06-04"
tags: ["ruby", "rails", "nginx", "ssl", "security"]
---
Recently, I worked on an application that required SSL client certificate based authentication, so I wanted to share with you all how it can be integrated into a Rails application.

This article is about using SSL certificates installed in a web browser to authenticate against a Ruby on Rails application behind Nginx.

:::note
The certificate commands below use SHA-256 and 2048-bit RSA keys. The first version of this post used SHA-1 and 1024-bit keys, which are no longer considered safe. The Nginx headers are also corrected, so the app receives the certificate's subject and the verification result.
:::

Steps for creating the certificates:

**1. Configure `openssl.cnf`.** Check the following gist for my `openssl.cnf`; it's a big file, so I can't embed it here: [https://gist.github.com/pandurang90/dbe6a67339747ef5bacf](https://gist.github.com/pandurang90/dbe6a67339747ef5bacf)

In this configuration, the important thing is setting the path to the CA directory:

```bash
[ CA_default ]
dir = /path/to/ca
```

This is the path where you are going to create your CA.

**2. Create your own CA (Certificate Authority)** that issues the digital certificates.

For that we will use `CA.pl`, a Perl script that supplies the relevant command-line arguments to the `openssl` command for common certificate operations. It simplifies creating and managing certificates with a few simple options.

```bash
cd /path/to/ca
CA.pl -newca
```

Make sure you enter your domain name in the Common Name field when it asks.

**3. Generate the web server's CSR:**

```bash
openssl req -new -sha256 -newkey rsa:2048 -nodes -keyout www.example.org.key -out www.example.org.csr
```

Then sign the web server certificate with your CA:

```bash
openssl ca -config /etc/openssl.cnf -policy policy_anything -out www.example.org.crt -infiles www.example.org.csr
```

That gives you the web server's certificate.

**4. Configure Nginx.** Here is my configuration: [https://gist.github.com/pandurang90/8f0c11819db4c866d985](https://gist.github.com/pandurang90/8f0c11819db4c866d985)

The important part is passing the client certificate details on to Rails:

```nginx
ssl_client_certificate /path/to/ca/cacert.pem;
ssl_verify_client      optional;

location / {
  proxy_set_header X-SSL-Client-S-DN   $ssl_client_s_dn;
  proxy_set_header X-SSL-Client-Verify $ssl_client_verify;
  proxy_pass http://your_rails_app;
}
```

Nginx always sets these two headers itself, so a client can't fake them by sending its own.

**5. Generate a client certificate:**

```ruby
CERT_DIR = "path/to/ca"
user_name = "test user"
id = 1

def create_p12
  subj = "/C=US/ST=YourState/L=city/O=example/OU=example/CN=#{user_name}/emailAddress=#{email}"
  dir_name  = "#{CERT_DIR}#{id}"
  Dir.mkdir(dir_name) unless File.directory?(dir_name)
  create_cert(subj)
  sign_cert
  generate_p12
end

# Note: these build shell commands from strings, so only pass trusted values
# (or switch to the array form of `system`).
def create_cert(subj)
  system("openssl req -new -sha256 -newkey rsa:2048 -nodes -keyout #{CERT_DIR}#{id}/#{user_name}.key -out #{CERT_DIR}#{id}/#{user_name}.csr -subj '#{subj}'")
end

def sign_cert
  system("openssl ca -batch -config /usr/lib/ssl/openssl.cnf -policy policy_anything -extensions ssl_client -out #{CERT_DIR}#{id}/#{user_name}.crt -infiles #{CERT_DIR}#{id}/#{user_name}.csr")
end

def generate_p12
  system("openssl pkcs12 -export -clcerts -in #{CERT_DIR}#{id}/#{user_name}.crt -certfile #{CERT_DIR}demoCA/cacert.pem -inkey #{CERT_DIR}#{id}/#{user_name}.key -out #{CERT_DIR}#{id}/#{user_name}.p12 -name '#{name}' -passout pass:#{export_password}")
end
```

Here,

```ruby
subj = "/C=US/ST=YourState/L=city/O=example/OU=example/CN=#{user_name}/emailAddress=#{email}"
```

is the certificate's subject, which can be unique for each user, or the same, depending on the settings in your `openssl.cnf`.

**6. Install the certificate (the `.p12` file) in your web browser,** then open the website. It will ask you to choose a client certificate; select the right one from the list and submit. Then, in your controller, you can read the certificate's subject:

```ruby
cert_subject = request.env["HTTP_X_SSL_CLIENT_S_DN"]
```

You can check more options in the [Nginx SSL module docs](http://nginx.org/en/docs/http/ngx_http_ssl_module.html).

**7. Check whether the certificate the user submitted is valid:**

```ruby
request.env["HTTP_X_SSL_CLIENT_VERIFY"]
```

It returns the result of the client certificate verification: `SUCCESS`, `FAILED:reason`, or `NONE` if no certificate was presented. Only trust the subject when this is `SUCCESS`.
