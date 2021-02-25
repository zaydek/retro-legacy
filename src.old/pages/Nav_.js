import { Link } from "../../packages/router"

const paths = [
	{ path: "/", children: "Open home" },
	{ path: "/nested/", children: "Open nested home" },
	{ path: "/bulbasaur", children: "Open bulbasaur" },
	{ path: "/charmander", children: "Open charmander" },
	{ path: "/pikachu", children: "Open pikachu" },
	{ path: "/squirtle", children: "Open squirtle" },
	{ path: "/oops", children: "Open oops" },
	{ path: "/404", children: "Open 404" },
	{ path: "https://google.com", children: "Open google" },
]

export default function Nav() {
	return (
		// prettier-ignore
		<ul>
			{paths.map(({ path, children }) => (
				<li key={path}>
					<Link path={path}>
						{children}
					</Link>
				</li>
			))}
		</ul>
	)
}
