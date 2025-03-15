import React, { useState } from "react";

const FlightFilter = ({
    destination,
    setDestination,
    maxPrice,
    setMaxPrice,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    seatClass,
    setSeatClass,
    fetchFilteredFlights, 
  }) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
        <h3>Filter Flights</h3>
  
        {/* Sihtkoha valik */}
        <div>
          <label>Destination:</label>
          <input
            type="text"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
  
        {/* Istmeklassi valik */}
        <div>
          <label>Seat Class Interest:</label>
          <select value={seatClass} onChange={(e) => setSeatClass(e.target.value)}>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="firstclass">First Class</option>
          </select>
        </div>
  
        {/* Maksimaalne hind */}
        <div>
          <label>Max Price (€):</label>
          <input
            type="number"
            placeholder="Enter max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
  
        {/* Kuupäevade valik */}
        <div>
          <label>Start Date:</label>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
  
        <div>
          <label>End Date:</label>
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
  
        {/* Filtri rakendamise nupp */}
        <button onClick={fetchFilteredFlights} style={{ marginTop: "10px" }}>
          Search Flights
        </button>
      </div>
    );
  };
  
  export default FlightFilter;