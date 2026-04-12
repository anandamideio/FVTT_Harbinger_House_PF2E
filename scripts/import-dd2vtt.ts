import path from 'node:path';

import { DD2VTTImportConfigLoader } from './dd2vtt-importer/config-loader.ts';
import { DD2VTTImportPipeline } from './dd2vtt-importer/dd2vtt-import-pipeline.ts';
import type { ImporterLogger } from './dd2vtt-importer/types.ts';

const DEFAULT_CONFIG_PATH = path.join('scripts', 'dd2vtt.config.ts');

interface CliOptions {
	configPath?: string;
	dryRun: boolean;
	allowMissingInputs: boolean;
	help: boolean;
}

function printHelp(): void {
	console.log('Usage: pnpm run import:dd2vtt -- [--config <path>] [--dry-run]');
	console.log('');
	console.log('Options:');
	console.log('  --config, -c   Path to importer config file (TypeScript module)');
	console.log('  --dry-run      Parse and convert without writing image/module output');
	console.log('  --allow-missing Continue when configured source files are missing');
	console.log('  --help, -h     Print usage information');
}

function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {
		dryRun: false,
		allowMissingInputs: false,
		help: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--') {
			continue;
		}
		switch (arg) {
			case '--config':
			case '-c': {
				const value = args[i + 1];
				if (!value) {
					throw new Error(`${arg} requires a file path.`);
				}
				options.configPath = value;
				i += 1;
				break;
			}
			case '--dry-run':
				options.dryRun = true;
				break;
			case '--allow-missing':
				options.allowMissingInputs = true;
				break;
			case '--help':
			case '-h':
				options.help = true;
				break;
			default:
				throw new Error(`Unknown argument: ${arg}`);
		}
	}

	return options;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printHelp();
		return;
	}

	const loader = new DD2VTTImportConfigLoader(DEFAULT_CONFIG_PATH);
	const config = await loader.load(options.configPath);

	const logger: ImporterLogger = {
		info: (message) => console.log(message),
		warn: (message) => console.warn(message),
		error: (message) => console.error(message),
	};

	const pipeline = new DD2VTTImportPipeline({
		config,
		dryRun: options.dryRun,
		allowMissingInputs: options.allowMissingInputs,
		logger,
	});

	const report = pipeline.run();
	if (report.importedCount === 0) {
		console.warn('No scenes imported. Existing generated module was left unchanged.');
		return;
	}

	console.log('Done.');
	if (options.dryRun) {
		console.log(`Dry run summary: ${report.importedCount} imported, ${report.skippedCount} skipped.`);
	} else {
		console.log(`Import summary: ${report.importedCount} imported, ${report.skippedCount} skipped.`);
		console.log('Run pnpm run build:packs to rebuild compendium packs.');
	}
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`DD2VTT importer failed: ${message}`);
	process.exitCode = 1;
});
