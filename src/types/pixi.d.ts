declare namespace PIXI {
	class DisplayObject {
		x: number;
		y: number;
		alpha: number;
		visible: boolean;
		scale: { x: number; y: number; set(x: number, y?: number): void };
		rotation: number;
		interactive: boolean;
		cursor: string;
		hitArea: Circle | Rectangle | null;
		parent: Container | null;
		destroy(options?: { children?: boolean }): void;

		on(event: string, fn: (...args: unknown[]) => void, context?: unknown): this;
		off(event: string, fn?: (...args: unknown[]) => void, context?: unknown): this;
		removeAllListeners(event?: string): this;
	}

	class Container extends DisplayObject {
		children: DisplayObject[];
		addChild<T extends DisplayObject>(...children: T[]): T;
		removeChild<T extends DisplayObject>(...children: T[]): T;
		removeChildren(beginIndex?: number, endIndex?: number): DisplayObject[];
		getChildByName(name: string): DisplayObject | null;
		name: string;

		constructor();
	}

	class Graphics extends DisplayObject {
		constructor();
		clear(): this;
		beginFill(color: number, alpha?: number): this;
		endFill(): this;
		drawCircle(x: number, y: number, radius: number): this;
		drawRect(x: number, y: number, width: number, height: number): this;
		lineStyle(width: number, color: number, alpha?: number): this;
		moveTo(x: number, y: number): this;
		lineTo(x: number, y: number): this;
		tint: number;
	}

	class Text extends DisplayObject {
		constructor(text: string, style?: Partial<ITextStyle>);
		text: string;
		style: ITextStyle;
		anchor: { set(x: number, y?: number): void; x: number; y: number };
		resolution: number;
	}

	interface ITextStyle {
		fontFamily: string | string[];
		fontSize: number | string;
		fill: string | number;
		stroke: string | number;
		strokeThickness: number;
		dropShadow: boolean;
		dropShadowColor: string | number;
		dropShadowDistance: number;
		dropShadowBlur: number;
		align: string;
		wordWrap: boolean;
		wordWrapWidth: number;
	}

	class Sprite extends DisplayObject {
		constructor(texture?: Texture);
		texture: Texture;
		anchor: { set(x: number, y?: number): void; x: number; y: number };
		width: number;
		height: number;
		tint: number;

		static from(source: string | Texture): Sprite;
	}

	class Texture {
		static from(source: string): Texture;
		static EMPTY: Texture;
		width: number;
		height: number;
	}

	class Circle {
		constructor(x: number, y: number, radius: number);
		x: number;
		y: number;
		radius: number;
	}

	class Rectangle {
		constructor(x: number, y: number, width: number, height: number);
	}
}
