import "./styles.css";
import PartySocket from "partysocket";
import { GO_AWAY_SENTINEL, SLOW_DOWN_SENTINEL } from "./types";

declare const PARTYKIT_HOST: string;

// A PartySocket is like a WebSocket, except it's a bit more magical.
// It handles reconnection logic, buffering messages while it's offline, and more.
const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "is-it-over-so-back",
});

const toggle = document.getElementById("toggle");
let b = false;
let itwasme = false;

conn.addEventListener("message", (e) => {
  if (e.data === SLOW_DOWN_SENTINEL) {
    return;
  }

  if (e.data === GO_AWAY_SENTINEL) {
    b = true;
    return;
  }

  const message = JSON.parse(e.data);
  if ("over" in message) {
    itwasme = message.sender === conn.id;
    (toggle as any).checked = message.over;
  }
});

toggle?.addEventListener("click", (e) => {
  const over = (e.target as any)?.checked;
  console.log("send", over);
  if (!b) {
    conn.send(JSON.stringify({ over }));
  }
});
