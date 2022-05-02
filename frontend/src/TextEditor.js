import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // React DOM Version 5

function TextEditor() {
  const { id: doc_id } = useParams();
  const [socket, setSocket] = useState();

  useEffect(() => {
    // to resolve cors credentials problem (access-control-allow-origin)
    // Request to server of port 4000
    const socket_io = io("http://localhost:4000", {
      transports: ["websocket", "polling", "flashsocket"],
    });
    setSocket(socket_io);
    return () => {
      socket_io.disconnect();
    };
  }, []);

  return <div>Hi</div>;
}

export default TextEditor;
