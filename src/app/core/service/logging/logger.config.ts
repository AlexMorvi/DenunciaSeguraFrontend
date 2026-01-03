export const LOGGER_CONFIG = {
    ENDPOINT: '/system/logs',
    BATCH_SIZE: 5,
    FLUSH_INTERVAL: 10000,
    DEBOUNCE_TIME: 3000,
};

const SENSITIVE_KEYS = [
    'password', 'pass', 'token', 'auth', 'secret', 'key', 'credential', // Auth
    'email', 'mail', 'nombre', 'name', 'apellido', 'phone', 'mobile', 'dni', 'cedula', 'user' // PII
].join('|');

export const SENSITIVE_KEYS_REGEX = new RegExp(SENSITIVE_KEYS, 'i');
