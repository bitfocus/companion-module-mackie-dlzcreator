import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

/**
 * Upgrade scripts for migrating between module versions.
 * Currently empty — will be populated as breaking changes are made.
 */
export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = []
