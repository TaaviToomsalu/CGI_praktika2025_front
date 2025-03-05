import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [suggestedSeat, setSuggestedSeat] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(null);


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
    setSelectedSeats([]); // ← Tühjenda valitud istekohad
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

  const suggestSeat = (flightId, preference) => {
    axios.get(`http://localhost:8080/seats/${flightId}/suggest?preference=${preference}`)
    .then(response => {
        if(response.data && response.data.seatNumber) {
          setSuggestedSeat(response.data);
        } else {
          setSuggestedSeat(null);
        }
      })
      .catch(error => {
        console.error('Error suggesting seat:', error);
      });
  };

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prevSelected) => 
      prevSelected.includes(seatId) 
        ? prevSelected.filter(id => id !== seatId)
        : [...prevSelected, seatId]
    );
  };

  const reserveSelectedSeats = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat!");
      return;
    }
  
    axios.put("http://localhost:8080/seats/reserve", {
      flightId: selectedFlight,
      seatIds: selectedSeats
    })
    .then(() => {
      setSeats(prevSeats => 
        prevSeats.map(seat =>
          selectedSeats.includes(seat.id) ? { ...seat, occupied: true } : seat
        )
      );
    })
    .catch(error => {
      console.error("Error reserving seats:", error);
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

          <button onClick={() => suggestSeat(selectedFlight, 'window')}>Suggest Window Seat</button>
          <button onClick={() => suggestSeat(selectedFlight, 'aisle')}>Suggest Aisle Seat</button>

          {suggestedSeat && (
              <p>Suggested Seat: {suggestedSeat.seatNumber} ({suggestedSeat.seatType})</p>
          )}

          <ul>
            {seats.map(seat => (
              <li key={seat.id}>
                <input
                  type="checkbox"
                  disabled={seat.occupied}  // Kui juba broneeritud, ei saa valida
                  checked={selectedSeats.includes(seat.id)}
                  onChange={() => toggleSeatSelection(seat.id)}
                />
                Seat {seat.seatNumber} - {seat.occupied ? "Occupied" : "Available"} ({seat.seatType})
              </li>
            ))}
          </ul>
          <button onClick={reserveSelectedSeats}>Reserve Selected Seats</button>
        </div>
      )}
    </div>
  );
};

export default Home;