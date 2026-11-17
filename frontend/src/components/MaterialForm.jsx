
import { useState } from "react";
import { createMaterial } from "../api";
import { PackagePlus, CheckCircle, AlertCircle } from "lucide-react";

const initialForm = {
  name: "",
  category: "Wood",
  description: "",
  quantity: "",
  unit: "kg",
  condition: "Good",
  location: "",
  price_type: "free",
  price: 0,
};

export default function MaterialForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "price" || name === "quantity"
        ? value
        : value,
      ...(name === "price_type" && value === "free"
        ? { price: 0 }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        price: form.price_type === "free" ? 0 : Number(form.price),
      };

      const result = await createMaterial(payload);

      setMessage(result.message);
setForm(initialForm);
await onCreated?.();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Could not submit listing. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
          <PackagePlus size={24} />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-700">
          Give materials a second life
        </p>

        <h2 className="text-3xl font-bold text-stone-900">
          List Your Material
        </h2>

        <p className="mt-2 text-stone-500">
          Share your surplus materials with people who can reuse them.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Material name *</label>
          <input
            className={fieldClass}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Reclaimed wooden planks"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Category *</label>
            <select
              className={fieldClass}
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {["Wood", "Plastic", "Metal", "Paper", "Cardboard", "Textile", "Glass", "Other"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Condition *</label>
            <select
              className={fieldClass}
              name="condition"
              value={form.condition}
              onChange={handleChange}
            >
              {["New", "Good", "Usable", "Damaged"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            className={fieldClass}
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the material and its possible uses..."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Quantity *</label>
            <input
              className={fieldClass}
              type="number"
              min="0.01"
              step="any"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="50"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Unit *</label>
            <select
              className={fieldClass}
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >
              {["kg", "tonnes", "pieces", "litres", "metres", "boxes"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Location *</label>
          <input
            className={fieldClass}
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Kolkata"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Pricing *</label>
            <select
              className={fieldClass}
              name="price_type"
              value={form.price_type}
              onChange={handleChange}
            >
              <option value="free">Free</option>
              <option value="fixed">Fixed price</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>

          {form.price_type !== "free" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (₹)
              </label>
              <input
                className={fieldClass}
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
              />
            </div>
          )}
        </div>

        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle size={19} />
            {message}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-600 px-6 py-4 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "List My Material"}
        </button>
      </form>
    </section>
  );
}
