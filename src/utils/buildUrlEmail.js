const buildUrlEmail = (bookingId, token) => {
    
    return `http://localhost:5173/verify-booking?bookingId=${bookingId}&token=${token}`;
};

module.exports = buildUrlEmail;
