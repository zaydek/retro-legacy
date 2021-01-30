package errs

import (
	"fmt"

	"github.com/zaydek/create-retro-app/term"
)

const repoName = "create-retro-app"

// MkdirAll decorates os.MkdirAll errors.
func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory "+term.Bold(dir)+". "+
		"This is likely due to a permissions error. "+
		"Try "+term.Boldf("rm -r %s", dir)+" or "+term.Boldf("sudo rm -r %s", dir)+" if that doesn’t work.\n\n"+
		"Original error: %w", err)
}

// Walk decorates filepath.Walk and fs.WalkDir errors.
func Walk(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory "+term.Bold(dir)+".\n\n"+
		"Original error: %w", err)
}

// ReadFile decorates ioutil.ReadFile errors.
func ReadFile(path string, err error) error {
	return fmt.Errorf("Failed to read file "+term.Bold(path)+".\n\n"+
		"Original error: %w", err)
}

// WriteFile decorates ioutil.WriteFile errors.
func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file "+term.Bold(path)+".\n\n"+
		"Original error: %w", err)
}

// // ExecNode decorates (*exec.Cmd).Run errors.
// func ExecNode(err error) error {
// 	return fmt.Errorf("Failed to execute Node.\n\n"+
// 		"Original error: %w", err)
// }

// ParseTemplate decorates (*template.Template).Parse errors.
func ParseTemplate(name string, err error) error {
	return fmt.Errorf("Failed to parse template "+term.Bold(name)+".\n\n"+
		"Original error: %w", err)
}

// ExecuteTemplate decorates (*template.Template).Execute errors.
func ExecuteTemplate(name string, err error) error {
	return fmt.Errorf("Failed to execute template "+term.Bold(name)+".\n\n"+
		"Original error: %w", err)
}

// Unexpected decorates unexpected errors.
func Unexpected(err error) error {
	return fmt.Errorf("An unexpected error occurred. "+
		"Please open an issue at "+term.Underlinef("https://github.com/zaydek/%s", repoName)+".\n\n"+
		"Original error: %w", err)
}
