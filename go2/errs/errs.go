package errs

import "fmt"

func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory %[1]s. "+
		"This is likely due to a permissions error. "+
		"Try rm -r %[1]s or sudo rm -r %[1]s if that doesn’t work.\n\n"+
		"Original error message: %w", dir, err)
}

func Chdir(dir string, err error) error {
	return fmt.Errorf("Failed to open directory %[1]s. "+
		"This is likely due to a permissions error. "+
		"Try rm -r %[1]s or sudo rm -r %[1]s if that doesn’t work.\n\n"+
		"Original error message: %w", dir, err)
}

func Walkdir(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory %s.\n\n"+
		"Original error message: %w", dir, err)
}

func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file %[1]s to disk.\n\n"+
		"Original error message: %w", path, err)
}

func Unexpected(err error) error {
	return fmt.Errorf("This is not supposed to happen. "+
		"Please open an issue at https://github.com/zaydek/retro.\n\n"+
		"Original error message: %w", err)
}
