import { io } from "socket.io-client";
import React, { useEffect,useState } from "react";
import { useParams } from "react-router-dom"; // React DOM Version 5

function TextEditor() {

  const { id: doc_id } = useParams();
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socket_io = io("http://localhost:4000");
    setSocket(socket_io);
    return () => {
      socket_io.disconnect();
    };
  }, []);


  return <div>Hi</div>;
}

export default TextEditor;
