package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/model"
)

func main() {
	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "8080"
	}
	port = ":" + port
	// db setup
	dsn := "user=root password=example dbname=vidcheck host=db port=5432 sslmode=disable TimeZone=Asia/Calcutta"
	model.SetupDB(dsn)
	fmt.Println("DB Migration Done...")

	// register routes
	r := action.RegisterRoutes()
	fmt.Println("swagger-ui http://localhost:7720/swagger/index.html")
	err := http.ListenAndServe(port, r)
	if err != nil {
		log.Fatal(err)
	}
}
