
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  Inbox,
  Clock,
  Recycle,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Leaf,
  LoaderCircle,
} from "lucide-react";

import {
  getDashboard,
  updateExchangeRequestStatus,
} from "../api";

const USER_ID = "demo-sumedha";

export default function Dashboard({ onBack }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState("");

  // Initial dashboard loading
  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        const data = await getDashboard(USER_ID);

        if (!ignore) {
          setDashboard(data);
          setError("");
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (!ignore) {
          setError(
            err.response?.data?.error ||
            "Could not load your dashboard. Check that Flask is running."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  // Refresh dashboard after actions
  const loadDashboard = async () => {
    try {
      setError("");
      const data = await getDashboard(USER_ID);
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard refresh error:", err);

      setError(
        err.response?.data?.error ||
        "Could not refresh your dashboard."
      );
    }
  };

  // Accept or reject an incoming request
  const handleRequest = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      setActionError("");

      await updateExchangeRequestStatus(requestId, status);

      await loadDashboard();
    } catch (err) {
      console.error("Request update failed:", err);

      setActionError(
        err.response?.data?.error ||
        "Could not update this request. Please try again."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-[#e66d3d]"
            size={36}
          />
          <p className="mt-4 text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] p-8">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 font-semibold"
        >
          <ArrowLeft size={18} />
          Back to marketplace
        </button>

        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center">
          <p className="font-bold text-red-600">
            {error || "Dashboard data is unavailable."}
          </p>

          <button
            onClick={async () => {
              setLoading(true);
              await loadDashboard();
              setLoading(false);
            }}
            className="mt-5 rounded-lg bg-[#252a29] px-5 py-3 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, listings, incoming_requests } = dashboard;

  const pendingRequests = incoming_requests.filter(
    (item) => item.status === "pending"
  );

  // Requests accepted but not yet completed
const acceptedRequests = incoming_requests.filter(
  (item) => item.status === "accepted"
);

// Only rejected and completed requests belong in history
const processedRequests = incoming_requests.filter(
  (item) =>
    item.status === "rejected" ||
    item.status === "completed"
);

 const getStatusStyle = (status) => {
  if (status === "accepted") return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-blue-100 text-blue-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "processing") return "bg-blue-100 text-blue-700";
  return "bg-orange-100 text-orange-700";
};
  return (
    <div className="min-h-screen bg-[#f8f8f6] text-[#252a29]">

      {/* HEADER */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#e66d3d] p-2 text-white">
              <Recycle size={22} />
            </div>

            <span className="text-xl font-extrabold">
              Material<span className="text-[#e66d3d]">Match.</span>
            </span>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:border-[#e66d3d]"
          >
            <ArrowLeft size={16} />
            Back to marketplace
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* WELCOME */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#e66d3d]">
              Your workspace
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Welcome back, {user.name}!
            </h1>

            <p className="mt-3 text-gray-500">
              Manage your materials and track your exchanges.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-semibold hover:border-[#e66d3d]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* STATISTICS */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package />}
            label="My listings"
            value={stats.total_listings}
          />

          <StatCard
            icon={<Inbox />}
            label="Incoming requests"
            value={stats.incoming_requests}
          />

          <StatCard
            icon={<Clock />}
            label="Pending requests"
            value={stats.pending_requests}
          />

          <StatCard
            icon={<Leaf />}
            label="Completed exchanges"
            value={stats.completed_exchanges}
          />
        </div>

        {/* REUSE IMPACT */}
        <section className="mt-8 rounded-2xl bg-[#252a29] p-7 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-green-300">
              <Recycle size={25} />
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Your reuse contribution
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Material accepted reuseds
              </h2>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {Object.entries(stats.reused_by_unit || {}).length === 0 ? (
              <p className="text-gray-400">
                No accepted exchanges yet.
              </p>
            ) : (
              Object.entries(stats.reused_by_unit).map(
                ([unit, quantity]) => (
                  <div
                    key={unit}
                    className="rounded-xl bg-white/10 px-5 py-4"
                  >
                    <p className="text-3xl font-black text-green-300">
                      {quantity} {unit}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Accepted quantity
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* MY LISTINGS */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                My listings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Materials you have contributed to the marketplace.
              </p>
            </div>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-[#d76336]">
              {listings.length} listings
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              You haven't listed any materials yet.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#e66d3d]">
                        {item.category}
                      </p>

                      <h3 className="mt-2 text-lg font-extrabold">
                        {item.name}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Package size={16} />
                    {item.quantity} {item.unit} remaining
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    {item.location}
                  </p>

                  <div className="mt-5 border-t pt-4 text-sm font-bold">
                    {item.price_type === "free"
                      ? "Free"
                      : item.price_type === "negotiable"
                      ? "Negotiable"
                      : `₹${item.price}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PENDING REQUESTS */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black">
              Incoming requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review people interested in reusing your materials.
            </p>
          </div>

          {actionError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              No pending requests right now.
            </div>
          ) : (
            <div className="space-y-5">
              {pendingRequests.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold">
                        {item.requester_name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.requester_email}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#f8f8f6] p-4">
                    <p className="font-bold">
                      {item.material_name}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Requested quantity:{" "}
                      <strong className="text-[#252a29]">
                        {item.quantity_requested}{" "}
                        {listings.find(
                          (material) => material._id === item.material_id
                        )?.unit || ""}
                      </strong>
                    </p>

                    {item.message && (
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        "{item.message}"
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      disabled={processingId === item._id}
                      onClick={() =>
                        handleRequest(item._id, "accepted")
                      }
                      className="flex items-center gap-2 rounded-lg bg-[#252a29] px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={17} />
                      {processingId === item._id
                        ? "Processing..."
                        : "Accept request"}
                    </button>

                    <button
                      disabled={processingId === item._id}
                      onClick={() =>
                        handleRequest(item._id, "rejected")
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-bold hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


{/* ACCEPTED EXCHANGES */}
<section className="mt-12">
  <div className="mb-6">
    <h2 className="text-2xl font-black">
      Accepted exchanges
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Confirm when the actual material exchange has taken place.
    </p>
  </div>

  {acceptedRequests.length === 0 ? (
    <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
      No accepted exchanges awaiting completion.
    </div>
  ) : (
    <div className="space-y-5">
      {acceptedRequests.map((item) => (
        <div
          key={item._id}
          className="rounded-2xl border border-gray-200 bg-white p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold">
                {item.material_name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Requested by: {item.requester_name}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Email: {item.requester_email}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Quantity: {item.quantity_requested}{" "}
                {listings.find(
                  (material) => material._id === item.material_id
                )?.unit || ""}
              </p>

              <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Accepted
              </span>
            </div>

            <button
              disabled={processingId === item._id}
              onClick={() =>
                handleRequest(item._id, "completed")
              }
              className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
            >
              <CheckCircle2 size={17} />

              {processingId === item._id
                ? "Updating..."
                : "Mark as Completed"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {/* REQUEST HISTORY */}
        <section className="mt-12">
          <h2 className="text-2xl font-black">
            Request history
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Requests that have already been processed.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {processedRequests.length === 0 ? (
              <p className="p-8 text-center text-gray-500">
                No processed requests yet.
              </p>
            ) : (
              processedRequests.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b p-5 last:border-0"
                >
                  <div>
                    <p className="font-bold">
                      {item.requester_name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.material_name} · {item.quantity_requested}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-orange-50 p-3 text-[#e66d3d]">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {label}
      </p>
    </div>
  );
}
