const path = require("path");
const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

let locked = false;
let winner = "";
let scoreA = 0;
let scoreB = 0;

// مهم جدًا: يخلي Vercel يقرأ ملفات HTML
app.use(express.static(path.join(__dirname)));

io.on("connection", (socket) => {

    socket.on("press", (team) => {
        if (!locked) {
            locked = true;
            winner = team;
            io.emit("winner", team);
        }
    });

    socket.on("reset", () => {
        locked = false;
        winner = "";
        io.emit("resetAll");
    });

    socket.on("mystery", (prize) => {
        io.emit("mysteryResult", prize);
    });

    socket.on("addPoint", (team) => {
        if (team === "A") scoreA++;
        else scoreB++;
        io.emit("scoreUpdate", { A: scoreA, B: scoreB });
    });

    socket.on("removePoint", (team) => {
        if (team === "A" && scoreA > 0) scoreA--;
        if (team === "B" && scoreB > 0) scoreB--;
        io.emit("scoreUpdate", { A: scoreA, B: scoreB });
    });
});

// تشغيل السيرفر داخل Vercel
const PORT = process.env.PORT || 2000;
http.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
