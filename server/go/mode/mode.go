package mode

// http://permissions-calculator.org
const (
	user_x = 0100 << iota
	user_w
	user_r
)
const (
	group_x = 010 << iota
	group_w
	group_r
)

const (
	other_x = 01 << iota
	other_w
	other_r
)

const (
	File      = user_r | user_w | group_r | other_r
	Directory = user_r | user_w | user_x | group_r | group_x | other_r | other_x
)
