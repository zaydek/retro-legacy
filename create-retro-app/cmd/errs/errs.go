package errs

import (
	"fmt"

	"github.com/zaydek/create-retro-app/term"
)

const repoName = "create-retro-app"

func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory "+term.Bold(dir)+". "+
		"Original error: %w", err)
}

func Walk(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory "+term.Bold(dir)+".\n\n"+
		"Original error: %w", err)
}

func ReadFile(path string, err error) error {
	return fmt.Errorf("Failed to read file "+term.Bold(path)+".\n\n"+
		"Original error: %w", err)
}

func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file "+term.Bold(path)+".\n\n"+
		"Original error: %w", err)
}

func ParseTemplate(name string, err error) error {
	return fmt.Errorf("Failed to parse template "+term.Bold(name)+".\n\n"+
		"Original error: %w", err)
}

func ExecuteTemplate(name string, err error) error {
	return fmt.Errorf("Failed to execute template "+term.Bold(name)+".\n\n"+
		"Original error: %w", err)
}

func Unexpected(err error) error {
	return fmt.Errorf("An unexpected error occurred. "+
		"Please open an issue at "+term.Underlinef("https://github.com/zaydek/%s", repoName)+".\n\n"+
		"Original error: %w", err)
}
