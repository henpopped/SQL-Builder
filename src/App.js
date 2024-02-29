import React from 'react';
import './App.css';
import QueryBuilder from './components/QueryBuilder/QueryBuilder';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the SQL Query Builder</h1>
      </header>
      <QueryBuilder />
    </div>
  );
}

export default App;
