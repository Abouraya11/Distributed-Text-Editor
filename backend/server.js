/*
 * Important requires
 */

// For database
const mongoose = require("mongoose");
// Requre schema for file
const File = require("./file");
// For caching
const redis = require("redis")


// Creating client for caching
const client = redis.createClient({
  host:'redis-11795.c52.us-east-1-4.ec2.cloud.redislabs.com',
  port: '11795',
  password: 'nPoYMdG5CgNLl1Bs3rFtqgD1JHIry08U'
})


/*
 * Database connection
 */
const dbURI =
  "mongodb://dist:dist123@cluster0-shard-00-00.aldhx.mongodb.net:27017,cluster0-shard-00-01.aldhx.mongodb.net:27017,cluster0-shard-00-02.aldhx.mongodb.net:27017/files?ssl=true&replicaSet=atlas-rtgjl1-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/*
 * To accept receiving messages on port 4000, and reveive messages from port 3000 (frontend) and accept from it GET and POST methods
 */
// First Parameter is the port needed to run ourcode (Server:4000)
// use cors to allow communication of two different urls (clients,servers)
const socket_io = require("socket.io")(4000, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
});

//Every time the client connects it and gives a socket which allow to communicate back to client
socket_io.on("connection", (socket) => {
  // If frontend wants to get document, first check whether the id entered is already saved to the database or create new one
  // Then joins all the sockets that have the same document id
  socket.on("retrieve_document", async (documentId) => {
    const document = await document_managment(documentId);
    socket.join(documentId);

    // Save data to cache
    client.setex(documentId, 1000, JSON.stringify({_id: document._id, data_entry: document.data_entry }));

    // Socket.on listens to a specific event called "check-users"  and collest the documentID
    socket.on("check-users", async(documentId) => {
      //creating const num that access the socket with the documentID using socket_io.in and then gets all the sockets in it using fetchSockets
      //and getting the length of it to get the nu ber of users with this specific id.
      const num = (await socket_io.in(documentId).fetchSockets()).length;
      //socket.emit creates a socket event that is called "no_users" and then sends the num (number of users) that is created in the previous line.
      socket.emit("no_users", num);
    });

    socket.emit("request_document", document.data_entry);
   // broadcasting a message to everyone with the updates except the requesting client
    socket.on("broadcast_updates", (delta) => {
      socket.broadcast.to(documentId).emit("update_content", delta);
    });

    // Save changes to database
    socket.on("push-changes-db", async (data_entry) => {
      await File.findByIdAndUpdate(documentId, { data_entry });
    });
  });
});

/*
 * This function is called to check whether the specified id exists or not, if yes return the document else create a new document
 */
async function document_managment(file_id) {
  if (file_id == null) return;

  var cached = false;
  // Get data from cache if exists
  client.get(file_id, function (err, data) {
    if (data) {
      cached = true;
      return { _id: file_id, data_entry: data };
    } else {
      cached = false;
    }
  });
  if (!cached) {
    const document = await File.findById(file_id);
    if (document) return document;
    return await File.create({ _id: file_id, data_entry: "" });
  }
}
