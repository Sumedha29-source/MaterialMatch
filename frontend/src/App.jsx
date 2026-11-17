
import { useState, useEffect } from "react";
import { getMaterials } from "./api";
import MaterialForm from "./components/MaterialForm";
import MaterialDetails from "./components/MaterialDetails";
import {
  ArrowRight,
  Recycle,
  Search,
  MapPin,
  Package,
  Leaf,
  Menu,
  X,
  ArrowUpRight,
  CheckCircle2,
  Boxes
} from "lucide-react";

const categories = [
  { name: "Wood & Timber", icon: "🪵", count: "124 listings" },
  { name: "Plastic", icon: "♻️", count: "86 listings" },
  { name: "Metal & Scrap", icon: "⚙️", count: "72 listings" },
  { name: "Textiles", icon: "🧵", count: "53 listings" },
  { name: "Paper & Cardboard", icon: "📦", count: "98 listings" },
  { name: "Glass", icon: "🫙", count: "31 listings" },
];

function App() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const loadListings = async () => {
    try {
      const data = await getMaterials();
      setListings(data);
      setApiError("");
    } catch (error) {
      console.error("Could not load materials:", error);
      setApiError("Unable to load materials. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  let ignore = false;

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();

      if (!ignore) {
        setListings(data);
        setApiError("");
      }
    } catch (error) {
      console.error("Could not load materials:", error);

      if (!ignore) {
        setApiError("Unable to load materials. Please check the backend.");
      }
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  };

  fetchMaterials();

  return () => {
    ignore = true;
  };
}, []);
  const handleMaterialCreated = async () => {
    await loadListings();
    setShowForm(false);
  };

  const getMaterialEmoji = (category) => {
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

  const getMaterialColor = (category) => {
    const colors = {
      Wood: "bg-orange-100",
      Plastic: "bg-emerald-100",
      Metal: "bg-slate-200",
      Paper: "bg-amber-100",
      Cardboard: "bg-yellow-100",
      Textile: "bg-pink-100",
      Glass: "bg-cyan-100",
      Other: "bg-gray-100",
    };

    return colors[category] || "bg-gray-100";
  };

  const filteredListings = listings.filter((item) =>
    `${item.name} ${item.category} ${item.location}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  if (selectedMaterial) {
  return (
    <MaterialDetails
      material={selectedMaterial}
      onBack={() => setSelectedMaterial(null)}
    />
  );
}

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-[#252a29]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="rounded-xl bg-[#e66d3d] p-2 text-white">
              <Recycle size={23} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Material<span className="text-[#e66d3d]">Match.</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#marketplace" className="hover:text-[#e66d3d]">Marketplace</a>
            <a href="#categories" className="hover:text-[#e66d3d]">Categories</a>
            <a href="#about" className="hover:text-[#e66d3d]">How it works</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button className="px-4 py-2 text-sm font-semibold hover:text-[#e66d3d]">
              Log in
            </button>
            <button className="rounded-lg bg-[#252a29] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e66d3d]">
              Get started <ArrowUpRight className="ml-1 inline" size={15} />
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="space-y-4 border-t bg-white p-6 md:hidden">
            <a href="#marketplace" className="block">Marketplace</a>
            <a href="#categories" className="block">Categories</a>
            <a href="#about" className="block">How it works</a>
            <button className="w-full rounded-lg bg-[#252a29] p-3 text-white">
              Get started
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#d76336]">
            <span className="h-2 w-2 rounded-full bg-[#e66d3d]" />
            The circular economy starts here
          </div>

          <h1 className="max-w-2xl text-5xl font-black leading-[1.12] tracking-tight sm:text-6xl">
            Your waste is
            <br />
            someone else's
            <br />
            <span className="text-[#e66d3d]">raw material.</span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-8 text-gray-500">
            Connect with businesses that can give your surplus
            materials a second life. Discover resources, reduce
            waste, and build a smarter circular economy.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#marketplace" className="rounded-lg bg-[#e66d3d] px-6 py-4 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-1 hover:bg-[#cf592e]">
              Explore materials <ArrowRight className="ml-2 inline" size={18} />
            </a>
            <button
  onClick={() => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("list-material")?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  }}
  className="rounded-lg border border-gray-300 bg-white px-6 py-4 font-bold hover:border-[#e66d3d]"
>
  List your material
</button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600" />
              Free to get started
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600" />
              AI-powered matching
            </span>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative">
          <div className="absolute -right-4 -top-5 h-36 w-36 rounded-full bg-orange-200/60 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm font-bold">Material exchange</p>
                <p className="mt-1 text-xs text-gray-400">Give resources a second life</p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Live concept
              </span>
            </div>

            <div className="my-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#f7eee7] p-5">
                <span className="text-4xl">🪵</span>
                <p className="mt-4 font-bold">Wood scraps</p>
                <p className="mt-1 text-xs text-gray-500">Available resource</p>
              </div>
              <div className="rounded-2xl bg-[#edf3eb] p-5">
                <span className="text-4xl">🪑</span>
                <p className="mt-4 font-bold">Furniture maker</p>
                <p className="mt-1 text-xs text-gray-500">Potential seeker</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-4">
              <div className="rounded-xl bg-white p-3 text-[#e66d3d]">
                <Boxes size={23} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Smart material matching</p>
                <p className="mt-1 text-xs text-gray-500">Finding value in unused resources</p>
              </div>
              <ArrowRight className="text-[#e66d3d]" />
            </div>
          </div>

          <div className="absolute -bottom-7 -left-5 rounded-xl border bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-700">
                <Leaf size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold">Waste less. Create more.</p>
                <p className="text-xs text-gray-400">A more resourceful future</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showForm && (
  <section id="list-material">
    <MaterialForm onCreated={handleMaterialCreated} />
  </section>
)}

      {/* STATS */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
          {[
            ["01", "List unused materials"],
            ["02", "Discover resources"],
            ["03", "Connect with seekers"],
            ["04", "Reuse and regenerate"],
          ].map(([number, label]) => (
            <div key={number}>
              <p className="text-sm font-black text-[#e66d3d]">{number}</p>
              <p className="mt-2 font-bold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e66d3d]">
              Explore resources
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Find materials worth saving.
            </h2>
            <p className="mt-3 text-gray-500">
              Browse reusable resources across different industries.
            </p>
          </div>
          <a href="#marketplace" className="font-bold text-[#e66d3d]">
            View marketplace <ArrowRight className="ml-1 inline" size={17} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <button key={category.name} className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#e66d3d] hover:shadow-lg">
              <span className="text-3xl">{category.icon}</span>
              <p className="mt-5 text-sm font-bold">{category.name}</p>
              <p className="mt-2 text-xs text-gray-400">{category.count}</p>
            </button>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      
<section id="marketplace" className="bg-[#eeefec] py-20">
  <div className="mx-auto max-w-7xl px-6">

    <div className="mb-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e66d3d]">
        The marketplace
      </p>
      <h2 className="mt-3 text-3xl font-black sm:text-4xl">
        Recently listed materials.
      </h2>
    </div>

    <div className="mb-8 flex max-w-xl items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <Search size={20} className="text-gray-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search wood, plastic, cardboard..."
        className="w-full bg-transparent text-sm outline-none"
      />
    </div>

    {/* MATERIAL LISTINGS GRID */}
    <div className="grid gap-6 md:grid-cols-3">
      {loading ? (
        <p className="col-span-full py-10 text-center text-gray-500">
          Loading materials from MaterialMatch...
        </p>
      ) : apiError ? (
        <p className="col-span-full py-10 text-center text-red-600">
          {apiError}
        </p>
      ) : (
        <>
          {filteredListings.map((item) => (
           <div
  key={item._id}
  onClick={() => setSelectedMaterial(item)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedMaterial(item);
    }
  }}
  className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
>
              <div className={`flex h-48 items-center justify-center ${getMaterialColor(item.category)}`}>
                <span className="text-7xl">
                  {getMaterialEmoji(item.category)}
                </span>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold text-[#e66d3d]">
                  {item.category}
                </p>

                <h3 className="mt-2 text-lg font-extrabold">
                  {item.name}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <Package size={16} />
                    {item.quantity} {item.unit}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={16} />
                    {item.location}
                  </p>

                  <p>Condition: {item.condition}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <span className="font-bold">
                    {item.price_type === "free"
                      ? "Free"
                      : item.price_type === "negotiable"
                      ? "Negotiable"
                      : `₹${item.price}`}
                  </span>

                  <span className="text-xs font-semibold text-green-700">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredListings.length === 0 && (
            <p className="col-span-full py-10 text-center text-gray-500">
              No matching materials found. Try another search!
            </p>
          )}
        </>
      )}
    </div>

  </div>
</section>


      {/* CTA */}
      <section className="mx-6 mb-16 overflow-hidden rounded-3xl bg-[#252a29] px-8 py-16 text-center text-white md:mx-auto md:max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
          Make waste useful
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black sm:text-5xl">
          Every material deserves another chance.
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-400">
          Join a growing movement to make resource exchange easier,
          smarter and more accessible.
        </p>
        <a href="#marketplace" className="mt-8 inline-flex items-center rounded-lg bg-[#e66d3d] px-7 py-4 font-bold hover:bg-[#cf592e]">
          Explore the marketplace <ArrowRight className="ml-2" size={18} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-8">
          <div className="flex items-center gap-2 font-extrabold">
            <Recycle className="text-[#e66d3d]" />
            MaterialMatch.
          </div>
          <p className="text-sm text-gray-400">
            Turning surplus into opportunity. © 2026 MaterialMatch.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
