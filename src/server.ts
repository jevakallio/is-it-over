import type * as Party from "partykit/server";
import { rateLimit } from "./limiter";

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  options: Party.ServerOptions = { hibernate: true };

  // optimistic start :)
  over = false;

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    conn.send(JSON.stringify({ over: this.over }));
  }

  onMessage(message: string, sender: Party.Connection) {
    rateLimit(sender, 120, () => {
      try {
        const { over } = JSON.parse(message);
        if (typeof over === "boolean") {
          this.over = over;
          this.party.broadcast(JSON.stringify({ over, sender: sender.id }));
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}

Server satisfies Party.Worker;
