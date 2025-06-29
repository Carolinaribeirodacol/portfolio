import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios.get(process.env.APP_URL + '/api/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      <h1>Meus Projetos</h1>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
