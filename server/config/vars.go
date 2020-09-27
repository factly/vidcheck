package config

import (
	"flag"
	"log"
)

// DSN dsn
var DSN string

// SetupVars setups all the config variables to run application
func SetupVars() {
	var dsn string

	flag.StringVar(&dsn, "dsn", "", "Database connection string")
	flag.Parse()

	if dsn == "" {
		log.Fatal("Please pass dsn flag")
	}
	DSN = dsn
}