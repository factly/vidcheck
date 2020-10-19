package model

import (
	"log"

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
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("connected to database ...")

	// Migrating schema.
	// DB.AutoMigrate(&User{})
	DB.AutoMigrate(&Video{})
	DB.AutoMigrate(&Analysis{})
	DB.AutoMigrate(&Rating{})
	DB.AutoMigrate(&Space{})
}
