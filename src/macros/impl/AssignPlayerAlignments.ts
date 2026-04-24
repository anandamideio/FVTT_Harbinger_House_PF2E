import { requestAlignmentFromPlayers } from '../../character-sheet/alignment-sockets';
import { HarbingerMacro } from '../Macro';

export class AssignPlayerAlignments extends HarbingerMacro {
	readonly name = 'assignPlayerAlignments' as const;
	readonly label = 'Assign Player Alignments';

	async run(): Promise<void> {
		await requestAlignmentFromPlayers();
	}
}
