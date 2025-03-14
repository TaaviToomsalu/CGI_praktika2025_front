import React from "react";

const SeatMap = ({ seats, selectedSeats, onSelectSeat, preferences, suggestedSeats }) => {
    const rows = 6;
    const seatsPerRow = 4;
    const extraLegroomRows = [1];
    const exitRows = [1, 6];
    const windowSeatIndexes = [0, 3];

    return (
        <div className="seat-map">
            {Array.from({ length: rows }).map((_, rowIndex) => {
                const rowNumber = rowIndex + 1;
                const isExitRow = exitRows.includes(rowNumber);
                const isExtraLegroom = extraLegroomRows.includes(rowNumber);

                return (
                    <div
                        key={rowIndex}
                        className={`row ${isExitRow ? "exit-row" : ""} ${
                        isExtraLegroom ? "extra-legroom" : ""
                        }`}
                    >
                        {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                            const seatLetter = String.fromCharCode(65 + seatIndex);
                            const seat = seats.find(seat => seat.seatNumber === `${rowNumber}${seatLetter}`);

                            if (!seat) return null; 
                            
                            const seatNumber = seat.seatNumber;

                            

                            // Kontrollime, kas iste on juba valitud
                            const isSelected = selectedSeats.includes(seatNumber);
                            const isOccupied = seat.occupied;
                            const isWindowSeat = windowSeatIndexes.includes(seatIndex);
                            const isRecommended = Array.isArray(suggestedSeats) && suggestedSeats.some(s => s.seatNumber === seatNumber);

                            

                            const seatClassName = `seat 
                                ${isWindowSeat ? "window-seat" : ""} 
                                ${isSelected ? "selected" : ""} 
                                ${isOccupied ? "occupied" : ""}
                                ${isRecommended ? "recommended" : ""}`;
                            
                            return (
                                <div
                                    key={seatIndex}
                                    className={seatClassName}
                                    onClick={() => !isOccupied && onSelectSeat(seatNumber)}
                                    style={{
                                        cursor: isOccupied ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {seatNumber}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default SeatMap;