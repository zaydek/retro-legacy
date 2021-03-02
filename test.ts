function thing<a extends number | string>(v: a): a {
	return v
}

thing<true>(true)
