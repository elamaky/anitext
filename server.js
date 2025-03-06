const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Uvezi socket.io

const app = express();
const server = http.createServer(app); // Koristi HTTP server za express
const io = socketIo(server); // Poveži express sa socket.io

let activeTexts = []; // Niz za čuvanje aktivnih tekstova

// Statički fajlovi (ako ih imate u 'public' folderu)
app.use(express.static('public')); // Public folder za vaše statičke fajlove

// Kada se nova veza uspostavi
io.on('connection', (socket) => {
  console.log('A user connected'); // Ispisuj u konzolu kad se neko poveže

  // Pošaljite samo aktuelne tekstove novom korisniku
  socket.emit('current-texts', activeTexts);

  // Kada server primi poruku od klijenta (novi tekst)
  socket.on('new-text', (data) => {
    activeTexts.push(data); // Dodajte novi tekst u niz
    io.emit('new-text', data); // Emitujte novi tekst svim povezanim klijentima
  });

  // Kada korisnik pošalje zahtev za brisanje teksta
  socket.on('delete-text', (index) => {
    // Uklonite tekst iz niza
    activeTexts.splice(index, 1); 
    io.emit('delete-text', index); // Emitujte obaveštenje svim klijentima da obrišu tekst
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
