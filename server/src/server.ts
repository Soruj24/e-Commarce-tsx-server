import app from "./app";
import connectDB from "./config/db";

app.listen(process.env.PORT,async () => {
  await connectDB()
  console.log(`Server running on port ${process.env.PORT}`);
});