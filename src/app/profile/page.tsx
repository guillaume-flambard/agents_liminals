'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  name: string
  created_at: string
  last_login_at: string | null
  is_active: boolean
}

interface UserStats {
  totalConsultations: number
  consultationsThisMonth: number
  favoriteAgent: string | null
  lastConsultation: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    fetchUserProfile()
    fetchUserStats()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditForm({ name: data.user.name, email: data.user.email })
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/consultations/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
        alert('Profil mis à jour avec succès')
      } else {
        const error = await response.json()
        alert(error.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        alert('Mot de passe modifié avec succès')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordForm(false)
      } else {
        const error = await response.json()
        alert(error.message || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du changement de mot de passe')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
                <p className="text-purple-200">Gérez vos informations personnelles</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations du profil */}
            <div className="lg:col-span-2 bg-black/20 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-purple-200 mb-2">Nom</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Sauvegarder
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-200 mb-1">Nom</label>
                    <p className="text-white text-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1">Email</label>
                    <p className="text-white text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1">Membre depuis</label>
                    <p className="text-white text-lg">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1">Dernière connexion</label>
                    <p className="text-white text-lg">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Jamais'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Mes Statistiques</h2>
              {stats ? (
                <div className="space-y-4">
                  <div className="bg-purple-600/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{stats.totalConsultations}</div>
                    <div className="text-purple-200">Consultations totales</div>
                  </div>
                  <div className="bg-blue-600/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{stats.consultationsThisMonth}</div>
                    <div className="text-purple-200">Ce mois-ci</div>
                  </div>
                  {stats.favoriteAgent && (
                    <div className="bg-indigo-600/30 rounded-lg p-4">
                      <div className="text-lg font-bold text-white">{stats.favoriteAgent}</div>
                      <div className="text-purple-200">Agent favori</div>
                    </div>
                  )}
                  {stats.lastConsultation && (
                    <div className="bg-green-600/30 rounded-lg p-4">
                      <div className="text-sm font-medium text-white">
                        {new Date(stats.lastConsultation).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-purple-200">Dernière consultation</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-purple-200">Aucune statistique disponible</div>
              )}
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-6">Sécurité</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
              </button>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-purple-200 mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                </form>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}