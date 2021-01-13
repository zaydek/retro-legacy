import { routeInfo } from "./routeInfo"

test("integration", () => {
	expect(routeInfo("")).toEqual(null)
	expect(routeInfo("/")).toEqual(null)
	expect(routeInfo("/hello")).toEqual({
		page: "/hello",
		component: "PageHello",
	})
	expect(routeInfo("/hello/")).toEqual({
		page: "/hello/",
		component: "PageHelloSlash",
	})
	expect(routeInfo("/[hello]")).toEqual({
		page: "/[hello]",
		component: "PageDynamicHello",
	})
	expect(routeInfo("/[hello]/")).toEqual({
		page: "/[hello]/",
		component: "PageDynamicHelloSlash",
	})
	expect(routeInfo("/[hello]/world")).toEqual({
		page: "/[hello]/world",
		component: "PageDynamicHelloSlashWorld",
	})
	expect(routeInfo("/[hello]/world/")).toEqual({
		page: "/[hello]/world/",
		component: "PageDynamicHelloSlashWorldSlash",
	})
	expect(routeInfo("/[hello]/[world]")).toEqual({
		page: "/[hello]/[world]",
		component: "PageDynamicHelloSlashDynamicWorld",
	})
	expect(routeInfo("/[hello]/[world]/")).toEqual({
		page: "/[hello]/[world]/",
		component: "PageDynamicHelloSlashDynamicWorldSlash",
	})
})
