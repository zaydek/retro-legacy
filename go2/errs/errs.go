package errs

import (
	"fmt"

	"github.com/zaydek/retro/color"
)

// MkdirAll descriptively decorates os.MkdirAll errors.
func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory '%[1]s'. "+
		"This is likely due to a permissions error. "+
		"Try 'rm -r %[1]s' or 'sudo rm -r %[1]s' if that doesn’t work.\n\n"+
		"Original error message: %w", dir, err)
}

// Chdir descriptively decorates os.Chdir errors.
func Chdir(dir string, err error) error {
	return fmt.Errorf("Failed to open directory '%[1]s'. "+
		"This is likely due to a permissions error. "+
		"Try 'rm -r %[1]s' or 'sudo rm -r %[1]s' if that doesn’t work.\n\n"+
		"Original error message: %w", dir, err)
}

// Walk descriptively decorates filepath.Walk and fs.WalkDir errors.
func Walk(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory '%s'.\n\n"+
		"Original error message: %w", dir, err)
}

// ReadFile descriptively decorates ioutil.ReadFile errors.
func ReadFile(path string, err error) error {
	return fmt.Errorf("Failed to read file '%s'.\n\n"+
		"Original error message: %w", path, err)
}

// WriteFile descriptively decorates ioutil.WriteFile errors.
func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file '%s'.\n\n"+
		"Original error message: %w", path, err)
}

// PipeStdinToNode descriptively decorates (*exec.Cmd).StdinPipe errors.
func PipeStdinToNode(err error) error {
	return fmt.Errorf("Failed to pipe stdin to Node.js.\n\n"+
		"Original error message: %w", err)
}

// PipeNode descriptively decorates (*exec.Cmd).Run errors.
func PipeNode(err error) error {
	return fmt.Errorf("Failed to pipe Node.js.\n\n"+
		"Original error message: %w", err)
}

// ParseTemplate descriptively decorates (*template.Template).Parse errors.
func ParseTemplate(path string, err error) error {
	return fmt.Errorf("Failed to parse template '%s'.\n\n"+
		"Original error message: %w", path, err)
}

// ExecuteTemplate descriptively decorates (*template.Template).Execute errors.
func ExecuteTemplate(path string, err error) error {
	return fmt.Errorf("Failed to execute template '%s'.\n\n"+
		"Original error message: %w", path, err)
}

// Unexpected descriptively decorates unexpected errors.
func Unexpected(err error) error {
	return fmt.Errorf("An unexpected error occurred. "+
		"This is not supposed to happen. "+
		"Please open an issue at %s.\n\n"+
		"Original error message: %w", color.Underline("https://github.com/zaydek/retro"), err)
}
