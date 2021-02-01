package render

// TODO
type prerenderedPage struct {
	SrcPath string `json:"srcPath"`
	DstPath string `json:"dstPath"`
	Path    string `json:"path"`

	Head string `json:"head"`
	Page string `json:"page"`
}
