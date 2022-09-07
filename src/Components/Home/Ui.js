import { FiPlusCircle } from "react-icons/fi";
import classes from "./Ui.module.css";
import React, { useEffect } from "react";
import { useState } from "react";
import Modal from "../Modal/Modal";
import { db } from "../../firebase_config.js";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import Card from "../Card2/Card";
import { async } from "@firebase/util";

const Ui = () => {
  const [openModal, setOpenModal] = useState(false);
  const [localArr, setLocalArr] = useState([]);

  const noteCollectionRef = collection(db, "userNotes");

  const updateLocalArr = (title, body, pinned, id) => {
    setLocalArr((prev) => [...prev, { title, body, pinned, id }]);
  };
  const pinCardHandler=async(id,pinnedStatus)=>{
    console.log(id)
    setLocalArr((prev=>{
      const local=[...prev];
      for(let i=0;i<local.length;i++){
        if(local[i].id===id && pinnedStatus){
         const note= local.splice(i,1)[0];
         note.pinnedStatus=pinnedStatus;
         console.log(note)
         local.splice(0,0,note);
        }
      }
      console.log(local)
      return local
    }))
    const noteDoc=doc(db,"userNotes",id);
    const newField={pinned:pinnedStatus};
    await updateDoc(noteDoc,newField)
  }

  const deleteCardHandler = async (id) => {
    setLocalArr((prev) => {
      const local = [...prev];
      for (let i = 0; i < local.length; i++) {
  
        if (local[i].id === id) {
          local.splice(i, 1);
        }
      }
      return local;
    });
    const noteDoc = doc(db, "userNotes", id);
    await deleteDoc(noteDoc);
  };

  useEffect(() => {
    const getNotes = async () => {
      const data = await getDocs(noteCollectionRef);
      const response = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const local=[...response];
      for(let i=0;i<response.length;i++){
        if(local[i].pinned===true){
          const pinnedNote=local.splice(i,1)[0];
          local.splice(0,0,pinnedNote);
        }
      }
      setLocalArr(local);
    };
    getNotes();
  }, []);

  const noteTiles = localArr.map((item) => (
    <Card
      title={item.title}
      body={item.body}
      id={item.id}
      key={item.id}
      pinnedStatus={item.pinned}
      delete={deleteCardHandler}
      pinCardHandler={pinCardHandler}
    />
  ));

  return (
    <div className={classes.ui__screen}>
      <div className={classes.ui__heading}>
        <text className={classes.ui__title}>Note taking App</text>
      </div>
      <span className={classes.ui__render}>
        <div className={classes.ui__tiles}>{noteTiles}</div>
      </span>
      <div className={classes.ui__addButton} onClick={() => setOpenModal(true)}>
        <span>
          <FiPlusCircle />
        </span>
      </div>
      {openModal && (
        <Modal closeModal={setOpenModal} addNote={updateLocalArr} />
      )}
    </div>
  );
};

export default Ui;
