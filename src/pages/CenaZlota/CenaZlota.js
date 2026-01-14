import React, { useState, useEffect } from 'react';
import './CenaZlota.css';

export default function CenaZlota() {
  const [count, setCount] = useState(10);
  const [goldPrices, setGoldPrices] = useState([]);
  const [allGoldPrices, setAllGoldPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoldPrices = async () => {
      if (allGoldPrices.length >= count) {
        setGoldPrices(allGoldPrices.slice(allGoldPrices.length - count, allGoldPrices.length));
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://api.nbp.pl/api/cenyzlota/last/${count}`);
        const data = await response.json();
        setAllGoldPrices(data);
        setGoldPrices(data);
        setError(null);
      } catch (err) {
        setError('Nie udało się pobrać ceny złota');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (count > 0) {
      fetchGoldPrices();
    }
  }, [count, allGoldPrices]);

  const handleCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 || e.target.value === '') {
      setCount(value || 10);
    }
  };

  return (
    <div className="page-content">
      <h1>Cena Złota</h1>
      
      <div className="inputs">
        <label>
          Liczba notowań: 
          <input 
            type="number" 
            min="1"
            value={count}
            onChange={handleCountChange}
          />
        </label>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {goldPrices.length > 0 && (
        <table border="1">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cena (PLN/g)</th>
            </tr>
          </thead>
          <tbody>
            {goldPrices.slice().reverse().map((item, index) => (
              <tr key={index}>
                <td>{item.data}</td>
                <td>{item.cena.toFixed(2)} PLN</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {loading && <p>Ładowanie danych...</p>}
    </div>
  );
}
