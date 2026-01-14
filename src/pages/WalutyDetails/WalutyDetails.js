import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './WalutyDetails.css';

/*

7. Szczegóły waluty.
- Dodaj nową podstronę, do której adres będzie wyglądał następująco /waluty/:waluta.
- Gdzie parametr :waluta oznacza kod waluty zgodny ze standardem ISO 4217.
- Na nowej podstronie wyświetl pełną nazwę waluty.
- Na podstronie z punktu 2 dodaj przycisk „Przejdź”, który przekieruje użytkownika do szczegółów waluty wybranej na liście wyboru.
8. Historia kursu waluty
- Rozbuduj podstronę z punktu 7 o wyświetlanie wykresu liniowego prezentującego zmianę kursu wybranej waluty w ciągu ostatnich 30 dni.
- Dane pobierz z API NBP.

*/

export default function WalutyDetails() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [currencyName, setCurrencyName] = useState('');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrencyData = async () => {
            setLoading(true);
            setError(null);

            try {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);

                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];

                const response = await fetch(
                    `https://api.nbp.pl/api/exchangerates/rates/C/${code}/${startDateStr}/${endDateStr}/?format=json`
                );

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać danych waluty');
                }

                const data = await response.json();
                setCurrencyName(data.currency);

                const formattedData = data.rates.map(rate => ({
                    data: rate.effectiveDate,
                    kurs: rate.mid || ((rate.bid + rate.ask) / 2)
                }));

                setChartData(formattedData);
            } catch (err) {
                console.error('Błąd:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchCurrencyData();
        }
    }, [code]);

    return (
        <div className="currency-details">
            <h1>Szczegóły waluty</h1>

            {loading && <p>Ładowanie...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && currencyName && (
                <div>
                    <h2>{code} - {currencyName}</h2>

                    {chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="data"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    label={{ value: 'Kurs (PLN)', angle: -90, position: 'insideLeft' }}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="kurs"
                                    stroke="#4a9eff"
                                    strokeWidth={2}
                                    name="Kurs (PLN)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}
        </div>
    );
}
