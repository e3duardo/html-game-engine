// generic scene router, game-agnostic: a game registers a fragment URL + a
// boot callback per route name, then calls start() once. It only knows about
// the same `.Scene` container SceneBase itself binds to - swapping its
// innerHTML for whatever fragment matches the current `location.hash` - and
// nothing about Puppet/Hud/game state, so any game built on this engine can
// reuse it the same way. No routing library: hash-based
// navigation needs no server support (the hash never reaches the server), so
// a static host like GitHub Pages just works with zero extra config.
class Router {
	constructor() {
		this.routes = new Map();
		this.current = null;
		this.defaultRoute = null;
		window.addEventListener('hashchange', () => this._resolveHash());
	}

	register(name, fragment, onLoad) {
		this.routes.set(name, { fragment, onLoad });
		if (!this.defaultRoute) this.defaultRoute = name;
	}

	start() {
		this._resolveHash();
	}

	// route name from the hash, ignoring a query tucked after it (#1-1?debug=1)
	_hashRoute() {
		return window.location.hash.slice(1).split('?')[0];
	}

	_resolveHash() {
		this.goTo(this._hashRoute() || this.defaultRoute);
	}

	// idempotent on the current route - besides being a harmless no-op for a
	// redundant call, this is what stops the hashchange listener above from
	// re-entering goTo() a second time right after goTo() sets the hash
	// itself a few lines down
	async goTo(name) {
		const route = this.routes.get(name);
		if (!route || name === this.current) return;
		const html = await fetch(route.fragment).then((response) => response.text());
		document.querySelector('.Scene').innerHTML = html;
		this.current = name;
		// the default route lives at the bare "/" (no hash) instead of #name
		const wanted = name === this.defaultRoute ? '' : name;
		if (this._hashRoute() !== wanted) window.location.hash = wanted;
		route.onLoad(name);
	}
}

export default Router;
