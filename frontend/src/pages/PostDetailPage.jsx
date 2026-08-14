import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PostDetailCard from '../components/PostDetailCard'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <PostDetailCard postId={id} onBack={() => navigate('/')} />
      </main>

      <Footer />
    </div>
  )
}
