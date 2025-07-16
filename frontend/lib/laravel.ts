import axios from "axios";

export async function getProjects() {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error("Erro em getProjects:", error);
    throw new Error("Erro ao buscar projetos");
  }
}

export async function getProjectById(id: number) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro em getProjectById:", error);
    throw new Error("Erro ao buscar o projeto por id");
  }
}

export async function getProjectsByStatus(status: string) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.error("Erro em getProjectsByStatus:", error);
    throw new Error("Erro ao buscar o projeto por status");
  }
}