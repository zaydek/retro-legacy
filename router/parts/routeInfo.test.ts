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
		component: "PageHelloNests",
	})
	expect(routeInfo("/[hello]")).toEqual({
		page: "/[hello]",
		component: "PageDynamicHello",
	})
	expect(routeInfo("/[hello]/")).toEqual({
		page: "/[hello]/",
		component: "PageDynamicHelloNests",
	})
	expect(routeInfo("/[hello]/world")).toEqual({
		page: "/[hello]/world",
		component: "PageDynamicHelloNestsWorld",
	})
	expect(routeInfo("/[hello]/world/")).toEqual({
		page: "/[hello]/world/",
		component: "PageDynamicHelloNestsWorldNests",
	})
	expect(routeInfo("/[hello]/[world]")).toEqual({
		page: "/[hello]/[world]",
		component: "PageDynamicHelloNestsDynamicWorld",
	})
	expect(routeInfo("/[hello]/[world]/")).toEqual({
		page: "/[hello]/[world]/",
		component: "PageDynamicHelloNestsDynamicWorldNests",
	})
})
