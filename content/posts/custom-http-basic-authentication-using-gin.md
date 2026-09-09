---
title: "Custom Http Basic authentication using Gin framework"
description: "Writing custom HTTP basic authentication middleware for Go's Gin framework."
publishDate: "2018-09-07"
tags: ["go", "gin", "authentication"]
---
Recently, I have been working with gin framework in golang. So in our case, we needed to add HTTP basic authentication. 

gin framework provides basic auth in following way where we need to provide accounts information(pairs of username and passwords) 

```go title="gin_basic_auth.go"
func main() {
  r := gin.Default()

  // Group using gin.BasicAuth() middleware
  // gin.Accounts is a shortcut for map[string]string
  authorized := r.Group("/admin", gin.BasicAuth(gin.Accounts{
    "foo":    "bar",
    "austin": "1234",
    "lena":   "hello2",
    "manu":   "4321",
  }))

  // hit "localhost:8080/admin/dashboard
  authorized.GET("/dashboard", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"success": true})
  })

  // Listen and serve on 0.0.0.0:8080
  r.Run(":8080")
}
```

But It does not work well when you want to authenticate username and password against database. 
So I wrote following middleware to handle it.

```go title="custom_gin_basic_auth.go"
import(
  "github.com/gin-gonic/gin"
)

func main() {
  r := gin.Default()

  // Group using gin.BasicAuth() middleware
  // gin.Accounts is a shortcut for map[string]string
  authorized := r.Group("/admin", basicAuth())

  // hit "localhost:8080/admin/dashboard
  authorized.GET("/dashboard", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"success": true})
  })

  // Listen and serve on 0.0.0.0:8080
  r.Run(":8080")
}


func basicAuth() gin.HandlerFunc {

  return func(c *gin.Context) {
    auth := strings.SplitN(c.Request.Header.Get("Authorization"), " ", 2)

    if len(auth) != 2 || auth[0] != "Basic" {
      respondWithError(401, "Unauthorized", c)
      return
    }
    payload, _ := base64.StdEncoding.DecodeString(auth[1])
    pair := strings.SplitN(string(payload), ":", 2)

    if len(pair) != 2 || !authenticateUser(pair[0], pair[1]) {
      respondWithError(401, "Unauthorized", c)
      return
    }

    c.Next()
  }
}

func authenticateUser(username, password string) bool {
  var user models.User
  // fetch user from database. Here db.Client() is connection to your database. You will need to import your db package above.
  // This is just for example purpose
  err := db.Client().Where(models.User{Login: username, Password: password}).FirstOrCreate(&user)
  if err.Error != nil {
    return false
  }
  return true
}

func respondWithError(code int, message string, c *gin.Context) {
	resp := map[string]string{"error": message}

	c.JSON(code, resp)
	c.Abort()
}
```

This way it avoids you to specify all username/password pairs in middleware for basicauth.
