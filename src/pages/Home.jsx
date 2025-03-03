import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [flights, setFlights] = useState([]);


  useEffect(() => {
    axios.get('http://localhost:8080/flights')
      .then(response => {
        setFlights(response.data);
      })
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }, []);



  return (
    <div>
      <h1>Available Flights</h1>
      <ul>
        {flights.map(flight => (
          <li key={flight.id}>
            <strong>{flight.destination}</strong> -  {flight.departureTime} - {flight.price}€
            <button onClick={() => console.log(`Show seats for flight ${flight.id}`)}>
              View Seats
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;