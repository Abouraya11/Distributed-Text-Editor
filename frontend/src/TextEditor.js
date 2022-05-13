/*
 * Importing needed libraries
 */
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom"; // React DOM Version 5



function TextEditor() {
  /*
   * Using hooks
   */
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

  useEffect(() => {
    // To make sure that socket and quill are already created before entering this use effect
    if (socket && quill) {
      // To first request and load the document from the server and fill up the quill with the data came from server/DB
      socket.once("request_document", (document) => {
        quill.setContents(document);
        quill.enable();
      });
      // Send to database that the following document id is needed to be returned
      socket.emit("retrieve_document", doc_id);
    }
  }, [socket, quill, doc_id]);

  // Use effect that push data to the database after each quill or socket changes each specified interval of 500 ms
  useEffect(() => {
    if (socket && quill) {
      const interval = setInterval(() => {
        socket.emit("push-changes-db", quill.getContents());
      }, 500);

      return () => {
        clearInterval(interval);
      };
    }
  }, [socket, quill]);

  /* 
   * Quill is used mainly because it allows us to do small operations one at a time instead of copying
   * and pasting the whole document every time a change is made
  */
  // This function is used to prevent reloading the quill when page is refreshed and create the quill element
  const wrapper_handler = useCallback((wrapper) => {
    const container = document.createElement("div");
    wrapper.append(container);
    const q = new Quill(container, { theme: "snow" });
    wrapper.innerHtml = "";
    setQuill(q);

    // Disable the quill until getting the right document from the server
    q.disable();
    q.setText("Please wait..");
    setQuill(q);
  }, []);

  return (
    <div>
      <button>Load Document</button>
      <div id="container" ref={wrapper_handler}></div>
    </div>
  );
}

export default TextEditor;
