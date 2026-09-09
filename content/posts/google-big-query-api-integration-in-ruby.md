---
title: "Google Big query API integration in Ruby"
description: "Querying Google BigQuery from Ruby, including service-account auth and a reusable service object."
publishDate: "2016-06-16"
tags: ["ruby", "bigquery", "google-cloud"]
---
Recently, I worked on Google Big query integration. I found it bit difficult get it working quickly to make all setup for integrating Google API since documentation is also bit verbose. 

So, I would like to share that with you all. This post will take you through integrating Google Big query integration in Ruby application.

First you will need to enable API in google compute console, then generate secret key if you haven't.
Here is google big query API service that I have written. Currently, It only has API integrated for fetching data from google big query.

```ruby title="google_big_query_service.rb"
class GoogleBigQueryService

  attr_reader :client, :compute_api, :query

  BIG_QUERY_SCOPE =  'https://www.googleapis.com/auth/bigquery'
  AUDIENCE = 'https://accounts.google.com/o/oauth2/token'
  TOKEN_CREDENTIAL_URI = 'https://accounts.google.com/o/oauth2/token'

  ##you will get issuer when you generate secret key on google compute console
  ISSUER = ISSUER

  def initialize query
    @query = query
    @client = Google::APIClient.new
    @compute_api = @client.discovered_api('bigquery', 'v2')
    key = fetch_key_from_client_secrets
    client.authorization = Signet::OAuth2::Client.new(:token_credential_uri => TOKEN_CREDENTIAL_URI,
                            :audience => AUDIENCE,
                            :scope => BIG_QUERY_SCOPE,
                            :issuer => ISSUER,
                            :signing_key => key,
                            :grant_type => "client_credentials",
                            access_type: "offline" )
    fetch_access_token
  end

  def fetch_access_token
    begin
      response = client.authorization.fetch_access_token! 
      response[:access_token]
    rescue Exception => e
      client.authorization.access_token = random_token
    end
  end

  ## referring to 
  # http://stackoverflow.com/questions/8013648/why-does-googles-custom-search-api-say-that-im-missing-an-access-token-when-u 
  # using random token in case fetch_access_token fails.
  def random_token
    rand(10000000).to_s
  end

  def execute_query
    body_object = {query: @query}

    response = client.execute(api_method: compute_api.jobs.query,
                              parameters: {projectId: YOUR_PROJECT_ID},
                              body_object: body_object)
    response = JSON.parse(response.body)
    extract_data response
  end
  
  ## this method returns well formatted data, since google big query API doesn't respond data in proper format
  def extract_data response
    return {data: [], success: false} if(response['error'].present?)

    query_result = []
    if response['rows'].present?
      fields = response['schema']['fields'].map{|field| field['name']} 
      response['rows'].map{|row| row.values.flatten!}.each do |record|
        record = HashWithIndifferentAccess.new
        record.each_with_index do |field, index|          
          record[fields[index]] = field.values.first
        end
        query_result << record
      end
    end
    {data: query_result ,success: true}
  end

  private
  
  def fetch_key_from_client_secrets
    keypath = Rails.root.join('config','your-project-secret-key.p12').to_s
    key = Google::APIClient::KeyUtils.load_from_pkcs12(keypath, 'notasecret')
  end
end
```

Then call it with,

```ruby
big_query_service = GoogleBigQueryService.new(query)
big_query_service.execute_query
```

Here is more info about Big Query API,  [https://developers.google.com/apis-explorer/#p/bigquery/v2/](https://developers.google.com/apis-explorer/#p/bigquery/v2/)

One can also use command-line tool, [https://cloud.google.com/compute/docs/gcloud-compute/](https://cloud.google.com/compute/docs/gcloud-compute/)
Though CLI tool gives you data in required format unlike in APIs it returns data in bit confused format but it's also not intended to be an API, since formatting and output are subject to change.
