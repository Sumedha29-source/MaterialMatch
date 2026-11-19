
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument
from pymongo.errors import ConnectionFailure
from bson import ObjectId
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

# ==========================================
# CONFIGURATION
# ==========================================

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://127.0.0.1:27017/"
)

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client["materialmatch"]

users_collection = db["users"]
materials_collection = db["materials"]
exchange_requests_collection = db["exchangeRequests"]

# ==========================================
# DEMO USER
# ==========================================

DEMO_USER = {
    "user_id": "demo-sumedha",
    "name": "Sumedha",
    "email": "sumedha@materialmatch.demo",
    "role": "demo"
}

users_collection.update_one(
    {"user_id": DEMO_USER["user_id"]},
    {"$setOnInsert": DEMO_USER},
    upsert=True
)
# Assign older listings to the demo user
materials_collection.update_many(
    {"owner_id": {"$exists": False}},
    {
        "$set": {
            "owner_id": DEMO_USER["user_id"],
            "owner_name": DEMO_USER["name"]
        }
    }
)

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def serialize_material(material):
    material["_id"] = str(material["_id"])
    return material


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to MaterialMatch API!",
        "status": "Backend is running"
    })


# ==========================================
# DATABASE HEALTH CHECK
# ==========================================

@app.route("/api/health", methods=["GET"])
def health():
    try:
        client.admin.command("ping")

        return jsonify({
            "status": "success",
            "message": "Flask connected to MongoDB!",
            "database": db.name
        }), 200

    except ConnectionFailure:
        return jsonify({
            "status": "error",
            "message": "MongoDB connection failed"
        }), 500


# ==========================================
# CREATE MATERIAL LISTING
# ==========================================

@app.route("/api/materials", methods=["POST"])
def create_material():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required"
        }), 400

    required_fields = [
        "name", "category", "quantity",
        "unit", "condition", "location"
    ]

    for field in required_fields:
        if field not in data or data[field] in (None, ""):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    try:
        quantity = float(data["quantity"])

        if quantity <= 0:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({
            "error": "Quantity must be a positive number"
        }), 400

    material = {
        "name": str(data["name"]).strip(),
        "category": str(data["category"]).strip(),
        "description": str(data.get("description", "")).strip(),
        "quantity": quantity,
        "unit": str(data["unit"]).strip(),
        "condition": str(data["condition"]).strip(),
        "location": str(data["location"]).strip(),
        "price_type": data.get("price_type", "free"),
        "price": data.get("price", 0),
        "status": "available",
        "created_at": datetime.now(timezone.utc),
        "owner_id": DEMO_USER["user_id"],
        "owner_name": DEMO_USER["name"]
    }

    result = materials_collection.insert_one(material)

    return jsonify({
        "message": "Material listed successfully!",
        "material_id": str(result.inserted_id)
    }), 201


# ==========================================
# GET ALL MATERIAL LISTINGS
# ==========================================

@app.route("/api/materials", methods=["GET"])
def get_materials():

    materials = list(
        materials_collection.find().sort("created_at", -1)
    )

    return jsonify([
        serialize_material(material)
        for material in materials
    ]), 200


# ==========================================
# GET ONE MATERIAL LISTING
# ==========================================

@app.route("/api/materials/<material_id>", methods=["GET"])
def get_material(material_id):

    if not ObjectId.is_valid(material_id):
        return jsonify({"error": "Invalid material ID"}), 400

    material = materials_collection.find_one({
        "_id": ObjectId(material_id)
    })

    if not material:
        return jsonify({"error": "Material not found"}), 404

    return jsonify(serialize_material(material)), 200


# ==========================================
# DELETE MATERIAL LISTING
# ==========================================

@app.route("/api/materials/<material_id>", methods=["DELETE"])
def delete_material(material_id):

    if not ObjectId.is_valid(material_id):
        return jsonify({"error": "Invalid material ID"}), 400

    result = materials_collection.delete_one({
        "_id": ObjectId(material_id)
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Material not found"}), 404

    return jsonify({
        "message": "Material deleted successfully!"
    }), 200


# ==========================================
# CREATE EXCHANGE REQUEST
# ==========================================

@app.route("/api/requests", methods=["POST"])
def create_exchange_request():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request data"
        }), 400

    required_fields = [
        "material_id",
        "requester_name",
        "requester_email",
        "quantity_requested"
    ]

    for field in required_fields:
        if field not in data or data[field] in (None, ""):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    if not isinstance(data["requester_name"], str) or not data["requester_name"].strip():
        return jsonify({"error": "Invalid requester name"}), 400

    if not isinstance(data["requester_email"], str) or not data["requester_email"].strip():
        return jsonify({"error": "Invalid requester email"}), 400

    if not ObjectId.is_valid(data["material_id"]):
        return jsonify({
            "error": "Invalid material ID"
        }), 400

    try:
        quantity = float(data["quantity_requested"])

        if quantity <= 0:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({
            "error": "Quantity must be a positive number"
        }), 400

    material = materials_collection.find_one({
        "_id": ObjectId(data["material_id"])
    })

    if not material:
        return jsonify({
            "error": "Material not found"
        }), 404

    if material.get("status") != "available":
        return jsonify({
            "error": "Material is not available"
        }), 400

    if quantity > material["quantity"]:
        return jsonify({
            "error": "Requested quantity exceeds available quantity"
        }), 400

    exchange_request = {
        "material_id": ObjectId(data["material_id"]),
        "material_name": material["name"],
        "requester_name": data["requester_name"].strip(),
        "requester_email": data["requester_email"].strip(),
        "quantity_requested": quantity,
        "message": str(data.get("message", "")).strip(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }

    result = exchange_requests_collection.insert_one(
        exchange_request
    )

    return jsonify({
        "message": "Exchange request submitted successfully!",
        "request_id": str(result.inserted_id)
    }), 201


# ==========================================
# GET EXCHANGE REQUESTS
# ==========================================

@app.route("/api/requests", methods=["GET"])
def get_exchange_requests():

    material_id = request.args.get("material_id")

    query = {}

    if material_id:
        if not ObjectId.is_valid(material_id):
            return jsonify({
                "error": "Invalid material ID"
            }), 400

        query["material_id"] = ObjectId(material_id)

    requests_list = list(
        exchange_requests_collection.find(query).sort(
            "created_at", -1
        )
    )

    for item in requests_list:
        item["_id"] = str(item["_id"])
        item["material_id"] = str(item["material_id"])
        item["created_at"] = item["created_at"].isoformat()

    return jsonify(requests_list), 200


# ==========================================
# ACCEPT / REJECT / COMPLETE EXCHANGE REQUEST
# ==========================================

@app.route("/api/requests/<request_id>/status", methods=["PATCH"])
def update_exchange_request_status(request_id):

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    new_status = data.get("status")

    if new_status not in ["accepted", "rejected", "completed"]:
        return jsonify({
            "error": "Status must be accepted, rejected, or completed"
        }), 400

    if not ObjectId.is_valid(request_id):
        return jsonify({"error": "Invalid request ID"}), 400

    request_object_id = ObjectId(request_id)

    # --------------------------------------
    # COMPLETE AN ACCEPTED REQUEST
    # --------------------------------------

    if new_status == "completed":

        result = exchange_requests_collection.update_one(
            {
                "_id": request_object_id,
                "status": "accepted"
            },
            {
                "$set": {
                    "status": "completed",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        if result.modified_count == 0:

            existing = exchange_requests_collection.find_one({
                "_id": request_object_id
            })

            if not existing:
                return jsonify({"error": "Request not found"}), 404

            return jsonify({
                "error": "Only accepted requests can be marked as completed"
            }), 409

        return jsonify({
            "message": "Exchange marked as completed!",
            "status": "completed"
        }), 200

    # --------------------------------------
    # REJECT REQUEST
    # --------------------------------------

    if new_status == "rejected":

        updated_request = exchange_requests_collection.find_one_and_update(
            {
                "_id": request_object_id,
                "status": "pending"
            },
            {
                "$set": {
                    "status": "rejected",
                    "updated_at": datetime.now(timezone.utc)
                }
            },
            return_document=ReturnDocument.AFTER
        )

        if not updated_request:

            existing = exchange_requests_collection.find_one({
                "_id": request_object_id
            })

            if not existing:
                return jsonify({"error": "Request not found"}), 404

            return jsonify({
                "error": "This request has already been processed"
            }), 409

        return jsonify({
            "message": "Exchange request rejected successfully!",
            "status": "rejected"
        }), 200

    # --------------------------------------
    # ACCEPT REQUEST
    # --------------------------------------

    # Claim the pending request first.
    # This prevents the same request from being accepted twice.

    claimed_request = exchange_requests_collection.find_one_and_update(
        {
            "_id": request_object_id,
            "status": "pending"
        },
        {
            "$set": {
                "status": "processing"
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not claimed_request:

        existing = exchange_requests_collection.find_one({
            "_id": request_object_id
        })

        if not existing:
            return jsonify({"error": "Request not found"}), 404

        return jsonify({
            "error": "This request has already been processed"
        }), 409

    material_id = claimed_request["material_id"]
    quantity = claimed_request["quantity_requested"]

    # Deduct quantity only if enough stock remains.

    updated_material = materials_collection.find_one_and_update(
        {
            "_id": material_id,
            "status": "available",
            "quantity": {"$gte": quantity}
        },
        {
            "$inc": {"quantity": -quantity}
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated_material:

        # Restore the request to pending if stock is insufficient.

        exchange_requests_collection.update_one(
            {
                "_id": request_object_id,
                "status": "processing"
            },
            {
                "$set": {"status": "pending"}
            }
        )

        return jsonify({
            "error": "Not enough material is available to accept this request"
        }), 409

    # Mark listing unavailable if all stock has been allocated.

    if updated_material["quantity"] <= 0:

        materials_collection.update_one(
            {"_id": material_id},
            {"$set": {"status": "unavailable"}}
        )

    # Finally, mark the request as accepted.

    exchange_requests_collection.update_one(
        {
            "_id": request_object_id,
            "status": "processing"
        },
        {
            "$set": {
                "status": "accepted",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return jsonify({
        "message": "Exchange request accepted successfully!",
        "status": "accepted",
        "remaining_quantity": updated_material["quantity"],
        "unit": updated_material["unit"]
    }), 200


# ==========================================
# USER DASHBOARD
# ==========================================

@app.route("/api/dashboard/<user_id>", methods=["GET"])
def get_user_dashboard(user_id):

    # 1. Find the user
    user = users_collection.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )

    if not user:
        return jsonify({"error": "User not found"}), 404

    # 2. Get all materials owned by this user
    listings = list(
        materials_collection.find(
            {"owner_id": user_id}
        ).sort("created_at", -1)
    )

    # 3. Get the IDs of the user's materials
    material_ids = [item["_id"] for item in listings]

    # 4. Find all incoming requests for these materials
    incoming_requests = list(
        exchange_requests_collection.find({
            "material_id": {"$in": material_ids}
        }).sort("created_at", -1)
    )

    # 5. Calculate pending requests
    pending_count = sum(
        1 for item in incoming_requests
        if item.get("status") == "pending"
    )

    # 6. Find accepted requests
    completed_requests = [
        item for item in incoming_requests
        if item.get("status") == "completed"
    ]

    completed_count = len(completed_requests)

    # 7. Group reused quantities by unit
    material_units = {
        item["_id"]: item.get("unit", "units")
        for item in listings
    }

    reused_by_unit = {}

    for item in completed_requests:

        unit = material_units.get(
            item["material_id"], "units"
        )

        reused_by_unit[unit] = (
            reused_by_unit.get(unit, 0)
            + item.get("quantity_requested", 0)
        )

    # 8. Convert MongoDB ObjectIds and dates into JSON format
    for item in listings:
        item["_id"] = str(item["_id"])
        item["created_at"] = item["created_at"].isoformat()

    for item in incoming_requests:
        item["_id"] = str(item["_id"])
        item["material_id"] = str(item["material_id"])
        item["created_at"] = item["created_at"].isoformat()

        if item.get("updated_at"):
            item["updated_at"] = item["updated_at"].isoformat()

    # 9. Return dashboard information
    return jsonify({

        "user": user,

        "stats": {
            "total_listings": len(listings),
            "incoming_requests": len(incoming_requests),
            "pending_requests": pending_count,
            "completed_exchanges": completed_count,
            "reused_by_unit": reused_by_unit
        },

        "listings": listings,

        "incoming_requests": incoming_requests

    }), 200


# ==========================================
# RUN FLASK SERVER
# ==========================================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
