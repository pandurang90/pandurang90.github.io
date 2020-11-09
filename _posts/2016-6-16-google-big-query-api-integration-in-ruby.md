---
layout: post
title: Google Big query API integration in Ruby
---

Recently, I worked on Google Big query integration. I found it bit difficult get it working quickly to make all setup for integrating Google API since documentation is also bit verbose. 

So, I would like to share that with you all. This post will take you through integrating Google Big query integration in Ruby application.

First you will need to enable API in google compute console, then generate secret key if you haven't.
Here is google big query API service that I have written. Currently, It only has API integrated for fetching data from google big query.

<script src="https://gist.github.com/pandurang90/cec29ae85acea02609a028a6ed8e66c4.js"></script>

Then call it with,

{% highlight ruby %}
big_query_service = GoogleBigQueryService.new(query)
big_query_service.execute_query
{% endhighlight %}

Here is more info about Big Query API,  [https://developers.google.com/apis-explorer/#p/bigquery/v2/](https://developers.google.com/apis-explorer/#p/bigquery/v2/)

One can also use command-line tool, [https://cloud.google.com/compute/docs/gcloud-compute/](https://cloud.google.com/compute/docs/gcloud-compute/)
Though CLI tool gives you data in required format unlike in APIs it returns data in bit confused format but it's also not intended to be an API, since formatting and output are subject to change.
