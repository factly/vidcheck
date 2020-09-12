package main

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/factly/vidcheck/model"
)

func main() {
	setupModel()
	fmt.Println("DB Migration Done...")
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
