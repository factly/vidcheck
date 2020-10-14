package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/spf13/viper"
)

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
	fmt.Println("swagger-ui http://localhost:7720/swagger/index.html")
	err := http.ListenAndServe(port, r)
	if err != nil {
		log.Fatal(err)
	}
}
