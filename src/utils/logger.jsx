import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import store from '../reducers/store';

// Logger configuration
const LOG_CONFIG = {
  API_ENDPOINT: import.meta.env.VITE_LOGS_URL + '/api/v1/logs',
  BUFFER_FLUSH_INTERVAL: 5000,
  MAX_BUFFER_SIZE: 50,
  RATE_LIMIT_MS: 100,
  MAX_CONSECUTIVE: 2,
  RESET_INTERVAL: 60 * 1000,
  APP_VERSION: '1.0.0',
  MAX_MESSAGE_LENGTH: 1000,
};

// Log levels
const LogLevel = {
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  CRITICAL: 5,
};

// Logger state
const loggerState = {
  lastLog: null,
  consecutiveCount: 0,
  lastLogTime: 0,
  buffer: [],
  studentId: null,
  flushInterval: null,
  resetInterval: null,
  apiFailed: false,
  lastApiFailureTime: 0,
  API_COOLDOWN_MS: 30 * 1000,
};

// // Initialize user session
const userSession = uuidv4();

// Student ID getter
export function getStudentId() {
  try {
    const state = store.getState();
    return state.student?.studentDetails?.studentId || null;
  } catch (err) {
    console.warn('[Logger] Failed to get studentId:', err);
    return null;
  }
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (navigator.brave?.isBrave) return 'Brave';
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  if (ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Chrome')) return 'Google Chrome';
  return 'Unknown';
}

function getNetworkStatus() {
  return navigator.onLine ? 'online' : 'offline';
}

function isLargeObject(obj) {
  try {
    const stringified = JSON.stringify(obj);
    return stringified.length > LOG_CONFIG.MAX_MESSAGE_LENGTH;
  } catch {
    return false;
  }
}

function formatArgs(args) {
  try {
    return args
      .map(arg => {
        if (arg === null || arg === undefined) return String(arg);
        if (typeof arg === 'object' && !(arg instanceof Error)) {
          try {
            return isLargeObject(arg)
              ? 'Consoled large object'
              : JSON.stringify(arg, null, 2);
          } catch {
            return '[Unserializable Object]';
          }
        }
        return String(arg).slice(0, LOG_CONFIG.MAX_MESSAGE_LENGTH);
      })
      .join(' ')
      .slice(0, LOG_CONFIG.MAX_MESSAGE_LENGTH);
  } catch {
    return '[Formatting Error]';
  }
}

async function flushBuffer() {
  if (loggerState.buffer.length === 0) return;

  const now = Date.now();
  if (
    loggerState.apiFailed &&
    now - loggerState.lastApiFailureTime < loggerState.API_COOLDOWN_MS
  ) {
    console.debug('[Logger] Skipping flush due to recent API failure');
    return;
  }

  const logsToSend = [...loggerState.buffer];
  loggerState.buffer = [];

  try {
    await axios.post(LOG_CONFIG.API_ENDPOINT, logsToSend, {
      timeout: 10000,
    });
    console.debug('Logs sent to backend:', logsToSend.length);
    loggerState.apiFailed = false;
  } catch (err) {
    loggerState.apiFailed = true;
    loggerState.lastApiFailureTime = now;
    console.warn('[Logger] Failed to send logs:', err.message);
    if (!navigator.onLine || err.code === 'ECONNABORTED') {
      if (
        loggerState.buffer.length + logsToSend.length <=
        LOG_CONFIG.MAX_BUFFER_SIZE * 3
      ) {
        loggerState.buffer.push(...logsToSend);
      } else {
        console.warn('[Logger] Buffer overflow, discarding oldest logs');
        loggerState.buffer = loggerState.buffer.slice(
          -LOG_CONFIG.MAX_BUFFER_SIZE
        );
      }
    }
  }
}

async function sendLog(
  level,
  message,
  error = null,
  action = 'none',
  rawData = null
) {
  if (message.includes('[Logger] Failed to send logs')) {
    return;
  }

  const levelStr =
    typeof level === 'string'
      ? level.toUpperCase()
      : Object.keys(LogLevel).find(k => LogLevel[k] === level);
  if (!levelStr || levelStr === 'DEBUG') {
    return;
  }

  const now = Date.now();
  const logKey = `${levelStr}:${message}:${action}`;

  if (
    action === 'none' &&
    logKey === loggerState.lastLog &&
    now - loggerState.lastLogTime < LOG_CONFIG.RATE_LIMIT_MS
  ) {
    return;
  }

  if (action !== 'none') {
    loggerState.lastLog = null;
    loggerState.consecutiveCount = 0;
  } else {
    if (
      logKey === loggerState.lastLog &&
      loggerState.consecutiveCount >= LOG_CONFIG.MAX_CONSECUTIVE
    ) {
      return;
    }
    if (logKey === loggerState.lastLog) {
      loggerState.consecutiveCount += 1;
    } else {
      loggerState.lastLog = logKey;
      loggerState.consecutiveCount = 1;
    }
  }

  loggerState.lastLogTime = now;

  let modifiedMessage = message;
  if (
    action === 'none' &&
    loggerState.consecutiveCount <= LOG_CONFIG.MAX_CONSECUTIVE
  ) {
    const ordinal = loggerState.consecutiveCount === 1 ? '1st' : '2nd';
    modifiedMessage = `${message} (${ordinal} occurrence)`;
  }

  let authState, userInfo;
  try {
    authState = store.getState().auth || {};
    userInfo = authState.userInfo || {};
  } catch (err) {
    console.warn('[Logger] Failed to access auth state:', err);
    userInfo = {};
  }

  const studentId = getStudentId();
  const studentUUID = userInfo.id || 'unknown';

  const log = {
    logId: uuidv4(),
    message: modifiedMessage,
    userSession,
    page: window.location.href,
    userAgent: navigator.userAgent,
    file: 'unknown',
    action,
    userBrowser: detectBrowser(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpi: window.devicePixelRatio || 1,
    },
    studentId,
    rawData: {
      studentUUID,
      userType: userInfo.userType || 'unknown',
      location: userInfo.location || 'unknown',
      email: userInfo.email || 'unknown',
      ...(rawData || {}),
    },
    appVersion: LOG_CONFIG.APP_VERSION,
    networkStatus: getNetworkStatus(),
    level: levelStr,
    error: error
      ? {
          message: error.message,
          name: error.name,
          code: error.code,
          status: error.status,
        }
      : null,
    response: error?.response
      ? {
          data: error.response.data || null,
          headers: error.response.headers || null,
        }
      : null,
    line: 'unknown',
  };

  loggerState.buffer.push(log);

  // Flush immediately for ERROR or CRITICAL logs
  if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
    await flushBuffer();
  } else if (loggerState.buffer.length >= LOG_CONFIG.MAX_BUFFER_SIZE) {
    await flushBuffer();
  }
}

function logAction(actionName, message) {
  sendLog(LogLevel.INFO, message, null, actionName);
}

function logError(error, message = 'Unhandled Error', action = 'error') {
  sendLog(LogLevel.ERROR, message, error, action);
}

function consoleLog(level, ...args) {
  let message = formatArgs(args);
  let rawData =
    args.find(
      arg => typeof arg === 'object' && arg !== null && !(arg instanceof Error)
    ) || null;
  const error = args.find(arg => arg instanceof Error) || null;

  // Send full object in rawData, use descriptive message
  if (rawData && isLargeObject(rawData)) {
    message = 'Consoled large object';
  }

  sendLog(
    level === 'log'
      ? LogLevel.INFO
      : level === 'warn'
        ? LogLevel.WARN
        : LogLevel.ERROR,
    message,
    error,
    'console_log',
    rawData // Send full object
  );
}

function initLogger() {
  if (window.__loggerInitialized) return;
  window.__loggerInitialized = true;

  if (!LOG_CONFIG.API_ENDPOINT) {
    console.error('[Logger] VITE_LOGS_URL is not defined');
    return;
  }

  const LOG_THROTTLE_MS = 1000;
  const BATCH_SIZE = 2;
  let lastClickLog = 0;
  const originalConsole = { ...console };
  let logQueue = [];
  let isSending = false;
  let recursionGuard = false;

  const queueLog = (
    level,
    msg,
    errorObj = null,
    action = 'console',
    rawData = null
  ) => {
    if (recursionGuard || msg.includes('[vite]') || msg.includes('undefined'))
      return;
    logQueue.push({
      level,
      msg,
      error: errorObj,
      action,
      rawData,
      timestamp: Date.now(),
    });

    // Send immediately for errors or if queue has enough logs
    if (level === 'error' || logQueue.length >= BATCH_SIZE) {
      sendBatchedLogs();
    } else if (logQueue.length === 1) {
      setTimeout(sendBatchedLogs, 0);
    }
  };

  const sendBatchedLogs = async () => {
    if (isSending || recursionGuard || !logQueue.length) return;
    isSending = true;
    recursionGuard = true;

    const batch = logQueue.slice(0, BATCH_SIZE);
    logQueue = logQueue.slice(BATCH_SIZE);

    try {
      await Promise.all(
        batch.map(log =>
          sendLog(log.level, log.msg, log.error, log.action, log.rawData)
        )
      );
    } catch (err) {
      console.warn('[Logger] Failed to send log batch:', err);
    }

    isSending = false;
    recursionGuard = false;

    if (logQueue.length) {
      setTimeout(sendBatchedLogs, LOG_THROTTLE_MS);
    }
  };

  ['log', 'warn', 'error'].forEach(level => {
    console[level] = (...args) => {
      originalConsole[level](...args);
      if (recursionGuard) return;
      let message = formatArgs(args);
      const err = args.find(a => a instanceof Error);
      let rawData =
        args.find(
          a => typeof a === 'object' && a !== null && !(a instanceof Error)
        ) || null;

      // Send full object in rawData
      if (rawData && isLargeObject(rawData)) {
        message = 'Consoled large object';
      }

      queueLog(level, message, err, 'console', rawData);
    };
  });

  window.onerror = (message, source, lineno, colno, error) => {
    queueLog('error', message, error || new Error(message), 'window_error');
  };

  window.onunhandledrejection = event => {
    const reason =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    queueLog(
      'error',
      'Unhandled Promise rejection',
      reason,
      'promise_rejection'
    );
  };

  const clickHandler = e => {
    const now = Date.now();
    if (now - lastClickLog < LOG_THROTTLE_MS) return;
    lastClickLog = now;

    const target = e.target;
    if (target instanceof Element && target.hasAttribute('data-log-action')) {
      const action = target.getAttribute('data-log-action');
      if (!['question_selected', 'question_navigated'].includes(action)) {
        queueLog('info', `Clicked: ${action}`, null, action);
      }
    }
  };
  window.addEventListener('click', clickHandler);

  if (window.allEarlyLogs?.length) {
    window.allEarlyLogs.forEach(log => {
      const message = log.args
        .map(a =>
          typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
        )
        .join(' ');
      const rawData =
        log.args.find(
          a => typeof a === 'object' && a !== null && !(a instanceof Error)
        ) || null;
      if (!message.includes('[vite]') && !message.includes('undefined')) {
        sendLog(
          LogLevel.INFO,
          `[EARLY_LOG] ${message}`,
          null,
          'console_patch',
          rawData
        );
      }
    });
    window.allEarlyLogs = [];
  }

  if (window.suspiciousScripts?.length) {
    window.suspiciousScripts.forEach(src => {
      sendLog(
        LogLevel.WARN,
        `Suspicious extension: ${src}`,
        null,
        'extension_check'
      );
    });
    window.suspiciousScripts = [];
  }

  loggerState.flushInterval = setInterval(
    flushBuffer,
    LOG_CONFIG.BUFFER_FLUSH_INTERVAL
  );
  loggerState.resetInterval = setInterval(() => {
    loggerState.lastLog = null;
    loggerState.consecutiveCount = 0;
  }, LOG_CONFIG.RESET_INTERVAL);

  const cleanup = () => {
    ['log', 'warn', 'error'].forEach(level => {
      console[level] = originalConsole[level];
    });
    window.removeEventListener('click', clickHandler);
    window.onerror = null;
    window.onunhandledrejection = null;
    logQueue = [];
    if (loggerState.flushInterval) clearInterval(loggerState.flushInterval);
    if (loggerState.resetInterval) clearInterval(loggerState.resetInterval);
    window.__loggerInitialized = false;
    loggerState.studentId = null;
  };

  // Flush logs and cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (loggerState.buffer.length > 0) {
      navigator.sendBeacon(
        LOG_CONFIG.API_ENDPOINT,
        JSON.stringify(loggerState.buffer)
      );
      loggerState.buffer = [];
    }
    cleanup();
  });

  // Expose cleanup for manual use
  window.__cleanupLogger = cleanup;
}

export {
  sendLog,
  formatArgs as formatConsoleArgs,
  logAction,
  logError,
  consoleLog,
  LogLevel,
  initLogger,
};
