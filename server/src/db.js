import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy server/.env.example to server/.env.');
  process.exit(1);
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

/**
 * Holds one dedicated connection that LISTENs on a channel and reconnects
 * if it drops. Every server instance gets every insert, so SSE fan-out works
 * even behind a load balancer.
 */
export function listen(channel, onPayload) {
  let retryMs = 1000;

  const connect = async () => {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    const reconnect = () => {
      client.removeAllListeners();
      client.end().catch(() => {});
      setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 2, 30_000);
    };

    client.on('error', (err) => {
      console.error(`[listen:${channel}]`, err.message);
      reconnect();
    });
    client.on('notification', (msg) => {
      try {
        onPayload(JSON.parse(msg.payload));
      } catch (err) {
        console.error(`[listen:${channel}] bad payload`, err);
      }
    });

    try {
      await client.connect();
      await client.query(`LISTEN ${channel}`);
      retryMs = 1000;
      console.log(`[listen:${channel}] ready`);
    } catch (err) {
      console.error(`[listen:${channel}] connect failed:`, err.message);
      reconnect();
    }
  };

  connect();
}
