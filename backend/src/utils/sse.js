/**
 * Server-Sent Events helper: primes the response headers and returns a `send` function.
 * @param {import('express').Response} res
 */
export function openSseStream(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 15000);

  const close = () => {
    clearInterval(heartbeat);
    try {
      res.end();
    } catch {
      /* noop */
    }
  };

  return { send, close };
}
