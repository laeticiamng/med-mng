import { BookOpen, Users, Brain, TrendingUp } from 'lucide-react'

export const RangBPage = () => {
  const categories = [
    {
      title: 'Sémiologie',
      count: 45,
      color: 'from-blue-500 to-cyan-500',
      icon: Brain,
      description: 'Signes cliniques et symptômes'
    },
    {
      title: 'Pathologies',
      count: 78,
      color: 'from-red-500 to-pink-500', 
      icon: TrendingUp,
      description: 'Maladies et syndromes'
    },
    {
      title: 'Thérapeutiques',
      count: 32,
      color: 'from-green-500 to-emerald-500',
      icon: Users,
      description: 'Traitements et protocoles'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Items EDN Rang B
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Approfondissez vos connaissances avec les items de Rang B et leur transformation musicale
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="card card-hover text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${category.color} rounded-full mb-4`}>
              <category.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {category.title}
            </h3>
            <p className="text-gray-600 mb-3">
              {category.description}
            </p>
            <div className="text-2xl font-bold text-primary-600 mb-4">
              {category.count} items
            </div>
            <button className="btn-primary w-full">
              Explorer
            </button>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="card bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <BookOpen className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          Contenu Rang B en préparation
        </h3>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          Nos équipes travaillent activement sur la création du contenu pédagogique 
          pour les items de Rang B. Bientôt disponible avec génération musicale intégrée !
        </p>
        <div className="flex justify-center space-x-4">
          <button className="btn-secondary">
            Me notifier
          </button>
          <button className="btn-primary">
            Voir la roadmap
          </button>
        </div>
      </div>
    </div>
  )
}
