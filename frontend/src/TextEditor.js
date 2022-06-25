/*
 * Importing needed libraries
 */
import "./styles.css";
import NetInfo from '@react-native-community/netinfo';
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom"; // React DOM Version 5
import { v4 as uuidV4 } from "uuid";


function TextEditor() {
  /*
   * Using hooks
   */
  const { id: doc_id } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [no_of_users] = useState();

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
        socket.emit("check-users", doc_id);

        //socket.on listens to a specific event called "no_users" and gets the users number from the server side then will access the frontend part that is having
        //the id users and will make its textContent equal to the number of users to show it in the UI
        socket.on("no_users", (users) => {
          document.getElementById("user").textContent = users;
        });
        //setting the interval with 500ms for making the users numbers update each half second.
      }, 500);
    }
    //Make useEffect work on any change on the nymber of users or the socket.
  }, [no_of_users, socket,doc_id])


  const [isConnected, setIsConnected] = useState(false);

  // This usefffect work each time when the network connection is lost 
  //and when the internet connection is back again each time by using eventlistener
  //that listens to te network status whether connected or lost
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    
    return () => unsub();
  }, []);


const quillStatus = async () => {
quill.setText("You cannot write right now! Please wait untill Network Connection is Back then refresh your page....");

document.getElementById("user").innerHTML = "Loading";

quill.disable(); // prevent any user from typing in the editor when network connection is lost 
  }
  const quillStatus2 = async () => {
    quill.enable(); // Connection is back so allow the user to write again after making a refresh
      }
  if(!isConnected){
    quillStatus(); //Call the function quillStatus to disable quill
  }else{
    quillStatus2(); //Call the function quillStatus2 to enable quill (Connection is back!)
  }

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

  // We check that if the load document button is pressed then it will be handles by opening a new page with the document id that the user provided
  const load_doc = () => {
    
    //get the text and the docyment id that the user have written and send it open a new window with a document id as the entered one.
    const text = document.getElementById("load_txt");
    //Handling if the document id that the user entered is empty then there should be an error.
    if (text.value !== "") {
      const error = document.querySelector(".error");
      //Make the error hidden if there is no error and the id entered is correct.
      error.style.visibility = "hidden";
      const win = window.open(`/documents/${text.value}`, "_blank");
      win.focus();

      //if there is error and the field is empty then the error will be shown in the UI.
    } else {
      const error = document.querySelector(".error");
      error.style.visibility = "visible";
    }
  }

  return (
    <div>
      <button className="button" onClick={new_doc}>
        New Document
      </button>
      <span id="id_doc">{doc_id}</span>
      <br /> 
      <br />
      <button className="button" onClick={load_doc}>
        Load Document
      </button>
      <div id="all">
        <input id="load_txt" className="textbox" placeholder="Enter File ID" />
        <span className="error">Please enter a valid file ID</span>
      </div>
      <span className="users">Number of active users: </span>
      <span id="user" className="users">
        Loading...
      </span>
      <div id="container" ref={wrapper_handler}></div>
    </div>
  );
}

export default TextEditor;
