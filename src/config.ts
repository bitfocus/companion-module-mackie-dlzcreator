import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import { DEFAULT_PORT } from './constants.js'

export type ModelSelection = 'auto' | 'dlz-creator' | 'dlz-creator-xs'

export interface ModuleConfig {
	bonjourHost: string | null
	host: string
	port: number
	model: ModelSelection
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'model',
			label: 'Model',
			width: 6,
			default: 'auto',
			choices: [
				{ id: 'auto', label: 'Auto-detect' },
				{ id: 'dlz-creator', label: 'DLZ Creator' },
				{ id: 'dlz-creator-xs', label: 'DLZ Creator XS' },
			],
		},
		{
			type: 'bonjour-device',
			id: 'bonjourHost',
			label: 'DLZ Creator',
			width: 6,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP Address',
			width: 6,
			default: '',
			regex: Regex.IP,
			isVisibleExpression: '!$(options:bonjourHost)',
		},
		{
			type: 'static-text',
			id: 'host-filler',
			width: 6,
			label: '',
			isVisibleExpression: '!!$(options:bonjourHost)',
			value: '',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 6,
			default: DEFAULT_PORT,
			min: 1,
			max: 65535,
			isVisibleExpression: '!$(options:bonjourHost)',
		},
	]
}
