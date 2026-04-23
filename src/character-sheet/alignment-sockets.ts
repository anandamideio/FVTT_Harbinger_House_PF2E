import { log, logDebug, logWarn, MODULE_ID } from '../config';
import { AlignmentPickerApp } from './pickers/AlignmentPickerApp';
import { ALIGNMENT_FLAG, getAlignmentName, syncAlignmentEffect, type AlignmentId } from './alignment';

/**
 * Alignment Picker — Socket Handlers
 *
 * Flow:
 *  1. GM launches the "Assign Alignments" macro
 *  2. GM client sends 'requestAlignmentPick' to all connected players
 *  3. Each player's client opens the alignment picker for their assigned character
 *  4. Player selects alignment → stored as module flag on the actor
 *  5. Player client sends 'alignmentPickResult' back so the GM gets a notification
 */

// ============================================================================
// Socket Message Types
// ============================================================================

interface RequestAlignmentPickMessage {
	type: 'requestAlignmentPick';
	/** The actor ID to set alignment on */
	actorId: string;
	/** The user ID who should see the picker */
	targetUserId: string;
}

interface AlignmentPickResultMessage {
	type: 'alignmentPickResult';
	actorId: string;
	actorName: string;
	alignmentId: AlignmentId;
	userId: string;
}

type AlignmentSocketMessage = RequestAlignmentPickMessage | AlignmentPickResultMessage;

const SOCKET_NAME = `module.${MODULE_ID}`;

// ============================================================================
// Registration
// ============================================================================

/** Register alignment socket handlers. Call once during 'ready' hook. */
export function registerAlignmentSockets(): void {
	game.socket.on(SOCKET_NAME, (data: unknown) => {
		const message = data as Record<string, unknown>;
		if (message.type === 'requestAlignmentPick' || message.type === 'alignmentPickResult') {
			handleAlignmentSocketMessage(message as unknown as AlignmentSocketMessage);
		}
	});
	log('Alignment socket handlers registered');
}

// ============================================================================
// Message Handling
// ============================================================================

function handleAlignmentSocketMessage(message: AlignmentSocketMessage): void {
	logDebug('[Alignment] Socket message received:', message.type);

	switch (message.type) {
		case 'requestAlignmentPick':
			handleAlignmentPickRequest(message);
			break;
		case 'alignmentPickResult':
			handleAlignmentPickResult(message);
			break;
	}
}

async function handleAlignmentPickRequest(message: RequestAlignmentPickMessage): Promise<void> {
	// Only the targeted user should respond
	if (message.targetUserId !== game.user?.id) return;

	const actor = game.actors?.get(message.actorId);
	if (!actor) {
		logWarn(`[Alignment] Actor ${message.actorId} not found for alignment pick`);
		return;
	}

	const current = (actor.getFlag(MODULE_ID, ALIGNMENT_FLAG) as AlignmentId | undefined) ?? '';
	const selected = await new AlignmentPickerApp(current, actor.name).open();

	if (selected === null) {
		logDebug(`[Alignment] Player dismissed alignment picker for ${actor.name}`);
		return;
	}

	// Store the alignment and synchronize the hidden effect that publishes
	// the matching roll option so PF2e rule elements can react to it.
	await actor.setFlag(MODULE_ID, ALIGNMENT_FLAG, selected);
	await syncAlignmentEffect(actor);
	log(`[Alignment] Player set alignment to "${selected}" for actor: ${actor.name}`);

	// Notify GM
	game.socket.emit(SOCKET_NAME, {
		type: 'alignmentPickResult',
		actorId: message.actorId,
		actorName: actor.name,
		alignmentId: selected,
		userId: game.user.id,
	} satisfies AlignmentPickResultMessage);
}

function handleAlignmentPickResult(message: AlignmentPickResultMessage): void {
	// Only the GM cares about these results
	if (!game.user?.isGM) return;

	const userName = game.users?.get(message.userId)?.name ?? 'Unknown';
	const alignmentName = getAlignmentName(message.alignmentId);
	ui.notifications.info(
		`${userName} set ${message.actorName}'s alignment to ${alignmentName} (${message.alignmentId})`,
	);
}

// ============================================================================
// GM Actions
// ============================================================================

interface ActivePlayerCharacter {
	userId: string;
	userName: string;
	actorId: string;
	actorName: string;
}

/** Get all active players and their assigned characters */
function getActivePlayerCharacters(): ActivePlayerCharacter[] {
	const users = game.users;
	if (!users) return [];

	const results: ActivePlayerCharacter[] = [];
	for (const user of users.contents) {
		if (user.isGM) continue;
		if (!user.active) continue;
		const character = user.character;
		if (!character) continue;

		results.push({
			userId: user.id,
			userName: user.name,
			actorId: character.id,
			actorName: character.name,
		});
	}

	return results;
}

/**
 * GM macro: request every connected player to pick their character's alignment.
 * Also opens the picker for any GM-owned characters on the canvas.
 */
export async function requestAlignmentFromPlayers(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only the GM can request alignment assignments.');
		return;
	}

	const playerCharacters = getActivePlayerCharacters();

	if (playerCharacters.length === 0) {
		ui.notifications.warn(
			'No active players with assigned characters found. Players must have a character assigned in User Configuration.',
		);
		return;
	}

	// Send alignment pick request to each player
	for (const pc of playerCharacters) {
		game.socket.emit(SOCKET_NAME, {
			type: 'requestAlignmentPick',
			actorId: pc.actorId,
			targetUserId: pc.userId,
		} satisfies RequestAlignmentPickMessage);

		logDebug(`[Alignment] Sent alignment pick request to ${pc.userName} for ${pc.actorName}`);
	}

	const names = playerCharacters.map((pc) => pc.actorName).join(', ');
	ui.notifications.info(`Alignment picker sent to ${playerCharacters.length} player(s): ${names}`);
}
