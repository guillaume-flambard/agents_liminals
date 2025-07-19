'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

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
      const response = await fetch('/api/consultations/stats?user=true')
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
        toast.success('Profil mis à jour avec succès', {
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #334155',
          },
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la mise à jour', {
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #dc2626',
          },
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour', {
        style: {
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid #dc2626',
        },
      })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas', {
        style: {
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid #dc2626',
        },
      })
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
        toast.success('Mot de passe modifié avec succès', {
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #16a34a',
          },
        })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordForm(false)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors du changement de mot de passe', {
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #dc2626',
          },
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du changement de mot de passe', {
        style: {
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid #dc2626',
        },
      })
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-slate-900"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-300/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        <div className="relative text-foreground font-serif">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-serif">
      {/* Background cosmique avec étoiles */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-slate-900"></div>
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-card/60 backdrop-blur-md rounded-lg border border-slate-700/50 p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Profil de l'Observateur</h1>
                <p className="text-foreground/70">Vos informations dans l'Observatoire des Liminals</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'Observatoire
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations du profil */}
            <div className="lg:col-span-2 bg-card/60 backdrop-blur-md rounded-lg border border-slate-700/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Informations Personnelles</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-foreground/70 mb-2">Nom</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-background/50 border border-slate-600/50 rounded-lg px-4 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-foreground/70 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-background/50 border border-slate-600/50 rounded-lg px-4 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Sauvegarder
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 border border-slate-600/30 px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-foreground/70 mb-1">Nom</label>
                    <p className="text-foreground text-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-foreground/70 mb-1">Email</label>
                    <p className="text-foreground text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-foreground/70 mb-1">Observateur depuis</label>
                    <p className="text-foreground text-lg">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-foreground/70 mb-1">Dernière observation</label>
                    <p className="text-foreground text-lg">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Première visite'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="bg-card/60 backdrop-blur-md rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Observations & Interactions</h2>
              {stats ? (
                <div className="space-y-4">
                  <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4 transition-all duration-300 hover:bg-blue-600/30">
                    <div className="text-2xl font-bold text-blue-300">{stats.totalConsultations}</div>
                    <div className="text-foreground/70">Interactions totales</div>
                  </div>
                  <div className="bg-cyan-600/20 border border-cyan-600/30 rounded-lg p-4 transition-all duration-300 hover:bg-cyan-600/30">
                    <div className="text-2xl font-bold text-cyan-300">{stats.consultationsThisMonth}</div>
                    <div className="text-foreground/70">Ce cycle lunaire</div>
                  </div>
                  {stats.favoriteAgent && (
                    <div className="bg-primary/20 border border-primary/30 rounded-lg p-4 transition-all duration-300 hover:bg-primary/30">
                      <div className="text-lg font-bold text-primary">{stats.favoriteAgent}</div>
                      <div className="text-foreground/70">Agent de prédilection</div>
                    </div>
                  )}
                  {stats.lastConsultation && (
                    <div className="bg-slate-600/20 border border-slate-600/30 rounded-lg p-4 transition-all duration-300 hover:bg-slate-600/30">
                      <div className="text-sm font-medium text-slate-300">
                        {new Date(stats.lastConsultation).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-foreground/70">Dernière connexion</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-foreground/70">Aucune observation enregistrée</div>
              )}
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-card/60 backdrop-blur-md rounded-lg border border-slate-700/50 p-6 mt-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Sécurité & Session</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/30 px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                {showPasswordForm ? 'Annuler' : 'Modifier les Codes d\'Accès'}
              </button>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-foreground/70 mb-2">Code d'accès actuel</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-background/50 border border-slate-600/50 rounded-lg px-4 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-foreground/70 mb-2">Nouveau code d'accès</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-background/50 border border-slate-600/50 rounded-lg px-4 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-foreground/70 mb-2">Confirmer le nouveau code</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-background/50 border border-slate-600/50 rounded-lg px-4 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Actualiser les Codes
                  </button>
                </form>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Quitter l'Observatoire
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  )
}