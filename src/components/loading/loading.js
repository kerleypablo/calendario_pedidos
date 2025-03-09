import React from "react";
import "./loading.css";

const Loading = () => {
  return (
    <div className="loading-overlay">
      <img src="files/gifs/loading.gif" alt="Carregando..." className="loading-gif" />
    </div>
  );
};

export default Loading;
