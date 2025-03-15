import { useState, useEffect } from 'react';
import axios from 'axios';
import SeatMap from '../components/SeatMap';
import FlightFilter from "../components/FlightFilter";

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
  const [seatClass, setSeatClass] = useState("economy");
  const [preferences, setPreferences] = useState([]);
  const [numSeats, setNumSeats] = useState(1);
  const [adjacentSeats, setAdjacentSeats] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);


  useEffect(() => {
    axios.get('http://localhost:8080/flights/')
      .then(response => {
        setFlights(response.data);
      }) 
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }, []);

  
  const fetchFilteredFlights = () => {
    //console.log("Fetching filtered flights...");
    //console.log("Destination value before fetch:", destination);

    const params = new URLSearchParams();
    if (destination) params.append('destination', destination);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (seatClass) params.append("seatClass", seatClass);

    axios.get(`http://localhost:8080/flights/filter?${params.toString()}`)
      .then(response => {
        setFlights(response.data);
        //console.log("Filtreeritud lend", response.data);
      })
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }; 


  const fetchSeats = (flightId, seatClass) => {

    console.log("Sent class: ", seatClass);

    setSelectedClass(seatClass);
    
    axios.get(`http://localhost:8080/seats/${flightId}?class=${seatClass}`)
      .then(response => {
        console.log("Saadud istmed:", response.data);
        setSeats(response.data);
      })
      .catch(error => {
        console.error('Error fetching seats:', error);
      });
  };

  const handleClassSelection = (seatClass) => {
    setSelectedClass(seatClass);
    if (selectedFlight) {
      fetchSeats(selectedFlight, seatClass);
    }
  };
  

  const handleNumSeatsChange = (e) => {
    setNumSeats(Number(e.target.value));
  };


  const handleAdjacentSeatsChange = (e) => {
    setAdjacentSeats(prev => !prev);
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
      setSeats(prevSeats => {
        const updatedSeats = prevSeats.map(seat => {
          if (selectedSeats.includes(seat.seatNumber)) {
            return { ...seat, occupied: true };
          }
          return seat;
        });
        return updatedSeats;
      });
      setSelectedSeats([]);
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
      if (!selectedFlight) {
        console.error("Missing selected flight ID.");
        return;
      }

      const requestData = {
        flightId: selectedFlight,
        numSeats: numSeats,
        preferences: preferences.join(','),
        requireAdjacent: adjacentSeats
      };

      axios.get(`http://localhost:8080/seats/${selectedFlight}/suggest`, {
        params: requestData
      })
        .then(response => {
          if (response.data && response.data.length > 0) {
            //console.log("Full API response:", response);
            setSuggestedSeats(response.data || []);
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

  /*
  useEffect(() => {
    console.log("Selected Flight:", selectedFlight);
  }, [selectedFlight]);
  */



  return (
    <div>
      <h1>Flight App</h1>
      
      <FlightFilter
        destination={destination}
        setDestination={setDestination}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        seatClass={seatClass}
        setSeatClass={setSeatClass}
        fetchFilteredFlights={fetchFilteredFlights}
      />


      {/* Saadaval olevate lendude kuvamine */}
      <h3>Select a Flight</h3>
      {flights.map((flight) => (
        <div key={flight.id}>
          <label>
            <input 
              type="radio" 
              name="selectedFlight" 
              value={flight.id} 
              checked={selectedFlight === flight.id} 
              onChange={() => setSelectedFlight(flight.id)}
            />
            <strong>{flight.destination}</strong> - {new Date(flight.departureTime).toLocaleString('en-GB', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}
          </label>
        </div>
      ))}

      
      {selectedFlight && (
        <div>
          <h2>Choose Seat Class</h2>
          {["Economy", "Business", "First"].map((cls) => {
            let price = 0;
            let info = "";

            const selectedFlightData = flights.find(f => f.id === selectedFlight);
            if (!selectedFlightData) return null;

            if (cls === "Economy") {
              price = selectedFlightData.economyPrice;
              info = "Basic ticket, no extras included.";
            } else if (cls === "Business") {
              price = selectedFlightData.businessPrice;
              info = "More space, priority boarding.";
            } else if (cls === "First") {
              price = selectedFlightData.firstClassPrice;
              info = "Luxury seating, premium service.";
            }

            return (
              <div key={cls}>
                <label>
                <input 
                  type="radio" 
                  name="seatClass" 
                  value={cls} 
                  checked={selectedClass === cls} 
                  onChange={(e) => handleClassSelection(e.target.value)} 
                />
                  {cls} - {price} €
                </label>
                <p style={{ fontSize: "14px", color: "#555", marginLeft: "20px" }}>{info}</p>
              </div>
            );
          })}
        </div>
      )}



      {/* Istmete arvu määramise sisend */}
      {selectedFlight && selectedClass && (
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
        {selectedFlight && selectedClass && numSeats > 0 && (
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
