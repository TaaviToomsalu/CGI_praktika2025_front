import { useState, useEffect } from 'react';
import axios from 'axios';
import SeatMap from '../components/SeatMap';

const Home = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [suggestedSeats, setSuggestedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [numSeats, setNumSeats] = useState(1);
  const [adjacentSeats, setAdjacentSeats] = useState(false);

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

  const handleAdjacentSeatsChange = (e) => {
    setAdjacentSeats(prev => !prev);
  };

  const fetchSeats = (flightId) => {
    setSelectedFlight(flightId);
    setSelectedSeats([]);
    axios.get(`http://localhost:8080/seats/${flightId}`)
      .then(response => {
        //console.log("Received seats data:", response.data);
        setSeats(response.data);
        //console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching seats:', error);
      });
  };

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prevSelected) => {
      const seat = seats.find(seat => seat.id === seatId);
  
      // Kui iste on okupeeritud, siis ei lubata valida
      if (seat && seat.occupied) return prevSelected;
  
      // If seat is already selected, remove it. Otherwise, add it (if limit is not reached).
      if (prevSelected.includes(seatId)) {
        return prevSelected.filter(id => id !== seatId);
      } else if (prevSelected.length < numSeats) {
        return [...prevSelected, seatId];
      }
      
      return prevSelected; // No changes if limit is reached
    });
  };

  const findAdjacentSeats = (availableSeats) => {
    availableSeats.sort((a, b) => a.seatNumber - b.seatNumber);
    for (let i = 0; i <= availableSeats.length - numSeats; i++) {
      const group = availableSeats.slice(i, i + numSeats);
      if (group.length === numSeats && group.every((seat, index, arr) => 
        index === 0 || seat.seatNumber === arr[index - 1].seatNumber + 1)) {
          return group;
      }
    }
    return availableSeats;
  };

  const reserveSelectedSeats = () => {
    if (selectedSeats.length !== numSeats) {
      alert(`Please select exactly ${numSeats} seats!`);
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

      console.log("Fetching suggested seats...");
      axios.get(`http://localhost:8080/seats/${selectedFlight}/suggest`, {
        params: {
          numSeats: numSeats,
          preferences: preferences.join(',')
        }
      })
        .then(response => {
          if (response.data && response.data.length > 0) {
            console.log("Full API response:", response);
            setSuggestedSeats(response.data || []);
            console.log("Suggested seats:", response.data);
          } else {
            setSuggestedSeats(null);
          }
        })
        .catch(error => {
          console.error('Error suggesting seats:', error);
        });
    } else {
      alert("Please select preferences first!");
    }
  };
  useEffect(() => {
    console.log("Updated suggestedSeats state:", suggestedSeats);
}, [suggestedSeats]);



  return (
    <div>
      <h1>Available Flights</h1>
      <div>
        <input type="text"  placeholder='Destination' value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input type='number' placeholder='Max Price' value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <input type='datetime-local' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type='datetime-local' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={fetchFilteredFlights}>Search</button>
      </div>

      {/* Saadaval olevate lendude kuvamine */}
      <ul>
        {flights.map(flight => (
          <li key={flight.id}>
            <strong>{flight.destination}</strong> - {new Date(flight.departureTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} - {flight.price}€
            <button onClick={() => fetchSeats(flight.id)}>View Seats</button>
          </li>
        ))}
      </ul>

      {/* Istmete arvu määramise sisend */}
      {selectedFlight && (
        <div>
          <p>Enter number of seats</p>
          <input type="number" value={numSeats} min="1" onChange={handleNumSeatsChange} />
          <label>
            <input type='checkbox' checked={adjacentSeats} onChange={handleAdjacentSeatsChange} />
            Adjacent Seats
          </label>


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
          <button onClick={suggestSeats}>Suggest Seat</button>

          
        </div>
      )}

      
      {/* Kui lend ja istmete arv on määratud, kuvame SeatMap'i */}
        {selectedFlight && numSeats > 0 && (
        <div>
          <h1>Lennu Isteplaan</h1>
          <SeatMap 
            seats={seats} 
            selectedSeats={selectedSeats} 
            onSelectSeat={toggleSeatSelection}
            preferences={preferences}
            suggestedSeats={suggestedSeats}
          /> 
          <button onClick={reserveSelectedSeats}>Reserve Selected Seats</button>
        </div>
        )}
    </div>
  );
};

export default Home;
