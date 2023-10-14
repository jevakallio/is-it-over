import "./styles.css";

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

// A PartySocket is like a WebSocket, except it's a bit more magical.
// It handles reconnection logic, buffering messages while it's offline, and more.
const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "is-it-over-with-cursors",
});

const toggle = document.querySelector(".toggle-switch");
const over = document.getElementById("over") as HTMLInputElement;
const back = document.getElementById("back") as HTMLInputElement;
let itwasme = false;

console.log("toggle", toggle);

conn.addEventListener("message", (e) => {
  const message = JSON.parse(e.data);
  console.log("receive", message.over, "from", itwasme ? "me" : "them");
  if ("over" in message) {
    itwasme = message.sender === conn.id;
    if (message.over) {
      over.checked = true;
    } else {
      back.checked = true;
    }
  }
});

// Click directly on the switch. Toggle the value.
toggle?.addEventListener("click", () => {
  console.log("send", !over.checked);
  conn.send(JSON.stringify({ over: !over.checked }));
});

// Click on label or use keyboard/screen reader to change selection.
over?.addEventListener("change", () => {
  console.log("send", over.checked);
  conn.send(JSON.stringify({ over: over.checked }));
});
