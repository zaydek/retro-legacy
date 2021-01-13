import parse from "./parseRouteInfo"

test("integration", () => {
	expect(parse("")).toEqual(null)
	expect(parse("/")).toEqual(null)
	expect(parse("/hello")).toEqual({
		page: "/hello",
		component: "PageHello",
	})
	expect(parse("/hello/")).toEqual({
		page: "/hello/",
		component: "PageHelloSlash",
	})
	expect(parse("/[hello]")).toEqual({
		page: "/[hello]",
		component: "PageDynamicHello",
	})
	expect(parse("/[hello]/")).toEqual({
		page: "/[hello]/",
		component: "PageDynamicHelloSlash",
	})
	expect(parse("/[hello]/world")).toEqual({
		page: "/[hello]/world",
		component: "PageDynamicHelloSlashWorld",
	})
	expect(parse("/[hello]/world/")).toEqual({
		page: "/[hello]/world/",
		component: "PageDynamicHelloSlashWorldSlash",
	})
	expect(parse("/[hello]/[world]")).toEqual({
		page: "/[hello]/[world]",
		component: "PageDynamicHelloSlashDynamicWorld",
	})
	expect(parse("/[hello]/[world]/")).toEqual({
		page: "/[hello]/[world]/",
		component: "PageDynamicHelloSlashDynamicWorldSlash",
	})
})
