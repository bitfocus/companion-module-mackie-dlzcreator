import { InstanceStatus, type InstanceBase } from '@companion-module/base'
import { io, Socket } from 'socket.io-client'
import { SOCKET_EVENT, RECONNECT_INTERVAL } from './constants.js'
import type { ModuleConfig } from './config.js'

export type StateUpdateCallback = (data: Record<string, any>) => void

/**
 * Manages the Socket.io connection to a DLZ Creator mixer.
 */
export class DlzConnection {
	private socket: Socket | null = null
	private instance: InstanceBase<ModuleConfig>
	private onStateUpdate: StateUpdateCallback
	private _connected = false

	constructor(instance: InstanceBase<ModuleConfig>, onStateUpdate: StateUpdateCallback) {
		this.instance = instance
		this.onStateUpdate = onStateUpdate
	}

	get connected(): boolean {
		return this._connected
	}

	connect(host: string, port: number): void {
		this.disconnect()

		const url = `http://${host}:${port}`
		this.instance.log('debug', `Connecting to ${url}`)

		this.socket = io(url, {
			transports: ['websocket'],
			reconnection: true,
			reconnectionDelay: RECONNECT_INTERVAL,
			reconnectionDelayMax: RECONNECT_INTERVAL * 2,
			timeout: 10000,
		})

		this.socket.on('connect', () => {
			this.instance.log('info', `Connected to DLZ Creator at ${url}`)
			this._connected = true
			this.instance.updateStatus(InstanceStatus.Ok)
			// Request full state
			this.send({ cmd: 'INIT' })
		})

		this.socket.on('disconnect', (reason: string) => {
			this.instance.log('warn', `Disconnected: ${reason}`)
			this._connected = false
			this.instance.updateStatus(InstanceStatus.Disconnected)
		})

		this.socket.on('connect_error', (err: Error) => {
			this.instance.log('error', `Connection error: ${err.message}`)
			this._connected = false
			this.instance.updateStatus(InstanceStatus.ConnectionFailure)
		})

		this.socket.on(SOCKET_EVENT, (data: any) => {
			if (data && typeof data === 'object') {
				this.onStateUpdate(data as Record<string, any>)
			}
		})
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.removeAllListeners()
			this.socket.disconnect()
			this.socket = null
			this._connected = false
		}
	}

	/**
	 * Send a message to the mixer.
	 * For state changes: send { "key": value }
	 * For commands: send { cmd: "CMD_NAME", args: { ... } }
	 */
	send(data: Record<string, any>): void {
		if (this.socket && this._connected) {
			this.socket.emit(SOCKET_EVENT, data)
		}
	}

	/**
	 * Set a single state key on the mixer.
	 * Optimistically updates local state because the mixer only broadcasts
	 * state changes to OTHER clients (Socket.IO broadcast), not back to the sender.
	 */
	setState(key: string, value: any): void {
		this.send({ [key]: value })
		if (this._connected) {
			this.onStateUpdate({ [key]: value })
		}
	}

	/**
	 * Set multiple state keys at once.
	 * Optimistically updates local state (see setState).
	 */
	setStates(data: Record<string, any>): void {
		this.send(data)
		if (this._connected) {
			this.onStateUpdate(data)
		}
	}

	/**
	 * Send a command to the mixer.
	 */
	sendCommand(cmd: string, args?: Record<string, any>): void {
		const payload: Record<string, any> = { cmd }
		if (args) payload.args = args
		this.send(payload)
	}

	destroy(): void {
		this.disconnect()
	}
}
