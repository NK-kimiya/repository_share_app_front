import React, { useState,useEffect } from 'react';
import './App.css';
import './css/Login.css'
import './css/Nav.css'
import './css/Room.css'
import './css/Category.css';
import './css/Repository.css';
import './css/AiSearch.css';
import Nav from './components/Nav';
import Category from './components/Category';
import Repository from './components/Repository';
import RepositoryDetail from './components/RepositoryDetail';
import AiSearch from './components/AiSearch';
function App() {
  return (
 
    <div className="App">
      <Nav/>
      <div id='main-area'>
        <div id='repository-detail-area'>
          <RepositoryDetail/>
          <AiSearch/>
        </div>
        <div id='repository-list-area'>
        <Category /> 
        <Repository/>
        </div>
      </div>
    </div>
   
  );
}

export default App;


