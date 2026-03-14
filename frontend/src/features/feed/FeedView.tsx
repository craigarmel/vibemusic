import Layout from '../../components/Layout'

export default function FeedView() {
  return (
    <Layout showHeader={false}>
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-cyan text-sm font-bold tracking-widest mb-4">
            SYNTHETICA
          </div>
          <p className="text-text-muted text-sm">Fan Feed — Coming in Epic 5</p>
        </div>
      </div>
    </Layout>
  )
}
