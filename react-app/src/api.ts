import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
})

export default api;

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploadcsv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};