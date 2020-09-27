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

	// adding default prefix to table name
	gorm.DefaultTableNameHandler = func(db *gorm.DB, defaultTableName string) string {
		return "dp_" + defaultTableName
	}
}
