---
title: "Google Big query API integration in Ruby"
description: "Querying Google BigQuery from Ruby, including service-account auth and a reusable service object."
publishDate: "2016-06-16"
tags: ["ruby", "bigquery", "google-cloud"]
---
Recently, I worked on a Google BigQuery integration. I found it a bit difficult to get the setup for the Google API working quickly, since the documentation is also a bit verbose.

So I would like to share it with you all. This post will take you through integrating Google BigQuery into a Ruby application.

:::note
This post uses the old `google-api-client` gem, which Google has since retired. For new code, use the official [`google-cloud-bigquery`](https://github.com/googleapis/google-cloud-ruby/tree/main/google-cloud-bigquery) gem, which handles authentication and returns rows already formatted. I also fixed a bug in `extract_data` below, where a variable name was reused and every row came back empty.
:::

First, you will need to enable the API in the Google Cloud console, then generate a secret key if you haven't already. Here is the BigQuery service that I have written. Currently, it only supports fetching data from BigQuery.

```ruby title="google_big_query_service.rb"
class GoogleBigQueryService

  attr_reader :client, :compute_api, :query

  BIG_QUERY_SCOPE = 'https://www.googleapis.com/auth/bigquery'
  AUDIENCE = 'https://accounts.google.com/o/oauth2/token'
  TOKEN_CREDENTIAL_URI = 'https://accounts.google.com/o/oauth2/token'

  ## you will get the issuer when you generate a secret key in the Google console
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
  # using a random token in case fetch_access_token fails.
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

  ## this method returns well-formatted data, since the BigQuery API doesn't return data in a convenient format
  def extract_data response
    return {data: [], success: false} if(response['error'].present?)

    query_result = []
    if response['rows'].present?
      fields = response['schema']['fields'].map{|field| field['name']}
      response['rows'].map{|row| row.values.flatten}.each do |values|
        record = HashWithIndifferentAccess.new
        values.each_with_index do |value, index|
          record[fields[index]] = value.values.first
        end
        query_result << record
      end
    end
    {data: query_result, success: true}
  end

  private

  def fetch_key_from_client_secrets
    keypath = Rails.root.join('config','your-project-secret-key.p12').to_s
    Google::APIClient::KeyUtils.load_from_pkcs12(keypath, 'notasecret')
  end
end
```

Then call it with:

```ruby
big_query_service = GoogleBigQueryService.new(query)
big_query_service.execute_query
```

Here is more info about the BigQuery API: [https://cloud.google.com/bigquery/docs/reference/rest](https://cloud.google.com/bigquery/docs/reference/rest)

You can also use the `bq` command-line tool. It gives you data in a more readable format than the API, which returns it in a slightly confusing structure. But the CLI is not intended to be used as an API, since its formatting and output are subject to change.
