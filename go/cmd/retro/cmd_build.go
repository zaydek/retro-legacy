package retro

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/run"
)

type pages map[string]struct {
	*PageBasedRoute
	Page string `json:"page"`
}

type srvResponse struct {
	Errors   []api.Message          `json:"errors"`
	Warnings []api.Message          `json:"warnings"`
	Data     map[string]interface{} `json:"data"`
}

type srvPagesResponse struct {
	Errors   []api.Message `json:"errors"`
	Warnings []api.Message `json:"warnings"`
	Data     pages         `json:"data"`
}

func prerenderPages(runtime Runtime) (srvPagesResponse, error) {
	bstr, err := ioutil.ReadFile("prerenderers/pages.js")
	if err != nil {
		return srvPagesResponse{}, err
	}

	rstr, err := json.MarshalIndent(runtime, "", "\t")
	if err != nil {
		return srvPagesResponse{}, err
	}

	var buf bytes.Buffer
	buf.Write(bstr)
	buf.Write([]byte("\n"))
	buf.Write([]byte("run("))
	buf.Write(rstr)
	buf.Write([]byte(")"))
	buf.Write([]byte("\n")) // EOF

	stdout, err := run.Cmd(buf.Bytes(), "node")
	if err != nil {
		return srvPagesResponse{}, err
	}

	var response srvPagesResponse
	if err := json.Unmarshal(stdout, &response); err != nil {
		return srvPagesResponse{}, err
	}

	// TODO
	if len(response.Errors) > 0 {
		return srvPagesResponse{}, errors.New(response.Errors[0].Text)
	} else if len(response.Warnings) > 0 {
		return srvPagesResponse{}, errors.New(response.Warnings[0].Text)
	}
	return response, nil
}

func prerenderApp(runtime Runtime) error {
	bstr, err := ioutil.ReadFile("prerenderers/app.js")
	if err != nil {
		return err
	}

	rstr, err := json.MarshalIndent(runtime, "", "\t")
	if err != nil {
		return err
	}

	var buf bytes.Buffer
	os.Stdout.Write(bstr)
	os.Stdout.Write([]byte("\n"))
	os.Stdout.Write([]byte("run("))
	os.Stdout.Write(rstr)
	os.Stdout.Write([]byte(")"))
	os.Stdout.Write([]byte("\n")) // EOF

	buf.Write(bstr)
	buf.Write([]byte("\n"))
	buf.Write([]byte("run("))
	buf.Write(rstr)
	buf.Write([]byte(")"))
	buf.Write([]byte("\n")) // EOF

	t := time.Now()

	stdout, err := run.Cmd(buf.Bytes(), "node")
	if err != nil {
		return err
	}

	fmt.Printf("%0.3fs - node step\n", time.Since(t).Seconds())

	var response srvResponse
	if err := json.Unmarshal(stdout, &response); err != nil {
		return err
	}

	// TODO
	if len(response.Errors) > 0 {
		return errors.New(response.Errors[0].Text)
	} else if len(response.Warnings) > 0 {
		return errors.New(response.Warnings[0].Text)
	}
	return nil
}

func (r Runtime) Build() {
	t := time.Now()

	if err := copyAssetDirToBuildDir(r.DirConfiguration); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}

	fmt.Printf("%0.3fs - copy step\n", time.Since(t).Seconds())
	t = time.Now()

	pages, err := prerenderPages(r)
	if err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}

	fmt.Printf("%0.3fs - prerender pages step\n", time.Since(t).Seconds())
	t = time.Now()

	for _, each := range pages.Data {
		if dir := p.Dir(each.DstPath); dir != "." {
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
					err.Error())
			}
		}
		if err := ioutil.WriteFile(each.DstPath, []byte(each.Page), perm.File); err != nil {
			loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
				err.Error())
		}
	}

	fmt.Printf("%0.3fs - mkdir / write step\n", time.Since(t).Seconds())
	t = time.Now()

	// if err := prerenderApp(r); err != nil {
	// 	loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
	// 		err.Error())
	// }

	fmt.Printf("%0.3fs - prerender app step\n", time.Since(t).Seconds())
	t = time.Now()
}
