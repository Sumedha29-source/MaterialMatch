
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getMaterials = async () => {
  const response = await API.get("/materials");
  return response.data;
};

export const createMaterial = async (materialData) => {
  const response = await API.post("/materials", materialData);
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await API.delete(`/materials/${id}`);
  return response.data;
};

export const createExchangeRequest = async (requestData) => {
  const response = await API.post("/requests", requestData);
  return response.data;
};

export default API;
