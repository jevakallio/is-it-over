import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  over = false;

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    conn.send(JSON.stringify({ over: this.over }));
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const over = JSON.parse(message).over;
      this.over = over;
      this.party.broadcast(JSON.stringify({ over, sender: sender.id }));
    } catch (e) {
      console.log(e);
    }
  }
}

Server satisfies Party.Worker;
