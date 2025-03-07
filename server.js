const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let texts = []; // Skladište za sve generisane tekstove

// Služi statičke fajlove (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("Korisnik povezan:", socket.id);

    // Pošalji trenutne tekstove novom korisniku
    socket.emit("updateTexts", texts);

    // Kad korisnik doda novi tekst
    socket.on("addText", (data) => {
        texts.push(data); // Sačuvaj tekst
        io.emit("updateTexts", texts); // Pošalji svim korisnicima
    });

    // Kad korisnik pomeri tekst
    socket.on("moveText", (data) => {
        const index = texts.findIndex(t => t.id === data.id);
        if (index !== -1) {
            texts[index].position = data.position;
            io.emit("updateTexts", texts);
        }
    });

    // Kad korisnik obriše tekst
    socket.on("removeText", (id) => {
        texts = texts.filter(t => t.id !== id);
        io.emit("updateTexts", texts);
    });

    socket.on("disconnect", () => {
        console.log("Korisnik odjavljen:", socket.id);
    });
});

server.listen(3000, () => console.log("Server pokrenut na http://localhost:3000"));
