package model

import (
	"fmt"
	"log"
	"time"

	"gorm.io/gorm/logger"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
	"gorm.io/gorm/schema"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setup
func SetupDB() {
	var err error

	dbString := fmt.Sprint("host=", viper.GetString("database_host"), " ",
		"user=", viper.GetString("database_user"), " ",
		"password=", viper.GetString("database_password"), " ",
		"dbname=", viper.GetString("database_name"), " ",
		"port=", viper.GetInt("database_port"), " ",
		"sslmode=", viper.GetString("database_ssl_mode"))

	DB, err = gorm.Open(postgres.Open(dbString), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
		Logger: loggerx.NewGormLogger(logger.Config{
			SlowThreshold: 200 * time.Millisecond,
			LogLevel:      logger.Info,
			Colorful:      true,
		}),
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("connected to database ...")
}

// Migrate applies migrations
func Migrate() {
	// Migrating schema.
	_ = DB.AutoMigrate(
		&Video{},
		&Claim{},
		&Rating{},
		&Space{},
		&Claimant{},
		&SpacePermission{},
		&OrganisationPermission{},
		&OrganisationPermissionRequest{},
		&SpacePermissionRequest{},
	)

}
