package errs

import (
	"fmt"

	"github.com/zaydek/retro/pkg/term"
)

func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory "+term.Bold(dir)+". "+
		"This is likely due to a permissions error. "+
		"Try "+term.Boldf("rm -r %s", dir)+" or "+term.Boldf("sudo rm -r %s", dir)+" if that doesn’t work.\n\n"+
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

func RunNode(err error) error {
	return fmt.Errorf("Failed to run Node.\n\n"+
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
		"Please open an issue at "+term.Underline("https://github.com/zaydek/retro")+".\n\n"+
		"Original error: %w", err)
}
