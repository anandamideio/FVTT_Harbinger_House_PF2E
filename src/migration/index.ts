import { log, logWarn, MODULE_ID } from '../config';

/**
 * Migration System
 *
 * Runs data migrations on documents imported by this module.
 *
 * How it works:
 * 1. Each world stores a schemaVersion setting (starts at 0)
 * 2. On ready hook, compare world version to CURRENT_SCHEMA_VERSION
 * 3. Run any pending migrations in order
 * 4. Update schemaVersion after each successful migration
 */

export interface Migration {
	/** Version number this migration brings the schema to */
	version: number;
	/** Human-readable description of what this migration does */
	label: string;
	/** The migration function — transforms world documents as needed */
	migrate: () => Promise<void>;
}

/**
 * Current schema version. Bump this when adding a new migration.
 * Version 1 = initial baseline (no transforms needed, just sets the version).
 */
export const CURRENT_SCHEMA_VERSION = 1;

/** Schema version setting key */
export const SCHEMA_VERSION_SETTING = 'schemaVersion';

/**
 * All migrations in order. Add new migrations to the end of this array.
 *
 * Example migration:
 * {
 *   version: 2,
 *   label: 'Add planar origin flag to imported NPCs',
 *   migrate: async () => {
 *     const actors = game.actors?.filter(
 *       (a) => a.flags?.[MODULE_ID]?.imported === true
 *     ) || [];
 *     for (const actor of actors) {
 *       await actor.setFlag(MODULE_ID, 'planarOrigin', 'sigil');
 *     }
 *   },
 * }
 */
const MIGRATIONS: Migration[] = [
	// Version 1: baseline — no transforms, just establishes the schema version
];

/**
 * Register the schemaVersion setting. Must be called during the init hook.
 */
export function registerMigrationSettings(): void {
	game.settings.register(MODULE_ID, SCHEMA_VERSION_SETTING, {
		name: 'Schema Version',
		hint: 'Internal data schema version for migration tracking',
		scope: 'world',
		config: false,
		type: Number,
		default: 0,
	});
}

/**
 * Check for and run any pending migrations.
 * Call this during the ready hook, before showing the import dialog.
 */
export async function runPendingMigrations(): Promise<void> {
	const worldVersion = game.settings.get(MODULE_ID, SCHEMA_VERSION_SETTING) as number;

	if (worldVersion >= CURRENT_SCHEMA_VERSION) {
		return;
	}

	const pending = MIGRATIONS.filter((m) => m.version > worldVersion);

	if (pending.length > 0) {
		log(`Running ${pending.length} pending migration(s) from v${worldVersion} to v${CURRENT_SCHEMA_VERSION}`);
		ui.notifications?.info(`Harbinger House: Running ${pending.length} data migration(s)...`);

		for (const migration of pending) {
			try {
				log(`  Migration v${migration.version}: ${migration.label}`);
				await migration.migrate();
				await game.settings.set(MODULE_ID, SCHEMA_VERSION_SETTING, migration.version);
				log(`  ✓ Migration v${migration.version} complete`);
			} catch (error) {
				logWarn(`  ✗ Migration v${migration.version} failed:`, error);
				ui.notifications?.error(`Harbinger House: Migration failed — ${migration.label}`);
				return; // Stop on first failure to prevent cascading issues
			}
		}

		ui.notifications?.info('Harbinger House: Data migrations complete.');
	}

	// Set to current version even if no migrations ran (baseline)
	if (worldVersion < CURRENT_SCHEMA_VERSION) {
		await game.settings.set(MODULE_ID, SCHEMA_VERSION_SETTING, CURRENT_SCHEMA_VERSION);
		log(`Schema version set to ${CURRENT_SCHEMA_VERSION}`);
	}
}
