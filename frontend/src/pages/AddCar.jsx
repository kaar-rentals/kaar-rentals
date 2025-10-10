import React, { useState } from "react";
import { uploadImageFile } from "../lib/firebaseClient";

export default function AddCar() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ brand:"", model:"", year:"", category:"", pricePerDay:"", city:"", location:"", transmission:"Automatic", fuelType:"Petrol", seating:5, features:"", description:"" });
  const [file, setFile] = useState(null);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;
      if (file) imageUrl = await uploadImageFile(file);
      const body = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        images: imageUrl ? [imageUrl] : []
      };
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cars`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed");
      alert("Car created");
    } catch (err) {
      console.error(err);
      alert("Error creating car");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="brand" placeholder="Brand" value={form.brand} onChange={onChange} required />
      <input name="model" placeholder="Model" value={form.model} onChange={onChange} required />
      <input name="year" placeholder="Year" value={form.year} onChange={onChange} />
      <input name="category" placeholder="Category" value={form.category} onChange={onChange} />
      <input name="pricePerDay" placeholder="Price Per Day (PKR)" value={form.pricePerDay} onChange={onChange} />
      <input name="city" placeholder="City" value={form.city} onChange={onChange} />
      <input name="location" placeholder="Location" value={form.location} onChange={onChange} />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Create Car"}</button>
    </form>
  );
}


