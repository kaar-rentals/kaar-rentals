import React from "react";

export default function ListingCard({ car, isAuthenticated }) {
  return (
    <div className="card">
      <img src={car.images?.[0] || "/placeholder.jpg"} alt={`${car.brand} ${car.model}`} className="card-img" />
      <div className="card-body">
        <h3>{car.brand} {car.model} • {car.year}</h3>
        <p>{car.category} • {car.transmission} • {car.fuelType}</p>
        <p>Seats: {car.seating} • Mileage: {car.mileage}</p>
        <p><strong>PKR {Number(car.pricePerDay).toLocaleString()}</strong> / day</p>
        <p className="short-desc">{car.description?.slice(0,120)}</p>

        {isAuthenticated ? (
          <>
            <p>Location: {car.location}</p>
            <p>Owner contact: {car.renterPhone || "N/A"}</p>
            <a href={`/cars/${car._id}`} className="btn">View & Book</a>
          </>
        ) : (
          <>
            <p>Location: {car.city}</p>
            <button className="btn" onClick={() => window.location.href = "/login"}>Login to view contact & location</button>
          </>
        )}
      </div>
    </div>
  );
}


