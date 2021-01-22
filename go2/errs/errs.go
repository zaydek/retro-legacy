package errs

import "fmt"

// MkdirAll decorates os.MkdirAll errors.
func MkdirAll(dir string, err error) error {
	return fmt.Errorf("Failed to make directory %[1]s. "+
		"This is likely due to a permissions error. "+
		"Try rm -r %[1]s or sudo rm -r %[1]s if that doesn’t work.\n\n"+
		"Original error message: %w", dir, err)
}

// Chdir decorates os.Chdir errors.
func Chdir(dir string, err error) error {
	return fmt.Errorf("Failed to open directory %[1]s. "+
		"This is likely due to a permissions error. "+
		"Try rm -r %[1]s or sudo rm -r %[1]s if that doesn’t work.\n\n"+
		"Original error message: %w", dir, err)
}

// Walk decorates filepath.Walk or fs.WalkDir errors.
func Walk(dir string, err error) error {
	return fmt.Errorf("Failed to walk directory %s.\n\n"+
		"Original error message: %w", dir, err)
}

// WriteFile decorates ioutil.WriteFile errors.
func WriteFile(path string, err error) error {
	return fmt.Errorf("Failed to write file %[1]s to disk.\n\n"+
		"Original error message: %w", path, err)
}

// PipeStdinToNode decorates cmd.StdinPipe errors.
func PipeStdinToNode(err error) error {
	return fmt.Errorf("Failed to pipe stdin to Node.\n\n"+
		"Original error message: %w", err)
}

// ExecNode decorates cmd.Run() errors.
func ExecNode(err error) error {
	return fmt.Errorf("Failed to execute Node.\n\n"+
		"Original error message: %w", err)
}

// Unexpected decorates unexpected errors.
func Unexpected(err error) error {
	return fmt.Errorf("This is not supposed to happen. "+
		"Please open an issue at https://github.com/zaydek/retro.\n\n"+
		"Original error message: %w", err)
}
