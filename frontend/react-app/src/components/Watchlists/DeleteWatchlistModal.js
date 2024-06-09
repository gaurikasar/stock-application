import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import closeImg from "../../css/images/close.svg";
import { fetchDeleteWatchlist } from "../../store/lists";
import "../../css/Watchlists.css"

function DeleteWatchlistModal({ setShowDeleteModal, listId }) {
  const dispatch = useDispatch();


  const handleSubmit = (e) => {


    e.preventDefault();
    dispatch(fetchDeleteWatchlist(listId))
    .then(() => setShowDeleteModal(false))
  };


  return (
    <div className="delete-form-container">
      <div className="delete-form-header">
        <div className="delete-title">Are you sure you want to delete "watchlist and your stocks"?</div>
       
      </div>
      <div className="delete-form">
       
          <button className="delete-list-submit" onClick={handleSubmit}>
            Delete
          </button>

      </div>
    </div>
  );
}

export default DeleteWatchlistModal;
