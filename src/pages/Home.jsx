import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seats, setSeats] = useState([]);


  useEffect(() => {
    axios.get('http://localhost:8080/flights')
      .then(response => {
        console.log("Flights from API:", response.data);
        setFlights(response.data);
      })
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }, []);

  const fetchSeats = (flightId) => {
    setSelectedFlight(flightId);
    axios.get(`http://localhost:8080/seats/${flightId}`)
      .then(response => {
        setSeats(response.data);
      })
      .catch(error => {
        console.error('Error fetching seats:', error);
      });
  };

  const reserveSeat = (seatId) => {
    axios.put(`http://localhost:8080/seats/${seatId}/reserve`)
      .then(() => {
        // Uuendame istmete olekut pärast broneerimist
        setSeats(seats.map(seat =>
          seat.id === seatId ? { ...seat, occupied: true } : seat
        ));
      })
      .catch(error => {
        console.error('Error reserving seat:', error);
      });
  };


  return (
    <div>
      <h1>Available Flights</h1>
      <ul>
        {flights.map(flight => (
          <li key={flight.id}>
            <strong>{flight.destination}</strong> - {new Date(flight.departureTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} - {flight.price}€
            <button onClick={() => fetchSeats(flight.id)}>
              View Seats
            </button>
          </li>
        ))}
      </ul>

      {selectedFlight && (
        <div>
          <h2>Seats for Flight {selectedFlight}</h2>
          <ul>
            {seats.map(seat => (
              <li key={seat.id}>
                Seat {seat.seatNumber} - {seat.occupied ? 'Occupied' : 'Available'} ({seat.seatType})
                {!seat.occupied && (
                  <button onClick={() => reserveSeat(seat.id)}>
                    Reserve
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;