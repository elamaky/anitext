const express = require('express');
const WebSocket = require('ws');
const app = express();
const wss = new WebSocket.Server({ noServer: true });

// Statički fajlovi (ako ih imate u 'public' folderu)
app.use(express.static('public')); // Public folder za vaše statičke fajlove

// Kada se nova veza uspostavi
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // Prosljeđivanje poruke svim povezanim klijentima
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Server pokrećemo sa portom koji dodeljuje Render
const PORT = process.env.PORT || 3000; // Ako nije dodeljen PORT, koristi 3000
app.server = app.listen(PORT, function() {
  console.log(`Server started on http://localhost:${PORT}`);
});

// Postavljanje WebSocket konekcije
app.server.on('upgrade', function(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});
