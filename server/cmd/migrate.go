package cmd

import (
	"fmt"

	"github.com/factly/vidcheck/model"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(migrateCmd)
}

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Applies DB migrations for vidcheck-server.",
	Run: func(cmd *cobra.Command, args []string) {
		// db setup
		model.SetupDB()
		model.Migrate()
		fmt.Println("DB Migration Done...")
	},
}
