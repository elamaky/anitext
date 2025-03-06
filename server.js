const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Uvezi socket.io

const app = express();
const server = http.createServer(app); // Koristi HTTP server za express
const io = socketIo(server); // Poveži express sa socket.io

// Statički fajlovi (ako ih imate u 'public' folderu)
app.use(express.static('public')); // Public folder za vaše statičke fajlove

// Kada se nova veza uspostavi
io.on('connection', (socket) => {
  console.log('A user connected'); // Ispisuj u konzolu kad se neko poveže

  // Kada server primi poruku od klijenta
  socket.on('new-text', (data) => {
    // Prosledi poruku svim povezanim klijentima
    io.emit('new-text', data); // Emituj podatke svim korisnicima
  });

  // Kada korisnik odspoji
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Server pokrećemo sa portom koji dodeljuje Render
const PORT = process.env.PORT || 3000; // Ako nije dodeljen PORT, koristi 3000
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
