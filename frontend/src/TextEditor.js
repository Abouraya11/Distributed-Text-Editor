import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useEffect, useState,useCallback } from "react";
import { useParams } from "react-router-dom"; // React DOM Version 5

function TextEditor() {
  const { id: doc_id } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

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

  const wrapper_handler = useCallback((wrapper) => {

    const container = document.createElement("div");

    wrapper.append(container);

    const q = new Quill(container, { theme: "snow" });

    wrapper.innerHtml = "";

    setQuill(q);
  }, []);

  
  return (
    <div>
      <div id="container" ref={wrapper_handler}></div>
    </div>
  );
}


export default TextEditor;
