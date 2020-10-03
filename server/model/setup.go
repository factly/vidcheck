package model

import (
	"fmt"
	"log"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" // postgres
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setup
func SetupDB(DSN interface{}) {
	var err error
	DB, err = gorm.Open("postgres", DSN)

	if err != nil {
		log.Fatal(err)
	}

	// Query log
	DB.LogMode(true)
	fmt.Println("connected to database ...")
	DB.SingularTable(true)

	// Migrating schema.
	DB.AutoMigrate(&User{})
	DB.AutoMigrate(&Video{})
	DB.AutoMigrate(&VideoAnalysis{})
	DB.AutoMigrate(&Rating{})
}
