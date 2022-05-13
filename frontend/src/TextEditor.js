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
    // To make sure that socket and quill are already created before entering this useeffect
    if (socket && quill) {
      //Event listener when receiving changes from server to update quill contents
      socket.on("update_content", (updates) => {
        quill.updateContents(updates);
      });
    //Event listener when text changes, to send it to the server to update other clients and database

    quill.on("text-change", (updates, oldupdates, source) => {
      // * Only track changes that the user made and discard the APIs changes
      if (source !== "user") return;

      // Send data to the server
      socket.emit("broadcast_updates", updates);
    });

    return () => {
      socket.off("update_content");
      quill.off("text-change");
    };
  }
}, [socket, quill]);
  
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

  useEffect(() => {
    //Make sure that there is a socket that is created before entering in this useEffect
    if(socket) {
      setInterval(() => {
        //create a socket event that is called "check-users" to send data and sending with it the document id that we are in.
        socket.emit|("check-users", doc_id);

        //socket.on listens to a specific event called "no_users" and gets the users number from the server side then will access the frontend part that is having
        //the id users and will make its textContent equal to the number of users to show it in the UI
        socket.on("no_users", (users) => {
          document.getElementById("user").textContent = users;
        });
        //setting the interval with 500ms for making the users numbers update each half second.
      }, 500);
    }
    //Make useEffect work on any change on the nymber of users or the socket.
  }, [no_of_users, socket])

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

// New Document button handle to generate new document in new tab
  const new_doc = () => {
    const win = window.open(`/documents/${uuidV4()}`, "_blank");
    win.focus();
  };

  return (
    <div>
      <button className="button" onClick={new_doc}>
        New Document
      </button>

      <br /> 
      <br />
      <button>Load Document</button>

      <span className="users">Number of active users: </span>
      <span id="user" className="users">
        Loading...
      </span>
      <div id="container" ref={wrapper_handler}></div>
    </div>
  );
}

export default TextEditor;
