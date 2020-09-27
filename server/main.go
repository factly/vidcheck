package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
)

func main() {
    config.SetupVars()
	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "7720"
	}
	port = ":" + port
	// db setup
	model.SetupDB(config.DSN)
	setupModel()
	fmt.Println("DB Migration Done...")

	// register routes
	r := action.RegisterRoutes()
	fmt.Println("swagger-ui http://localhost:7720/swagger/index.html")
	err := http.ListenAndServe(port, r)
	if err != nil {
		log.Fatal(err)
	}
}

func setupModel() {
	dsn := "user=root password=example dbname=vidcheck host=db port=5432 sslmode=disable TimeZone=Asia/Calcutta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// Migrating schema.
	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.Video{})
	db.AutoMigrate(&model.VideoAnalysis{})
	db.AutoMigrate(&model.Rating{})
}
