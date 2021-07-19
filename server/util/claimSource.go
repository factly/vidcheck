package util

import "encoding/json"

func ClaimSource(url, title string) ([]byte, error) {
	source := map[string]string{}
	source["url"] = url
	source["description"] = title

	sourceByte, err := json.Marshal(source)
	if err != nil {
		return nil, err
	}

	return sourceByte, nil
}
