const buildUrlEmail = (bookingId, token) => {
    // return `${process.env.URL_REACT}/verify-booking?bookingId=${bookingId}&token=${token}`;
    return `http://localhost:5173/verify-booking?bookingId=${bookingId}&token=${token}`;
};

module.exports = buildUrlEmail;
