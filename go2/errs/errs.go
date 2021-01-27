package errs

import (
	"fmt"

	"github.com/zaydek/retro/color"
)

// MkdirAll decorates os.MkdirAll errors.
func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory "+color.Boldf("`%s`", dir)+". "+
		"This is likely due to a permissions error. "+
		"Try "+color.Boldf("`rm -r %s`", dir)+" or "+color.Boldf("`sudo rm -r %s`", dir)+" if that doesn’t work.\n\n"+
		"Original error: %w", err)
}

// // Chdir decorates os.Chdir errors.
// func Chdir(dir string, err error) error {
// 	return fmt.Errorf("Failed to open directory "+color.Boldf("`%s`", dir)+". "+
// 		"This is likely due to a permissions error. "+
// 		"Try "+color.Boldf("`rm -r %s`", dir)+" or "+color.Boldf("`sudo rm -r %s`", dir)+" if that doesn’t work.\n\n"+
// 		"Original error: %w", err)
// }

// Walk decorates filepath.Walk and fs.WalkDir errors.
func Walk(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory "+color.Boldf("`%s`", dir)+".\n\n"+
		"Original error: %w", err)
}

// ReadFile decorates ioutil.ReadFile errors.
func ReadFile(path string, err error) error {
	return fmt.Errorf("Failed to read file "+color.Boldf("`%s`", path)+".\n\n"+
		"Original error: %w", err)
}

// WriteFile decorates ioutil.WriteFile errors.
func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file "+color.Boldf("`%s`")+".\n\n"+
		"Original error: %w", err)
}

// RunNode decorates (*exec.Cmd).Run errors.
func RunNode(err error) error {
	return fmt.Errorf("Failed to run Node as a subprocess.\n\n"+
		"Original error: %w", err)
}

// ParseTemplate decorates (*template.Template).Parse errors.
func ParseTemplate(path string, err error) error {
	return fmt.Errorf("Failed to parse template "+color.Boldf("`%s`", path)+".\n\n"+
		"Original error: %w", err)
}

// ExecuteTemplate decorates (*template.Template).Execute errors.
func ExecuteTemplate(path string, err error) error {
	return fmt.Errorf("Failed to execute template "+color.Boldf("`%s`")+".\n\n"+
		"Original error: %w", err)
}

// Unexpected decorates unexpected errors.
func Unexpected(err error) error {
	return fmt.Errorf("An unexpected error occurred. "+
		"Please open an issue at "+color.Underline("https://github.com/zaydek/retro")+".\n\n"+
		"Original error: %w", err)
}
