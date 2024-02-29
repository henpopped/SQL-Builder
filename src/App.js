import React from 'react';
import './App.css';
import QueryBuilder from './components/QueryBuilder/QueryBuilder';
import Button from '@mui/material/Button';

function App() {
  const scrollToQueryBuilder = () => {
    const queryBuilderSection = document.getElementById('query-builder-section');
    queryBuilderSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the SQL Query Builder</h1>
        <Button variant="contained" color="primary" onClick={scrollToQueryBuilder}>
          Write A Query
        </Button>
      </header>
      <div id="query-builder-section">
        <QueryBuilder />
      </div>
    </div>
  );
}

export default App;
