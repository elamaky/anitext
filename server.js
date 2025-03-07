const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Kreiramo aplikaciju koristeći express
const app = express();

// Kreiramo server
const server = http.createServer(app);

// Inicijalizujemo Socket.io sa serverom
const io = socketIo(server);

// Podesavamo port na kojem će server slušati
const PORT = process.env.PORT || 3000;

// Poslužitelj za statičke fajlove
app.use(express.static('public'));

// Držimo sve tekstualne elemente i njihove pozicije
let textElements = []; // Ovo je niz objekata sa podacima o tekstu i poziciji

// Kada se neko poveže na server putem socket-a
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Pošaljemo trenutne tekstualne elemente kada se klijent poveže
    socket.emit('allTextElements', textElements);

    // Kada klijent pošalje novi tekst
    socket.on('textElement', (data) => {
        console.log("Received text element:", data);

        // Dodajemo novi tekst element u array
        const newTextElement = { 
            ...data, 
            id: socket.id + '-' + Date.now(), // Unikatan ID elementa
            left: "0px",  // Početna pozicija, možeš promeniti po potrebi
            top: "0px" 
        };
        textElements.push(newTextElement);

        // Emitujemo svim povezanim klijentima sa novim tekstom
        socket.broadcast.emit('textElement', newTextElement); // Emitujemo svim klijentima osim trenutnog
    });

    // Kada klijent pošalje zahtev za brisanje teksta
    socket.on('removeText', (elementId) => {
        console.log("Removing text with id:", elementId);

        // Uklanjamo tekst sa servera
        textElements = textElements.filter(element => element.id !== elementId);

        // Emitujemo svim klijentima da uklone tekst
        socket.broadcast.emit('removeText', elementId);
    });

    // Kada klijent pošalje poziciju teksta
    socket.on('updatePosition', (data) => {
        // Logujemo samo poslednju poziciju
        console.log("Updated position for text id:", data.id, "New position:", data);

        // Ažuriramo poziciju teksta na serveru
        const textElement = textElements.find(element => element.id === data.id);
        if (textElement) {
            textElement.left = data.left;
            textElement.top = data.top;
        }

        // Emitujemo svim klijentima novu poziciju teksta
        socket.broadcast.emit('updatePosition', data);
    });

    // Kada klijent prekine vezu
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Uklanjamo sve tekstualne elemente tog klijenta
        textElements = textElements.filter(element => !element.id.startsWith(socket.id));

        // Emitujemo svim klijentima da uklone te tekstove
        socket.broadcast.emit('removeText', socket.id); // Poslati id klijenta koji je isključen
    });
});

// Startujemo server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
