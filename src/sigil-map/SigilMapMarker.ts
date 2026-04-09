import type { RevealState, SigilLocation } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import {
	ANIM,
	CATEGORY_COLORS,
	CATEGORY_ICONS,
	FALLBACK_ICON,
	GLOW_ALPHA,
	LABEL_STYLE,
	MARKER_ALPHA,
	MARKER_GLOW_RADIUS,
	MARKER_HIT_RADIUS,
	MARKER_ICON_SIZE,
	MARKER_LABEL_FONT_SIZE,
	MARKER_LABEL_OFFSET_Y,
} from './constants';

export class SigilMapMarker extends PIXI.Container {
	readonly location: SigilLocation;
	private _state: LocationState;
	private _backgroundGlow: PIXI.Graphics;
	private _iconSprite: PIXI.Sprite;
	private _labelText: PIXI.Text;
	private _hoverLabel: PIXI.Text;
	private _hitCircle: PIXI.Graphics;
	private _isHovered = false;
	private _ambientTime = 0;
	private _animating = false;

	constructor(location: SigilLocation, state: LocationState) {
		super();
		this.location = location;
		this._state = state;
		this.name = `marker-${location.id}`;

		// Position on the Sigil map
		this.x = location.x;
		this.y = location.y;

		// Build child display objects
		this._backgroundGlow = this._createGlow();
		this._iconSprite = this._createIcon();
		this._labelText = this._createLabel();
		this._hoverLabel = this._createHoverLabel();
		this._hitCircle = this._createHitArea();

		this.addChild(this._backgroundGlow);
		this.addChild(this._iconSprite);
		this.addChild(this._labelText);
		this.addChild(this._hoverLabel);
		this.addChild(this._hitCircle);

		// Apply initial visual state (no animation)
		this._applyState(false);
	}

	// ========================================================================
	// Public API
	// ========================================================================

	get state(): LocationState {
		return this._state;
	}

	get revealState(): RevealState {
		return this._state.revealState;
	}

	get categoryColor(): number {
		return CATEGORY_COLORS[this.location.category] ?? 0xffffff;
	}

	/** Update the marker's state, optionally playing an animation */
	setState(state: LocationState, animate: boolean): void {
		this._state = state;
		this._applyState(animate);
	}

	/** Set hover highlight */
	setHovered(hovered: boolean): void {
		this._isHovered = hovered;
		this._updateHoverVisuals();
	}

	/** Called each frame for ambient animations */
	tick(deltaMs: number): void {
		if (this._state.revealState === 'hidden' || this._animating) return;

		this._ambientTime += deltaMs;
		const cycle = this._ambientTime % ANIM.AMBIENT_PULSE_PERIOD;
		const t = cycle / ANIM.AMBIENT_PULSE_PERIOD;

		// Sine wave pulse between min and max alpha
		const pulse = Math.sin(t * Math.PI * 2);
		const range = ANIM.AMBIENT_PULSE_MAX - ANIM.AMBIENT_PULSE_MIN;
		const glowAlpha = ANIM.AMBIENT_PULSE_MIN + (pulse + 1) * 0.5 * range;

		this._backgroundGlow.alpha = glowAlpha * GLOW_ALPHA[this._state.revealState];
	}

	// ========================================================================
	// Private: Create display objects
	// ========================================================================

	private _createGlow(): PIXI.Graphics {
		const gfx = new PIXI.Graphics();
		gfx.beginFill(this.categoryColor, 0.6);
		gfx.drawCircle(0, 0, MARKER_GLOW_RADIUS);
		gfx.endFill();
		gfx.alpha = 0;
		return gfx;
	}

	private _createIcon(): PIXI.Sprite {
		const iconPath = CATEGORY_ICONS[this.location.category] ?? FALLBACK_ICON;
		let sprite: PIXI.Sprite;
		try {
			sprite = PIXI.Sprite.from(iconPath);
		} catch {
			sprite = PIXI.Sprite.from(FALLBACK_ICON);
		}
		sprite.anchor.set(0.5);
		sprite.width = MARKER_ICON_SIZE;
		sprite.height = MARKER_ICON_SIZE;
		sprite.tint = this.categoryColor;
		sprite.alpha = 0;
		return sprite;
	}

	private _createLabel(): PIXI.Text {
		const text = new PIXI.Text(this.location.name, {
			fontFamily: LABEL_STYLE.fontFamily,
			fontSize: MARKER_LABEL_FONT_SIZE,
			fill: LABEL_STYLE.fill,
			stroke: LABEL_STYLE.stroke,
			strokeThickness: LABEL_STYLE.strokeThickness,
			dropShadow: LABEL_STYLE.dropShadow,
			dropShadowColor: LABEL_STYLE.dropShadowColor,
			dropShadowDistance: LABEL_STYLE.dropShadowDistance,
			dropShadowBlur: LABEL_STYLE.dropShadowBlur,
			align: 'center',
		} as Partial<PIXI.ITextStyle>);
		text.anchor.set(0.5, 0);
		text.y = MARKER_LABEL_OFFSET_Y;
		text.alpha = 0;
		text.resolution = 2;
		return text;
	}

	private _createHoverLabel(): PIXI.Text {
		const parts = [this.location.description];
		if (this.location.victim) {
			parts.unshift(`Victim: ${this.location.victim}`);
		}
		const text = new PIXI.Text(parts.join('\n'), {
			fontFamily: 'Rotis Serif, Georgia, serif',
			fontSize: 11,
			fill: '#e0d6c2',
			stroke: '#1a1108',
			strokeThickness: 3,
			dropShadow: true,
			dropShadowColor: '#000000',
			dropShadowDistance: 1,
			dropShadowBlur: 3,
			align: 'center',
			wordWrap: true,
			wordWrapWidth: 220,
		} as Partial<PIXI.ITextStyle>);
		text.anchor.set(0.5, 1);
		text.y = -(MARKER_ICON_SIZE / 2 + 8);
		text.alpha = 0;
		text.visible = false;
		text.resolution = 2;
		return text;
	}

	private _createHitArea(): PIXI.Graphics {
		// Visual-only hit area circle; actual pointer interaction is handled
		// by DOM event listeners in SigilMapLayer (PIXI events don't reach
		// CanvasLayer children in Foundry's InterfaceCanvasGroup).
		const gfx = new PIXI.Graphics();
		gfx.beginFill(0xffffff, 0.001);
		gfx.drawCircle(0, 0, MARKER_HIT_RADIUS);
		gfx.endFill();
		return gfx;
	}

	// ========================================================================
	// Private: Visuals
	// ========================================================================

	private _updateHoverVisuals(): void {
		if (this._state.revealState === 'hidden') return;

		if (this._isHovered) {
			// Show hover label for discovered markers (name is already shown)
			// Show description plaque
			this._hoverLabel.visible = true;
			this._hoverLabel.alpha = 1;

			// Brighten glow
			this._backgroundGlow.alpha = Math.min(1, this._backgroundGlow.alpha * 1.5);

			// Slight scale up
			this._iconSprite.scale.set(1.15);
		} else {
			this._hoverLabel.visible = false;
			this._hoverLabel.alpha = 0;

			this._iconSprite.scale.set(1);
		}
	}

	// ========================================================================
	// Private: Apply state visuals
	// ========================================================================

	private _applyState(animate: boolean): void {
		const state = this._state.revealState;

		if (state === 'hidden') {
			this.alpha = MARKER_ALPHA.hidden;
			this._backgroundGlow.alpha = 0;
			this._iconSprite.alpha = 0;
			this._labelText.alpha = 0;
			return;
		}

		if (animate) {
			this._playRevealAnimation(state);
		} else {
			// Snap to final state
			this.alpha = MARKER_ALPHA[state];
			this._backgroundGlow.alpha = GLOW_ALPHA[state];
			this._iconSprite.alpha = 1;

			// Name always shown for both discovered and investigated
			this._labelText.alpha = 1;

			// Dim icon for discovered, full for investigated
			if (state === 'discovered') {
				this._iconSprite.tint = this._dimColor(this.categoryColor, 0.6);
			} else {
				this._iconSprite.tint = this.categoryColor;
			}
		}
	}

	private _playRevealAnimation(state: RevealState): void {
		this._animating = true;
		const startTime = performance.now();
		const isDiscover = state === 'discovered';
		const totalDuration = isDiscover ? ANIM.DISCOVER_TOTAL : ANIM.INVESTIGATE_TOTAL;

		const tickFn = () => {
			const elapsed = performance.now() - startTime;
			const progress = Math.min(elapsed / totalDuration, 1);

			if (isDiscover) {
				this._animateDiscover(progress);
			} else {
				this._animateInvestigate(progress);
			}

			if (progress >= 1) {
				canvas.app.ticker.remove(tickFn);
				this._animating = false;
				this._applyState(false); // Snap to final
			}
		};

		// Set visible immediately
		this.alpha = 1;
		canvas.app.ticker.add(tickFn);
	}

	private _animateDiscover(progress: number): void {
		const burstEnd = ANIM.DISCOVER_BURST_DURATION / ANIM.DISCOVER_TOTAL;
		const iconStart = ANIM.DISCOVER_ICON_START / ANIM.DISCOVER_TOTAL;
		const iconEnd = ANIM.DISCOVER_ICON_END / ANIM.DISCOVER_TOTAL;

		// Glow burst: rapid expand then settle
		if (progress < burstEnd) {
			const burstProgress = progress / burstEnd;
			this._backgroundGlow.alpha = burstProgress * 0.9;
			this._backgroundGlow.scale.set(0.5 + burstProgress * 0.8);
		} else {
			const settleProgress = (progress - burstEnd) / (1 - burstEnd);
			this._backgroundGlow.alpha = 0.9 - settleProgress * (0.9 - GLOW_ALPHA.discovered);
			this._backgroundGlow.scale.set(1.3 - settleProgress * 0.3);
		}

		// Icon fade in with bounce
		if (progress >= iconStart && progress <= iconEnd) {
			const iconProgress = (progress - iconStart) / (iconEnd - iconStart);
			this._iconSprite.alpha = iconProgress;
			// Bounce: overshoot to 1.2x then settle
			const bounce = 1 + Math.sin(iconProgress * Math.PI) * 0.2;
			this._iconSprite.scale.set(bounce);
			this._iconSprite.tint = this._dimColor(this.categoryColor, 0.6);
		}

		// Label: always visible for discovered
		if (progress > iconStart) {
			const labelProgress = Math.min((progress - iconStart) / (1 - iconStart), 1);
			this._labelText.alpha = labelProgress;
		}
	}

	private _animateInvestigate(progress: number): void {
		const glowEnd = ANIM.INVESTIGATE_GLOW_DURATION / ANIM.INVESTIGATE_TOTAL;
		const iconStart = ANIM.INVESTIGATE_ICON_START / ANIM.INVESTIGATE_TOTAL;
		const iconEnd = ANIM.INVESTIGATE_ICON_END / ANIM.INVESTIGATE_TOTAL;
		const flashStart = ANIM.INVESTIGATE_FLASH_START / ANIM.INVESTIGATE_TOTAL;
		const flashEnd = ANIM.INVESTIGATE_FLASH_END / ANIM.INVESTIGATE_TOTAL;

		// Glow intensify
		if (progress < glowEnd) {
			const glowProgress = progress / glowEnd;
			this._backgroundGlow.alpha = GLOW_ALPHA.discovered + glowProgress * (GLOW_ALPHA.investigated - GLOW_ALPHA.discovered);
		} else {
			this._backgroundGlow.alpha = GLOW_ALPHA.investigated;
		}

		// Icon color shift from dim to full
		if (progress >= iconStart && progress <= iconEnd) {
			const iconProgress = (progress - iconStart) / (iconEnd - iconStart);
			const dimFactor = 0.6 + iconProgress * 0.4;
			this._iconSprite.tint = this._dimColor(this.categoryColor, dimFactor);
		}

		// Flash effect
		if (progress >= flashStart && progress <= flashEnd) {
			const flashProgress = (progress - flashStart) / (flashEnd - flashStart);
			const flashAlpha = Math.sin(flashProgress * Math.PI) * 0.5;
			this._backgroundGlow.alpha = GLOW_ALPHA.investigated + flashAlpha;
		}

		// Label is already visible from discovered state
		this._labelText.alpha = 1;
		this._iconSprite.alpha = 1;
	}

	/** Dim a hex color by a factor (0-1) */
	private _dimColor(color: number, factor: number): number {
		const r = Math.floor(((color >> 16) & 0xff) * factor);
		const g = Math.floor(((color >> 8) & 0xff) * factor);
		const b = Math.floor((color & 0xff) * factor);
		return (r << 16) | (g << 8) | b;
	}
}
