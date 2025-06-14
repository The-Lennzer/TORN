interface payloadInterface {
    type: string,
    payload: Record<string, string>
}

interface CommandJobInterface {
    type: 'command',
    command: string,
    args: string[],
    timeout: number
}

export {
    payloadInterface,
    CommandJobInterface
}
