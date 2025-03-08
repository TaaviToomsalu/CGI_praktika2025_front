import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [suggestedSeat, setSuggestedSeat] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [numSeats, setNumSeats] = useState(1);

  useEffect(() => {
    axios.get('http://localhost:8080/flights')
      .then(response => {
        setFlights(response.data);
      }) 
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }, []);

  const fetchFilteredFlights = () => {
    const params = new URLSearchParams();

    if (destination) params.append('destination', destination);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    axios.get(`http://localhost:8080/flights?${params.toString()}`)
      .then(response => {
        setFlights(response.data);
      })
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  };

  const handleNumSeatsChange = (e) => {
    setNumSeats(Number(e.target.value));
  };

  const fetchSeats = (flightId) => {
    setSelectedFlight(flightId);
    setSelectedSeats([]); // Tühjenda valitud istekohad
    axios.get(`http://localhost:8080/seats/${flightId}`)
      .then(response => {
        // console.log("Received seats data:", response.data);
        setSeats(response.data);
      })
      .catch(error => {
        console.error('Error fetching seats:', error);
      });
  };

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prevSelected) => {
      const updatedSeats = prevSelected.includes(seatId) 
        ? prevSelected.filter(id => id !== seatId) 
        : [...prevSelected, seatId];

      return updatedSeats;
    });
  };

  const filterSeats = () => {
    if (preferences.length === 0) {
      // Kui eelistusi pole, siis tagastame kõik istmed
      return seats;
    }
  
    return seats.filter(seat => {
      // Kui seatTypes on massiiv, siis kontrollime, kas kõik eelistused on seal olemas
      if (seat.seatTypes) {
        // Kontrollime, kas kõik preferences sisaldavad seatTypes
        return preferences.every(pref => seat.seatTypes.includes(pref));
      }
      return false;
    });
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
      setSelectedSeats([]); // Tühjenda valikud peale kinnitamist
    })
    .catch(error => {
      console.error("Error reserving seats:", error);
    });
  };

  const handlePreferenceChange = (preference) => {
    setPreferences((prevPreferences) => {
      if (prevPreferences.includes(preference)) {
        return prevPreferences.filter((pref) => pref !== preference);
      } else {
        return [...prevPreferences, preference];
      }
    });
  };

  
  
  
  

  const suggestSeats = () => {
    if (selectedFlight && preferences.length > 0) {
      axios.get(`http://localhost:8080/seats/${selectedFlight}/suggest?preferences=${preferences.join(',')}`)
        .then(response => {
          if (response.data && response.data.length > 0) {
            setSuggestedSeat(response.data);
          } else {
            setSuggestedSeat(null);
          }
        })
        .catch(error => {
          console.error('Error suggesting seats:', error);
        });
    } else {
      alert("Please select preferences first!");
    }
  };




  return (
    <div>
      <h1>Available Flights</h1>
      <div>
        <input
          type="text"
          placeholder='Destination'
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          type='number'
          placeholder='Max Price'
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type='datetime-local'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type='datetime-local'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchFilteredFlights}>Search</button>
      </div>
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

      {/* Istmete arvu määramise sisend */}
      {selectedFlight && (
        <div>
          <h2>Number of Seats</h2>
          <input
            type="number"
            value={numSeats}
            min="1"
            onChange={handleNumSeatsChange}
            placeholder="Enter number of seats"
          />
        </div>
      )}

      {/* Kui istmete arv on määratud, kuvatakse istmete valik */}
      {selectedFlight && numSeats > 0 && (
        <div>
          <h2>Seats for Flight {selectedFlight}</h2>
          
          <div>
            <h3>Filter Seats by Preferences:</h3>
            {['window', 'extra_legroom', 'near_exit'].map(pref => (
              <label key={pref}>
                <input
                  type="checkbox"
                  value={pref}
                  checked={preferences.includes(pref)}
                  onChange={() => handlePreferenceChange(pref)}
                />
                {pref.charAt(0).toUpperCase() + pref.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
              </label>
            ))}
          </div>

          {suggestedSeat && (
            <p>Suggested Seat: {suggestedSeat.seatNumber} ({suggestedSeat.seatType})</p>
          )}
          <ul>
            {filterSeats().map(seat => (
              <li key={seat.id}>
                <input
                  type="checkbox"
                  disabled={seat.occupied}
                  checked={selectedSeats.includes(seat.id)}
                  onChange={() => toggleSeatSelection(seat.id)}
                />
                Seat {seat.seatNumber} - {seat.occupied ? "Occupied" : "Available"} 
                ({seat.seatTypes ? seat.seatTypes.join(", ") : "No seat type"})
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
