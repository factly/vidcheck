package config

import (
	"log"

	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {
	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetEnvPrefix("vidcheck")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Println("config file not found...")
	}

	if !viper.IsSet("database_host") {
		log.Fatal("please provide database_host config param")
	}

	if !viper.IsSet("database_user") {
		log.Fatal("please provide database_user config param")
	}

	if !viper.IsSet("database_name") {
		log.Fatal("please provide database_name config param")
	}

	if !viper.IsSet("database_password") {
		log.Fatal("please provide database_password config param")
	}

	if !viper.IsSet("database_port") {
		log.Fatal("please provide database_port config param")
	}

	if !viper.IsSet("database_ssl_mode") {
		log.Fatal("please provide database_ssl_mode config param")
	}

	if !viper.IsSet("kavach_url") {
		log.Fatal("please provide kavach_url in config file")
	}

	if !viper.IsSet("meili_url") {
		log.Fatal("please provide meili_url config param")
	}

	if !viper.IsSet("meili_key") {
		log.Fatal("please provide meili_key config param")
	}

	if DegaIntegrated() {
		if !viper.IsSet("dega_url") {
			log.Fatal("please provide dega_url in config file")
		}
	}
}

// DegaIntegrated checks if dega integration is on
func DegaIntegrated() bool {
	return viper.IsSet("dega_integration") && viper.GetBool("dega_integration")
}
