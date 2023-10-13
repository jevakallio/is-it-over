import "./styles.css";

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

// A PartySocket is like a WebSocket, except it's a bit more magical.
// It handles reconnection logic, buffering messages while it's offline, and more.
const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "is-it-over",
});

const toggle = document.getElementById("toggle");
let itwasme = false;

console.log("toggle", toggle);

conn.addEventListener("message", (e) => {
  const message = JSON.parse(e.data);
  console.log("receive", message.over, "from", itwasme ? "me" : "them");
  if ("over" in message) {
    itwasme = message.sender === conn.id;
    (toggle as any).checked = message.over;
  }
});

toggle?.addEventListener("click", (e) => {
  const over = (e.target as any)?.checked;
  console.log("send", over);
  conn.send(JSON.stringify({ over }));
});
