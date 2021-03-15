package main

import "github.com/zaydek/retro/pkg/terminal"

var (
	normal = terminal.Normal.Sprint

	bold      = terminal.Bold.Sprint
	dim       = terminal.Dim.Sprint
	underline = terminal.Underline.Sprint
	black     = terminal.Black.Sprint
	red       = terminal.Red.Sprint
	green     = terminal.Green.Sprint
	yellow    = terminal.Yellow.Sprint
	blue      = terminal.Blue.Sprint
	magenta   = terminal.Magenta.Sprint
	cyan      = terminal.Cyan.Sprint
	white     = terminal.White.Sprint
	bgBlack   = terminal.BgBlack.Sprint
	bgRed     = terminal.BgRed.Sprint
	bgGreen   = terminal.BgGreen.Sprint
	bgYellow  = terminal.BgYellow.Sprint
	bgBlue    = terminal.BgBlue.Sprint
	bgMagenta = terminal.BgMagenta.Sprint
	bgCyan    = terminal.BgCyan.Sprint
	bgWhite   = terminal.BgWhite.Sprint

	dimUnderline = terminal.New(terminal.DimCode, terminal.UnderlineCode).Sprint
	dimBlack     = terminal.New(terminal.DimCode, terminal.BlackCode).Sprint
	dimRed       = terminal.New(terminal.DimCode, terminal.RedCode).Sprint
	dimGreen     = terminal.New(terminal.DimCode, terminal.GreenCode).Sprint
	dimYellow    = terminal.New(terminal.DimCode, terminal.YellowCode).Sprint
	dimBlue      = terminal.New(terminal.DimCode, terminal.BlueCode).Sprint
	dimMagenta   = terminal.New(terminal.DimCode, terminal.MagentaCode).Sprint
	dimCyan      = terminal.New(terminal.DimCode, terminal.CyanCode).Sprint
	dimWhite     = terminal.New(terminal.DimCode, terminal.WhiteCode).Sprint
	dimBgBlack   = terminal.New(terminal.DimCode, terminal.BgBlackCode).Sprint
	dimBgRed     = terminal.New(terminal.DimCode, terminal.BgRedCode).Sprint
	dimBgGreen   = terminal.New(terminal.DimCode, terminal.BgGreenCode).Sprint
	dimBgYellow  = terminal.New(terminal.DimCode, terminal.BgYellowCode).Sprint
	dimBgBlue    = terminal.New(terminal.DimCode, terminal.BgBlueCode).Sprint
	dimBgMagenta = terminal.New(terminal.DimCode, terminal.BgMagentaCode).Sprint
	dimBgCyan    = terminal.New(terminal.DimCode, terminal.BgCyanCode).Sprint
	dimBgWhite   = terminal.New(terminal.DimCode, terminal.BgWhiteCode).Sprint

	boldUnderline = terminal.New(terminal.BoldCode, terminal.UnderlineCode).Sprint
	boldBlack     = terminal.New(terminal.BoldCode, terminal.BlackCode).Sprint
	boldRed       = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
	boldGreen     = terminal.New(terminal.BoldCode, terminal.GreenCode).Sprint
	boldYellow    = terminal.New(terminal.BoldCode, terminal.YellowCode).Sprint
	boldBlue      = terminal.New(terminal.BoldCode, terminal.BlueCode).Sprint
	boldMagenta   = terminal.New(terminal.BoldCode, terminal.MagentaCode).Sprint
	boldCyan      = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	boldWhite     = terminal.New(terminal.BoldCode, terminal.WhiteCode).Sprint
	boldBgBlack   = terminal.New(terminal.BoldCode, terminal.BgBlackCode).Sprint
	boldBgRed     = terminal.New(terminal.BoldCode, terminal.BgRedCode).Sprint
	boldBgGreen   = terminal.New(terminal.BoldCode, terminal.BgGreenCode).Sprint
	boldBgYellow  = terminal.New(terminal.BoldCode, terminal.BgYellowCode).Sprint
	boldBgBlue    = terminal.New(terminal.BoldCode, terminal.BgBlueCode).Sprint
	boldBgMagenta = terminal.New(terminal.BoldCode, terminal.BgMagentaCode).Sprint
	boldBgCyan    = terminal.New(terminal.BoldCode, terminal.BgCyanCode).Sprint
	boldBgWhite   = terminal.New(terminal.BoldCode, terminal.BgWhiteCode).Sprint
)
