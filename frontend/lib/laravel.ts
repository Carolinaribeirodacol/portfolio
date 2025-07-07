import axios from "axios";

export async function getProjects() {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
  return response.data;
}

export async function getProjectById(id: number) {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`);
  return response.data;
}