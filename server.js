const express = require('express');
const WebSocket = require('ws');
const app = express();
const wss = new WebSocket.Server({ noServer: true });

// Statički fajlovi (ako ih imate u 'public' folderu)
app.use(express.static('public')); // Public folder za vaše statičke fajlove

// Kada se nova veza uspostavi
wss.on('connection', function connection(ws) {
  console.log("New WebSocket connection established."); // Log kada se klijent poveže

  ws.on('message', function incoming(message) {
    console.log("Received message from client:", message); // Log kada se primi poruka od klijenta

    // Prosljeđivanje poruke svim povezanim klijentima
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log("Sending message to client."); // Log pre nego što šaljemo poruku klijentima
        client.send(message);
      }
    });
  });

  ws.on('close', function() {
    console.log("WebSocket connection closed."); // Log kada se konekcija zatvori
  });

  ws.on('error', function(err) {
    console.error("WebSocket error:", err); // Log za greške u WebSocket konekciji
  });
});

// Server pokrećemo sa portom koji dodeljuje Render
const PORT = process.env.PORT || 3000; // Ako nije dodeljen PORT, koristi 3000
app.server = app.listen(PORT, function() {
  console.log(`Server started on http://localhost:${PORT}`); // Log kada server počne da radi
});

// Postavljanje WebSocket konekcije
app.server.on('upgrade', function(request, socket, head) {
  console.log("Upgrade request received."); // Log kada se dobije WebSocket upgrade zahtev
  wss.handleUpgrade(request, socket, head, function done(ws) {
    console.log("WebSocket connection upgraded."); // Log nakon što je WebSocket upgrade uspešan
    wss.emit('connection', ws, request);
  });
});
