import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Waluty.css';

/*

2. Podstrona waluty o Na podstronie /waluty wyświetl kurs wybranej waluty na dzień dzisiejszy np. USD. 
- Dane do tabeli należy pobierać z API NBP

5. Rozbudowa podstrony waluty o Dodaj listę wyboru, w której użytkownik będzie mógł wybrać dowolną walutę z tabeli A.
- Dodaj pole Data (domyślnie dzisiejsza), gdzie użytkownik będzie mógł wybrać dowolną datę.
- Zatwierdzenie formularza powinno wyświetlić kurs wybranej waluty na dany dzień.

6. Jeżeli wskazana data przypada na dzień wolny od pracy, pobierz kurs (dla zadania 5) z najbliższego poprzedzającego dnia roboczego

7. Szczegóły waluty. o Dodaj nową podstronę, do której adres będzie wyglądał następująco /waluty/:waluta.
- Gdzie parametr :waluta oznacza kod waluty zgodny ze standardem ISO 4217. 
- Na nowej podstronie wyświetl pełną nazwę waluty. o Na podstronie z punktu 2 dodaj przycisk „Przejdź”, który przekieruje użytkownika do szczegółów waluty wybranej na liście wyboru

API NBP: https://api.nbp.pl/

*/

export default function Waluty() {
  const [currencies, setCurrencies] = useState([]);
  const [currenciesDate, setCurrenciesDate] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showingDate, setShowingDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/C/?format=json');
        const data = await response.json();
        setCurrencies(data[0].rates);
      } catch (error) {
        console.error('Błąd:', error);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (!selectedCurrency || !date) return;

    const fetchCurrenciesDate = async () => {
      try {
        const searchDateStr = (showingDate ? new Date(showingDate) : new Date(date)).toISOString().split('T')[0];
        const response = await fetch(`https://api.nbp.pl/api/exchangerates/tables/C/${searchDateStr}`);
        const data = await response.json();
        console.log('Fetched currencies date data:', data);
        setCurrenciesDate(data[0]);
      } catch (error) {
        console.error('Błąd:', error);
      }
    };

    if (selectedCurrency === 'PLN') {
      setCurrencyInfo({
        code: 'PLN',
        currency: 'Polski Złoty',
        rates: [{ no: 'N/A', mid: 1.0, ask: 1.0, bid: 1.0 }]
      });
      fetchCurrenciesDate();
      setShowingDate(date);
      return;
    }

    const fetchRates = async () => {
      setLoading(true);
      try {
        let searchDate = (date > new Date().toISOString().split('T')[0]) ? new Date() : new Date(date);
        const searchDateStr = searchDate.toISOString().split('T')[0];
        const response = await fetch(
          `https://api.nbp.pl/api/exchangerates/rates/C/${selectedCurrency}/${searchDateStr}`
        );

        if (!response.ok) {
          const currentDate = new Date(date);
          let searchDate = new Date(currentDate);
          console.log("brak notowań dla podanej daty, szukamy wcześniej...");

          for (let i = 1; i <= 7; i++) {
            searchDate.setDate(searchDate.getDate() - 1);
            const searchDateStr = searchDate.toISOString().split('T')[0];
            const retryResponse = await fetch(
              `https://api.nbp.pl/api/exchangerates/rates/C/${selectedCurrency}/${searchDateStr}`
            );
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setShowingDate(searchDateStr);
              setCurrencyInfo(data);
              return;
            }
          }
          setCurrencyInfo([]);
        } else {
          const data = await response.json();
          setShowingDate(date);
          setCurrencyInfo(data);
        }
      } catch (error) {
        console.error('Błąd:', error);
        setCurrencyInfo([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    fetchCurrenciesDate();

  }, [selectedCurrency, date, showingDate]);

  const handleGoToCurrency = () => {
    if (selectedCurrency) {
      navigate(`/waluty/${selectedCurrency}`);
    }
  };

  return (
    <div className="viewContent">
      <h1>Waluty</h1>
      <div className="inputs">
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          <option value="">--Wybierz walutę--</option>
          <option value="PLN">
            PLN - Polski Złoty
          </option>
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.code} - {curr.currency}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={handleGoToCurrency}
          disabled={!selectedCurrency}
        >
          Przejdź do Waluty
        </button>
      </div>

      {loading && <p>Ładowanie...</p>}

      {showingDate && !loading && (<p>Kurs na dzień: {showingDate}</p>)}

      {currencyInfo && currencyInfo.rates && currencyInfo.rates.length > 0 && (
        <div className="currencyInfo">
          <div className="currencyDetails">
            <span className="code">{currencyInfo.code}</span>
            <span className="fulName">{currencyInfo.currency}</span>
            <div className="rates">
              {currencyInfo.rates.map(e => (
                <div key={e.no} className="rate">
                  <span className="mid">{e.mid}</span>
                </div>
              ))}
            </div>
          </div>
          {currenciesDate && currenciesDate.rates && currenciesDate.rates.length > 0 && (
            <table border="1">
              <thead>
                <tr>
                  <th>KOD</th>
                  <th>Nazwa</th>
                  <th>Zakup</th>
                  <th>Sprzedaż</th>
                </tr>
              </thead>
              <tbody>
                <tr key="PLN">
                  <td>PLN</td>
                  <td>Polski Złoty</td>
                  <td>{(currencyInfo?.rates[0]?.ask)?.toFixed(4)}</td>
                  <td>{(currencyInfo?.rates[0]?.bid)?.toFixed(4)}</td>
                </tr>
                {currenciesDate.rates.map((rate) => (
                  <tr key={rate.no}>
                    <td>{rate.code}</td>
                    <td>{rate.currency}</td>
                    <td>{(rate.bid / currencyInfo?.rates[0]?.bid)?.toFixed(4)}</td>
                    <td>{(rate.ask / currencyInfo?.rates[0]?.ask)?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
