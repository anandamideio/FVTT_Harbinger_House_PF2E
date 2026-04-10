import type { RevealState, SigilLocation } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import {
	ANIM,
	CATEGORY_COLORS,
	CATEGORY_ICONS,
	FALLBACK_ICON,
	GLOW_ALPHA,
	LOCATION_ICONS,
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
	private _hoverPanel: PIXI.Graphics;
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
		this._hoverPanel = this._createHoverPanel();
		this._hoverLabel = this._createHoverLabel();
		this._hitCircle = this._createHitArea();

		this.addChild(this._backgroundGlow);
		this.addChild(this._iconSprite);
		this.addChild(this._labelText);
		this.addChild(this._hoverPanel);
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
		const iconPath = LOCATION_ICONS[this.location.id] ?? CATEGORY_ICONS[this.location.category] ?? FALLBACK_ICON;
		let sprite: PIXI.Sprite;
		try {
			sprite = PIXI.Sprite.from(iconPath);
		} catch {
			sprite = PIXI.Sprite.from(FALLBACK_ICON);
		}
		sprite.anchor.set(0.5);
		sprite.width = MARKER_ICON_SIZE;
		sprite.height = MARKER_ICON_SIZE;
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

	private _createHoverPanel(): PIXI.Graphics {
		const gfx = new PIXI.Graphics();
		gfx.alpha = 0;
		gfx.visible = false;
		return gfx;
	}

	/** Redraw the hover plaque behind the label, sized to fit the current text. */
	private _refreshHoverPanel(): void {
		const gfx = this._hoverPanel;
		const label = this._hoverLabel;

		// Force PIXI to lay out the text so .width/.height are accurate
		const tw = label.width;
		const th = label.height;

		// Anchor is (0.5, 1) at y = -(MARKER_ICON_SIZE/2 + 8)
		const anchorY = -(MARKER_ICON_SIZE / 2 + 8);
		const padX = 14;
		const padY = 10;
		const cornerSize = 5;
		const left = -tw / 2 - padX;
		const top = anchorY - th - padY;
		const width = tw + padX * 2;
		const height = th + padY * 2;

		const accent = this.categoryColor;

		gfx.clear();

		// Outer border (category color, low opacity)
		gfx.lineStyle(1.5, accent, 0.55);
		gfx.beginFill(0x08060a, 0.93);
		gfx.drawRoundedRect(left, top, width, height, 3);
		gfx.endFill();

		// Top accent bar
		gfx.lineStyle(0);
		gfx.beginFill(accent, 0.45);
		gfx.drawRect(left + cornerSize, top, width - cornerSize * 2, 2);
		gfx.endFill();

		// Bottom accent bar
		gfx.beginFill(accent, 0.25);
		gfx.drawRect(left + cornerSize, top + height - 2, width - cornerSize * 2, 2);
		gfx.endFill();

		// Corner diamonds (4-pointed, drawn as rotated squares)
		const corners = [
			[left, top],
			[left + width, top],
			[left, top + height],
			[left + width, top + height],
		] as const;
		gfx.beginFill(accent, 0.9);
		for (const [cx, cy] of corners) {
			const d = cornerSize * 0.65;
			gfx.drawPolygon([cx, cy - d, cx + d, cy, cx, cy + d, cx - d, cy]);
		}
		gfx.endFill();

		// Thin inner highlight line just below the top bar
		gfx.lineStyle(1, 0xffffff, 0.06);
		gfx.moveTo(left + cornerSize + 1, top + 3);
		gfx.lineTo(left + width - cornerSize - 1, top + 3);
		gfx.lineStyle(0);
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
			// Draw/refresh the background plaque sized to fit the label
			this._refreshHoverPanel();
			this._hoverPanel.visible = true;
			this._hoverPanel.alpha = 1;

			this._hoverLabel.visible = true;
			this._hoverLabel.alpha = 1;

			// Brighten glow
			this._backgroundGlow.alpha = Math.min(1, this._backgroundGlow.alpha * 1.5);

			// Slight scale up
			this._iconSprite.scale.set(1.15);
		} else {
			this._hoverPanel.visible = false;
			this._hoverPanel.alpha = 0;

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
}
