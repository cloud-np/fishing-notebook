// Method decorator to manage isBusy state
// The class must have an isBusy property
export function isBusy<TThis extends { isBusy: boolean }, TArgs extends any[], TReturn>(
	originalMethod: (this: TThis, ...args: TArgs) => TReturn,
	_context: ClassMethodDecoratorContext<TThis, (this: TThis, ...args: TArgs) => TReturn>
) {
	function replacementMethod(this: TThis, ...args: TArgs): TReturn | Promise<TReturn> {
		this.isBusy = true;
		try {
			const result = originalMethod.call(this, ...args);
			// Handle promises
			if (result instanceof Promise) {
				return result.finally(() => {
					this.isBusy = false;
				});
			}
			// Handle synchronous functions
			this.isBusy = false;
			return result;
		} catch (error) {
			this.isBusy = false;
			throw error;
		}
	}
	return replacementMethod as typeof originalMethod;
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
