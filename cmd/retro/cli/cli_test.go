package cli

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func must(t *testing.T, err error) {
	if err == nil {
		return
	}
	t.Fatal(err)
}

func TestDevCmd(t *testing.T) {
	var cmd DevCmd
	var err error

	cmd, err = parseDevCmd()
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseDevCmd("--cached")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      true,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--cached=true")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      true,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--cached=false")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseDevCmd("--fast-refresh")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--fast-refresh=true")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--fast-refresh=false")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: false,
		Port:        8000,
		Sourcemap:   true,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseDevCmd("--port=8000")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--port=3000")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        3000,
		Sourcemap:   true,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseDevCmd("--sourcemap")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--sourcemap=true")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   true,
	})

	cmd, err = parseDevCmd("--sourcemap=false")
	must(t, err)
	expect.DeepEqual(t, cmd, DevCmd{
		Cached:      false,
		FastRefresh: true,
		Port:        8000,
		Sourcemap:   false,
	})
}

func TestExportCmd(t *testing.T) {
	var cmd ExportCmd
	var err error

	cmd, err = parseExportCmd()
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    false,
		Sourcemap: true,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseExportCmd("--cached")
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    true,
		Sourcemap: true,
	})

	cmd, err = parseExportCmd("--cached=true")
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    true,
		Sourcemap: true,
	})

	cmd, err = parseExportCmd("--cached=false")
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    false,
		Sourcemap: true,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseExportCmd("--sourcemap")
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    false,
		Sourcemap: true,
	})

	cmd, err = parseExportCmd("--sourcemap=true")
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    false,
		Sourcemap: true,
	})

	cmd, err = parseExportCmd("--sourcemap=false")
	must(t, err)
	expect.DeepEqual(t, cmd, ExportCmd{
		Cached:    false,
		Sourcemap: false,
	})
}

func TestServeCmd(t *testing.T) {
	var cmd ServeCmd
	var err error

	cmd, err = parseServeCmd()
	must(t, err)
	expect.DeepEqual(t, cmd, ServeCmd{
		Port: 8000,
	})

	//////////////////////////////////////////////////////////////////////////////

	cmd, err = parseServeCmd("--port=8000")
	must(t, err)
	expect.DeepEqual(t, cmd, ServeCmd{
		Port: 8000,
	})

	cmd, err = parseServeCmd("--port=3000")
	must(t, err)
	expect.DeepEqual(t, cmd, ServeCmd{
		Port: 3000,
	})
}
