package main

import (
	"encoding/json"
	"fmt"
	"regexp"
)

func main() {
	res := regexp.MustCompile(`\..*$`).FindAllString("/nested/[pokemon].js", -1)
	bstr, _ := json.Marshal(res)
	fmt.Println(string(bstr))
}
