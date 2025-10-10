import React, { useState } from "react";

export default function AddCar() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brand: "", model: "", year: "", category: "", pricePerDay: "", city: "", location: "", transmission: "Automatic", fuelType: "Petrol", seating: 5, description: "", features: ""
  });
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("token");

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;
      if (file) {
        const fd = new FormData();
        fd.append("image", file);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: "POST",
          body: fd
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Upload failed");
        imageUrl = uploadJson.url;
      }

      const body = {
        ...form,
        pricePerDay: Number(form.pricePerDay || 0),
        seating: Number(form.seating || 5),
        images: imageUrl ? [imageUrl] : []
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/cars`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({ message: 'Unknown' }));
        throw new Error(err.message || "Create car failed");
      }
      alert("Car created successfully");
      // reset form
      setForm({ brand: "", model: "", year: "", category: "", pricePerDay: "", city: "", location: "", transmission: "Automatic", fuelType: "Petrol", seating: 5, description: "", features: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || "Failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:700, margin:"0 auto"}}>
      <input name="brand" placeholder="Brand" value={form.brand} onChange={onChange} required />
      <input name="model" placeholder="Model" value={form.model} onChange={onChange} required />
      <input name="year" placeholder="Year" value={form.year} onChange={onChange} />
      <input name="category" placeholder="Category" value={form.category} onChange={onChange} />
      <input name="pricePerDay" placeholder="Price Per Day (PKR)" value={form.pricePerDay} onChange={onChange} />
      <input name="city" placeholder="City" value={form.city} onChange={onChange} />
      <input name="location" placeholder="Location (full address)" value={form.location} onChange={onChange} />
      <select name="transmission" value={form.transmission} onChange={onChange}>
        <option>Automatic</option><option>Manual</option>
      </select>
      <select name="fuelType" value={form.fuelType} onChange={onChange}>
        <option>Petrol</option><option>Diesel</option><option>CNG</option>
      </select>
      <input name="seating" type="number" value={form.seating} onChange={onChange} />
      <textarea name="description" placeholder="Short description" value={form.description} onChange={onChange} />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Car"}</button>
    </form>
  );
}


