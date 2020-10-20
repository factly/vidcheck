package model

import (
	"log"

	"gorm.io/gorm/logger"

	"github.com/spf13/viper"
	"gorm.io/gorm/schema"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setup
func SetupDB(DSN interface{}) {
	var err error
	DB, err = gorm.Open(postgres.Open(viper.GetString("postgres.dsn")), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("connected to database ...")

	// Migrating schema.
	if err = DB.AutoMigrate(&Video{}); err != nil {
		log.Fatal(err)
	}
	if err = DB.AutoMigrate(&Analysis{}); err != nil {
		log.Fatal(err)
	}
	if err = DB.AutoMigrate(&Rating{}); err != nil {
		log.Fatal(err)
	}
	if err = DB.AutoMigrate(&Space{}); err != nil {
		log.Fatal(err)
	}
}
