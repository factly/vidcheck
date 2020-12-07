package model

import (
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
func SetupDB(DSN interface{}) {
	var err error
	DB, err = gorm.Open(postgres.Open(viper.GetString("postgres.dsn")), &gorm.Config{
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

	// Migrating schema.
	_ = DB.AutoMigrate(
		&Video{},
		&Analysis{},
		&Rating{},
		&Space{},
	)

	_ = DB.Migrator().DropConstraint(&Analysis{}, "fk_analysis_rating")
}
