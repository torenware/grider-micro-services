import nats, { Stan } from 'node-nats-streaming';

class NATSWrapper {
  // Tell TS that it's going to be awhile
  // where _client is null.
  private _client?: Stan;

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this._client!.on('connect', () => {
        console.log(
          `Publisher ${clientId} connected to NATS cluster ${clusterId}`
        );
        resolve();
      });

      this._client?.on('error', (err) => {
        reject(err);
      });
    });
  }

  get client() {
    if (!this._client) {
      throw new Error('NATS client is not yet initialized');
    }
    return this._client!;
  }
}

const natsWrapper = new NATSWrapper();

export { natsWrapper };
