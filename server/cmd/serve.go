package cmd

import (
	"log"
	"net/http"
	"os"

	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/model"
	"github.com/factly/x/meilisearchx"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(serveCmd)
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Starts server for vidcheck-server.",
	Run: func(cmd *cobra.Command, args []string) {
		model.SetupDB()

		meilisearchx.SetupMeiliSearch("vidcheck", []string{"name", "fact", "claim", "slug", "description", "title", "subtitle", "excerpt", "site_title", "site_address", "tag_line", "review", "review_tag_line", "summary"})

		port, ok := os.LookupEnv("PORT")
		if !ok {
			port = "8000"
		}
		port = ":" + port

		// register routes
		r := action.RegisterRoutes()
		err := http.ListenAndServe(port, r)
		if err != nil {
			log.Fatal(err)
		}
	},
}
