class GameEvent {
	constructor(type, data = {}) {
		this.type = type;
		this.data = data;
		this.timestamp = Date.now();
	}
}

class KeyEvent extends GameEvent {
	constructor(key, pressed) {
		super('key', { key, pressed });
	}
}

class MoveEvent extends GameEvent {
	constructor(actor, x, y) {
		super('move', { actor, x, y });
	}
}

class CollisionEvent extends GameEvent {
	constructor(actor, target, collisions) {
		super('collision', { actor, target, collisions });
	}
}

class EventBus {
	constructor() {
		this.verbose = false;
		this.disabledTypes = new Set();
		this.listeners = [];
		this.history = [];
		this.maxHistory = 300;
	}

	emit = (event) => {
		if (this.disabledTypes.has(event.type)) return;

		this.history.push(event);
		if (this.history.length > this.maxHistory) this.history.shift();

		this.listeners.forEach((listener) => listener(event));

		if (this.verbose) {
			console.log(`[${event.type}]`, event.data);
		}
	};

	subscribe = (listener) => {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	};

	enable = () => {
		this.verbose = true;
	};

	disable = () => {
		this.verbose = false;
	};

	disableType = (type) => {
		this.disabledTypes.add(type);
	};

	enableType = (type) => {
		this.disabledTypes.delete(type);
	};

	isTypeEnabled = (type) => {
		return !this.disabledTypes.has(type);
	};
}

export { GameEvent, KeyEvent, MoveEvent, CollisionEvent, EventBus };
export default EventBus;
