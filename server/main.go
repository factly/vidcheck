package main

import (
	"github.com/factly/vidcheck/cmd"
	_ "github.com/factly/vidcheck/docs"
)

// @title VidCheck API
// @version 1.0
// @description VidCheck server API

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:7740
// @BasePath /
func main() {
	cmd.Execute()
}
