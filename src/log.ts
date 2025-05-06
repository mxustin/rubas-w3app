// Импорт и настройка логгера

import log from 'loglevel';

log.setLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'warn');

export default log;