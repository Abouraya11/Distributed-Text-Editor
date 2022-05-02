const mongoose = require("mongoose");
const File = require("./file");
const port = 4000;

const dbURI =
  "mongodb://dist:dist123@cluster0-shard-00-00.aldhx.mongodb.net:27017,cluster0-shard-00-01.aldhx.mongodb.net:27017,cluster0-shard-00-02.aldhx.mongodb.net:27017/files?ssl=true&replicaSet=atlas-rtgjl1-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const socket_io = require("socket.io")(4000, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
});

socket_io.on("connection", (socket) => {
  socket.on("retrieve_document", async (documentId) => {
    const document = await document_managment(documentId);
    socket.emit("request_document", document.data_entry);
  });
});



async function document_managment(file_id) {
  return "aaa"
}