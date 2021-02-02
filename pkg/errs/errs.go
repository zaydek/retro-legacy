package errs

import (
	"fmt"

	"github.com/zaydek/retro/pkg/term"
)

func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory "+term.Bold(dir)+". "+
		"Error: %w", err)
}

func Chdir(dir string, err error) error {
	return fmt.Errorf("Failed to open directory "+term.Bold(dir)+". "+
		"Error: %w", err)
}

func Walk(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory "+term.Bold(dir)+".\n\n"+
		"Error: %w", err)
}

// TODO: Pass *os.File or fs.File here?
func ReadFile(path string, err error) error {
	return fmt.Errorf("Failed to read file "+term.Bold(path)+".\n\n"+
		"Error: %w", err)
}

// TODO: Pass *os.File or fs.File here?
func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file "+term.Bold(path)+".\n\n"+
		"Error: %w", err)
}

// TODO: Pass commandStr as an argument here?
func RunNode(err error) error {
	return fmt.Errorf("Failed to run Node.\n\n"+
		"Error: %w", err)
}

// TODO: Pass *template.Template as an argument, then use tmpl.Name() as a
// shorthand.
func ParseTemplate(name string, err error) error {
	return fmt.Errorf("Failed to parse template "+term.Bold(name)+".\n\n"+
		"Error: %w", err)
}

// TODO: Pass *template.Template as an argument, then use tmpl.Name() as a
// shorthand.
func ExecuteTemplate(name string, err error) error {
	return fmt.Errorf("Failed to execute template "+term.Bold(name)+".\n\n"+
		"Error: %w", err)
}

func Unexpected(err error) error {
	return fmt.Errorf("An unexpected error occurred. "+
		"Please open an issue at "+term.Underline("https://github.com/zaydek/retro")+".\n\n"+
		"Error: %w", err)
}
