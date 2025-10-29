// Method decorator to manage isBusy state
// Manages its own internal busy state, no class property required
export function isBusy<TThis extends WeakKey, TArgs extends any[], TReturn>() {
	return function (
		originalMethod: (this: TThis, ...args: TArgs) => TReturn,
		_context: ClassMethodDecoratorContext<TThis, (this: TThis, ...args: TArgs) => TReturn>
	) {
		// Map to store pending promises by cache key
		const pendingPromises = new Map<string, Promise<TReturn>>();

		function replacementMethod(this: TThis, ...args: TArgs): TReturn | Promise<TReturn> {
			// Create a cache key based on specified argument names
			const cacheKey = args.join("-");

			const existingPromise = pendingPromises.get(cacheKey);
			if (existingPromise) {
				return existingPromise;
			}

			try {
				const result = originalMethod.call(this, ...args);

				// Handle promises
				if (result instanceof Promise) {
					const promise = result.finally(() => {
						pendingPromises.delete(cacheKey);
					});

					pendingPromises.set(cacheKey, promise);
					return promise;
				}

				// Handle synchronous functions
				// TODO: This shouldn't be the case ever
				throw new Error("We should never use synchronous methods for isBusy");
			} catch (error) {
				pendingPromises.delete(cacheKey);
				throw error;
			}
		}
		return replacementMethod as typeof originalMethod;
	};
}

// Decorator factory to update a store property with the method's return value
// propertyName must be a valid property key of the class instance
export function updateStore<TThis extends object, TArgs extends any[], TReturn>(propertyName: keyof TThis) {
	return function (
		originalMethod: (this: TThis, ...args: TArgs) => TReturn,
		_context: ClassMethodDecoratorContext<TThis, (this: TThis, ...args: TArgs) => TReturn>
	) {
		function replacementMethod(this: TThis, ...args: TArgs): TReturn | Promise<TReturn> {
			try {
				const result = originalMethod.call(this, ...args);
				// Handle promises
				if (result instanceof Promise) {
					return result.then(value => {
						this[propertyName] = value;
						return value;
					});
				}
				// Handle synchronous functions
				this[propertyName] = result;
				return result;
			} catch (error) {
				throw error;
			}
		}
		return replacementMethod as typeof originalMethod;
	};
}
