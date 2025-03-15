import React from "react";

const SeatMap = ({ seats, selectedSeats, onSelectSeat, suggestedSeats }) => {
    // console.log("Seats data:", seats);
    if (!seats || seats.length === 0) {
        return <div>No seats available.</div>;
    }

    const seatConfig = {
        FIRST: "ABCD",
        BUSINESS: "ABCDEFG",
        ECONOMY: "ABCDEFGH"
    };

    return (
        <div className="seat-map">
            {/*console.log("Rendering seat map for classes:", [...new Set(seats.map(seat => seat.classType))])*/}
            {[...new Set(seats.map(seat => seat.classType))].map(classType => {
                const filteredSeats = seats.filter(seat => seat.classType === classType);
                //console.log(`Seats in ${classType} class:`, filteredSeats);

                const rows = filteredSeats.reduce((acc, seat) => {
                    const rowMatch = seat.seatNumber.match(/^\d+/);
                    if (!rowMatch) return acc;
                    const row = rowMatch[0];

                    if (!acc[row]) acc[row] = [];
                    acc[row].push(seat);
                    return acc;
                }, {});

                return (
                    <div key={classType || "unknown"} className={`seat-section ${classType?.toLowerCase() || ""}`}>
                        <h2>{classType} Class</h2>
                        {/*console.log(`Rows in ${classType} class:`, rows)*/}
                        {Object.entries(rows).map(([rowNumber, rowSeats]) => (
                            <div key={rowNumber} className="row">
                                {(seatConfig[classType] || "").split("").map(letter => {
                                    const seat = rowSeats.find(s => s.seatNumber.endsWith(letter));
                                    if (!seat) return <div key={letter} className="seat empty" />;

                                    const isSelected = selectedSeats.includes(seat.seatNumber);
                                    const isOccupied = seat.occupied;
                                    const isRecommended = suggestedSeats.some(s => s.seatNumber === seat.seatNumber);

                                    return (
                                        <div
                                            key={seat.seatNumber}
                                            className={`seat 
                                                        ${isSelected ? "selected" : ""} 
                                                        ${isOccupied ? "occupied" : ""} 
                                                        ${isRecommended ? "recommended" : ""}`}
                                            onClick={() => !isOccupied && onSelectSeat(seat.seatNumber)}
                                            style={{ cursor: isOccupied ? "not-allowed" : "pointer" }}
                                        >
                                            {seat.seatNumber}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default SeatMap;
