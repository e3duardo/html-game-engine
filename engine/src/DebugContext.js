// Read-only "context" for debug switches, taken from the page URL once at
// boot (same idea as a React context: any component reads it from
// Inject.debug instead of parsing the URL itself).
//
//   ?debug            -> enabled, no extra flags
//   ?debug=1 | true   -> same
//   ?debug=overflow   -> enabled + the "overflow" flag
//   ?debug=overflow,x -> comma list, each entry a flag
//
// Flags are free-form strings: the engine doesn't know what "overflow"
// means, whoever reads has('overflow') does.
class DebugContext {
	constructor(search = window.location.search, hash = window.location.hash) {
		// also accepts the query after the hash (index.html#1-1?debug=1)
		const hashQuery = hash.includes('?') ? hash.slice(hash.indexOf('?')) : '';
		const raw = new URLSearchParams(search).get('debug') ?? new URLSearchParams(hashQuery).get('debug');
		this.enabled = raw !== null && raw !== '0' && raw !== 'false';
		this.flags = new Set(
			this.enabled
				? raw
						.split(',')
						.map((flag) => flag.trim())
						.filter((flag) => flag && flag !== '1' && flag !== 'true')
				: []
		);
	}

	has(flag) {
		return this.enabled && this.flags.has(flag);
	}
}

export default DebugContext;
