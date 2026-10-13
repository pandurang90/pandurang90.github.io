---
title: "Custom Http Basic authentication using Gin framework"
description: "Writing custom HTTP basic authentication middleware for Go's Gin framework."
publishDate: "2018-09-07"
tags: ["go", "gin", "authentication"]
---
Recently, I have been working with the Gin framework in Go, and in our case we needed to add HTTP basic authentication.

Gin provides basic auth out of the box, where you pass in the account information (pairs of usernames and passwords):

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

  // hit "localhost:8080/admin/dashboard"
  authorized.GET("/dashboard", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"success": true})
  })

  // Listen and serve on 0.0.0.0:8080
  r.Run(":8080")
}
```

But it doesn't work well when you want to check the username and password against a database. So I wrote the following middleware to handle it.

:::note
The first version of `authenticateUser` used `FirstOrCreate` and compared plain-text passwords, which meant a failed login could create a new user. It now looks the user up, and compares the password against a bcrypt hash.
:::

```go title="custom_gin_basic_auth.go"
import (
  "net/http"

  "github.com/gin-gonic/gin"
  "golang.org/x/crypto/bcrypt"
)

func main() {
  r := gin.Default()

  // Group using our own basicAuth() middleware
  authorized := r.Group("/admin", basicAuth())

  // hit "localhost:8080/admin/dashboard"
  authorized.GET("/dashboard", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"success": true})
  })

  // Listen and serve on 0.0.0.0:8080
  r.Run(":8080")
}

func basicAuth() gin.HandlerFunc {
  return func(c *gin.Context) {
    username, password, ok := c.Request.BasicAuth()
    if !ok || !authenticateUser(username, password) {
      // Ask the browser to show its login prompt
      c.Header("WWW-Authenticate", `Basic realm="Restricted"`)
      respondWithError(http.StatusUnauthorized, "Unauthorized", c)
      return
    }

    c.Next()
  }
}

func authenticateUser(username, password string) bool {
  var user models.User
  // Fetch the user from the database. db.Client() stands for your own
  // database connection; import your db package above.
  if err := db.Client().Where("login = ?", username).First(&user).Error; err != nil {
    return false
  }
  // Store password hashes, never plain passwords, and compare with bcrypt.
  return bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) == nil
}

func respondWithError(code int, message string, c *gin.Context) {
  c.AbortWithStatusJSON(code, gin.H{"error": message})
}
```

This way you don't have to list every username and password pair in the middleware.
