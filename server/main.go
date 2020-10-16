package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/config"
	_ "github.com/factly/vidcheck/docs"
	"github.com/factly/vidcheck/model"
	"github.com/spf13/viper"
)

// @title VidCheck API
// @version 1.0
// @description VidCheck server API

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /
func main() {
	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "8080"
	}
	port = ":" + port

	config.SetupVars()

	// db setup
	model.SetupDB(viper.GetString("postgres.dsn"))
	fmt.Println("DB Migration Done...")

	// register routes
	r := action.RegisterRoutes()
	err := http.ListenAndServe(port, r)
	if err != nil {
		log.Fatal(err)
	}
}
