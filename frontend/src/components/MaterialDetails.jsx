
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Package,
  Leaf,
  Tag,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createExchangeRequest } from "../api";

export default function MaterialDetails({ material, onBack }) {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [formData, setFormData] = useState({
    requester_name: "",
    requester_email: "",
    quantity_requested: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!material) return null;

  const getEmoji = (category) => {
    const emojis = {
      Wood: "🪵",
      Plastic: "♻️",
      Metal: "⚙️",
      Paper: "📄",
      Cardboard: "📦",
      Textile: "🧵",
      Glass: "🫙",
      Other: "♻️",
    };

    return emojis[category] || "♻️";
  };

  const price =
    material.price_type === "free"
      ? "Free"
      : material.price_type === "negotiable"
      ? "Negotiable"
      : `₹${material.price}`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const requestedQuantity = Number(formData.quantity_requested);

    if (!formData.requester_name.trim() || !formData.requester_email.trim()) {
      setErrorMessage("Please enter your name and email.");
      return;
    }

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity <= 0 ||
      requestedQuantity > Number(material.quantity)
    ) {
      setErrorMessage(
        `Enter a quantity between 0 and ${material.quantity} ${material.unit}.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await createExchangeRequest({
        material_id: material._id,
        requester_name: formData.requester_name.trim(),
        requester_email: formData.requester_email.trim(),
        quantity_requested: requestedQuantity,
        message: formData.message.trim(),
      });

      setSuccessMessage(
        response.message || "Your exchange request was submitted successfully!"
      );

      setFormData({
        requester_name: "",
        requester_email: "",
        quantity_requested: "",
        message: "",
      });

      setShowRequestForm(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "Unable to submit your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#eeefec] py-12">
      <div className="mx-auto max-w-5xl px-6">

        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 font-semibold text-gray-600 transition hover:text-[#e66d3d]"
        >
          <ArrowLeft size={20} />
          Back to marketplace
        </button>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          <div className="flex h-64 items-center justify-center bg-orange-100 sm:h-80">
            <span className="text-9xl">
              {getEmoji(material.category)}
            </span>
          </div>

          <div className="p-6 sm:p-10">

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-[#e66d3d]">
                {material.category}
              </span>

              <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                {material.status}
              </span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
              {material.name}
            </h1>

            <p className="mt-4 leading-7 text-gray-500">
              {material.description || "No description provided."}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-5">
                <Package className="mb-3 text-[#e66d3d]" size={24} />
                <p className="text-sm text-gray-500">Available quantity</p>
                <p className="mt-1 text-xl font-bold">
                  {material.quantity} {material.unit}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-5">
                <Leaf className="mb-3 text-green-600" size={24} />
                <p className="text-sm text-gray-500">Material condition</p>
                <p className="mt-1 text-xl font-bold">
                  {material.condition}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-5">
                <MapPin className="mb-3 text-[#e66d3d]" size={24} />
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 text-xl font-bold">
                  {material.location}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-5">
                <Tag className="mb-3 text-[#e66d3d]" size={24} />
                <p className="text-sm text-gray-500">Price</p>
                <p className="mt-1 text-xl font-bold">{price}</p>
              </div>

            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-400">
                Listed on MaterialMatch
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-700">
                Help give this material a second life!
              </p>
            </div>

            {successMessage && (
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-700">
                <CheckCircle2 size={22} className="mt-0.5 shrink-0" />
                <p className="font-medium">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                <AlertCircle size={22} className="mt-0.5 shrink-0" />
                <p className="font-medium">{errorMessage}</p>
              </div>
            )}

            {material.status === "available" && (
              <div className="mt-8">
                {!showRequestForm ? (
                  <button
                    onClick={() => {
                      setErrorMessage("");
                      setShowRequestForm(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e66d3d] px-6 py-4 font-bold text-white transition hover:bg-[#cf592d] sm:w-auto"
                  >
                    <Send size={18} />
                    Request Material
                  </button>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
                    <h2 className="text-2xl font-black text-gray-900">
                      Request this material
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Submit your details to express interest in this material.
                    </p>

                    <form
                      onSubmit={handleRequestSubmit}
                      className="mt-6 space-y-5"
                    >
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Your name
                        </label>
                        <input
                          type="text"
                          name="requester_name"
                          value={formData.requester_name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#e66d3d]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="requester_email"
                          value={formData.requester_email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#e66d3d]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Quantity required ({material.unit})
                        </label>
                        <input
                          type="number"
                          name="quantity_requested"
                          value={formData.quantity_requested}
                          onChange={handleChange}
                          min="0.01"
                          max={material.quantity}
                          step="any"
                          placeholder={`Maximum ${material.quantity} ${material.unit}`}
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#e66d3d]"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          Available: {material.quantity} {material.unit}
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Message (optional)
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Tell the seller how you plan to reuse this material..."
                          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#e66d3d]"
                        />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e66d3d] px-6 py-3 font-bold text-white transition hover:bg-[#cf592d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? "Submitting..." : "Submit Request"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowRequestForm(false)}
                          disabled={loading}
                          className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-600 transition hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
