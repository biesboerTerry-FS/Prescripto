import app from "./app.js";

const PORT = process.env.PORT || 3000;

// Starts the HTTP server after configuration and connection attempts are complete.
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
