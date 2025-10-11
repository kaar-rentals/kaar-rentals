import React from "react";
import CarImage from "./CarImage";

export default function ListingCard({ car, isAuthenticated }) {
  return (
    <div className="card" style={{
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      backgroundColor: "white",
      marginBottom: "1rem"
    }}>
      <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
        {car.images?.[0] ? (
          <CarImage srcUrl={car.images[0]} />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            fontSize: "14px"
          }}>
            No Image Available
          </div>
        )}
      </div>
      <div className="card-body" style={{ padding: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", fontWeight: "600" }}>
          {car.brand} {car.model} • {car.year}
        </h3>
        <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
          {car.category} • {car.transmission} • {car.fuelType}
        </p>
        <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
          Seats: {car.seating} • Mileage: {car.mileage}
        </p>
        <p style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", fontWeight: "600", color: "#059669" }}>
          PKR {Number(car.pricePerDay).toLocaleString()} / day
        </p>
        <p style={{ margin: "0 0 1rem 0", color: "#4b5563", fontSize: "0.875rem", lineHeight: "1.4" }}>
          {car.description?.slice(0,120)}...
        </p>

        {isAuthenticated ? (
          <>
            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.875rem", color: "#6b7280" }}>
              Location: {car.location}
            </p>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "#6b7280" }}>
              Owner contact: {car.renterPhone || "N/A"}
            </p>
            <a 
              href={`/cars/${car._id}`} 
              className="btn"
              style={{
                display: "inline-block",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              View & Book
            </a>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.875rem", color: "#6b7280" }}>
              Location: {car.city}
            </p>
            <button 
              className="btn" 
              onClick={() => window.location.href = "/login"}
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Login to view contact & location
            </button>
          </>
        )}
      </div>
    </div>
  );
}


