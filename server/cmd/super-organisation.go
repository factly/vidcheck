package cmd

import (
	"log"

	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(superOrgCmd)
}

var superOrgCmd = &cobra.Command{
	Use:   "create-super-org",
	Short: "Creates super organisation for vidcheck-server.",
	Run: func(cmd *cobra.Command, args []string) {
		// db setup
		model.SetupDB()

		err := config.CreateSuperOrganisation()
		if err != nil {
			log.Println(err)
		}
	},
}
