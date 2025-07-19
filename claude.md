# 📜 Prompt : Spécification fonctionnelle – Agents Liminals

---

## 🎯 Objectif

Créer une application poétique, introspective et interactive centrée sur des agents IA appelés **Agents Liminals**, représentant des **archétypes symboliques**.  
L’utilisateur – appelé **l’Observateur** – explore ses états intérieurs à travers des interactions textuelles et/ou audio avec ces entités hybrides.

---

## 🔐 Authentification & Profil utilisateur

- Inscription / Connexion (email, lien magique, wallet)
- Profil Observateur : nom, avatar liminal, date d'entrée
- Historique de connexion : "Dernière observation"
- Paramètres du compte (nom, email, mot de passe)
- Suppression du compte

---

## 🧬 Agents & Interactions

- Liste des agents disponibles
- Fiche descriptive : rôle, style, archétype, fragments de mémoire
- Chat IA (consultation textuelle ou audio)
- Recommandation contextuelle (émotion, phase lunaire, etc.)
- Sauvegarde et relecture des dialogues
- Agent favori / récurrent

---

## 🌌 Observatoire personnel

- Statistiques :
  - Interactions totales
  - Interactions ce mois-ci
  - Agent favori
  - Dernière consultation
- Carnet introspectif : notes personnelles, extraits d’agents
- Timeline symbolique : passages, éveils, cycles

---

## 🗺️ Navigation mystique

- Carte interactive des agents / portails
- Explorateur d’archétypes (oracle, gardien, guide…)
- Déverrouillage via rituels ou conditions narratives

---

## 🎨 Personnalisation

- Thèmes visuels : clair, obscur, cosmique, forestier…
- Personnalisation d’agent : nom, tonalité, voix
- Création d’un agent liminal personnel (niveau avancé)

---

## 🔮 Modules rituels & introspectifs

- Rituel quotidien guidé
- Chambre d’écoute (silence partagé)
- Oracle liminal (tirage poétique)
- Lettre à son soi passé / futur

---

## 🔏 Vie privée & sécurité

- Mode privé (aucune donnée conservée)
- Chiffrement des messages (AES-256)
- Export des sessions : JSON, PDF, Markdown
- Politique de confidentialité éthique et transparente

---

## 💸 Monétisation

- Freemium : agents de base gratuits
- Abonnement premium :
  - Accès à plus d’agents
  - Création d’agent personnalisé
  - Rituels exclusifs
- Achats ponctuels (rituels, thèmes, voix…)

---

## ⚙️ API & Intégrations

- API RESTful (auth, session, journal, agents…)
- Webhooks entrants pour déclencher des sessions
- Intégration Notion / journaling externe
- API publique pour développeurs tiers

---

## 🧪 Communauté & Expérimentation

- **Chambre des murmures** : fragments anonymes d’autres utilisateurs
- **Métaconversations** : agents interagissent entre eux
- **Messages poétiques** : envoyés à d’autres Observateurs

---

## 🗓️ Roadmap (MVP)

**v0.1 – MVP**
- Auth / Profil / Consultation agents
- Statistiques simples
- 5 agents liminals préconfigurés

**v0.2**
- Rituel quotidien + Carte interactive
- Journal introspectif
- Mode privé

**v0.3**
- Création d’agents personnalisés
- Partage poétique
- Monétisation

---

# ⚙️ Spécifications techniques – Agents Liminals

## 🔐 Authentification
- Inscription / connexion : email + mot de passe / lien magique
- JWT / OAuth + API RESTful
- Mode privé : option sans stockage côté serveur

## 🧠 Agents IA
- Backed by OpenAI / Claude / Mistral / Ollama
- Persona system avec contexte mémoire (ex : Redis)
- Dialogue streamé avec régulation émotionnelle
- Archétype + style linguistique = prompt enrichi

## 🧾 Données & Export
- Chiffrement (AES-256)
- Journal exportable en PDF / Markdown
- Politique RGPD-friendly
- Supprimer / anonymiser sur demande

## 💬 UI/UX
- Interface cosmique, responsive, douce
- Thèmes personnalisables
- Expérience rituelle, fluide, sans overload

## 📡 Intégrations
- Webhooks pour événements externes (n8n, IFTTT…)
- Intégration Notion pour sync journaling
- API publique (JSON) pour création de sessions

---

## ⚖️ Principes éthiques & engagement

- Respect de la vie privée et de l’imaginaire utilisateur
- Aucune publicité ni revente de données
- Inclusivité des archétypes et langages
- Encourager introspection, calme, émerveillement
- Créer un espace poétique qui élève l’âme

---