const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Running");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });
  socket.on("end", (peerID) => {
    io.to(peerID).emit("refresh");
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ peerID, signalData, from, name }) => {
    socket.emit("callMade", peerID);
    io.to(peerID).emit("receiveCall", { from, name, signal: signalData });
  });

  socket.on("answerCall", (data) => {
    io.to(data.peerID).emit("callAccepted", {
      signal: data.signal,
      peerID: data.from,
      name: data.name,
    });
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
