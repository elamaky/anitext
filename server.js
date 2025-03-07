// Uvozimo potrebne module
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Kreiramo aplikaciju koristeći express
const app = express();

// Kreiramo server
const server = http.createServer(app);

// Inicijalizujemo Socket.io sa serverom
const io = socketIo(server);

// Podesavamo port na kojem će server slušati (ako port 3000 nije slobodan, koristiće se bilo koji drugi port)
const PORT = process.env.PORT || 3000;

// Poslužitelj za statičke fajlove (ako koristiš HTML, CSS, JS u posebnoj fascikli)
app.use(express.static('public'));

// Kada se neko poveže na server putem socket-a
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Kada klijent pošalje novi tekst
    socket.on('textElement', (data) => {
        console.log("Received text element:", data);
        // Emitujemo sve povezane klijente sa novim tekstom
        socket.broadcast.emit('textElement', data); // Emitujemo svim klijentima osim trenutnog
    });

    // Kada klijent pošalje zahtev za brisanje teksta
    socket.on('removeText', (elementId) => {
        console.log("Removing text with id:", elementId);
        // Emitujemo svim klijentima da uklone tekst
        socket.broadcast.emit('removeText', elementId);
    });

    // Kada klijent prekine vezu
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Startujemo server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
