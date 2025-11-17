# 🏗️ Structure Monorepo ParkShare

Ce repository **parkshare-frontend** fait partie du monorepo ParkShare.

## 📦 Repositories du Projet

| Repository | Description | URL |
|-----------|-------------|-----|
| **parkshare-frontend** | Application Web Angular 18 | https://github.com/YousOuazizi/parkshare-frontend |
| **parkshare-backend** | API Backend NestJS | https://github.com/YousOuazizi/parkshare-backend |
| **parkshare-mobile** | Application Mobile Flutter | https://github.com/YousOuazizi/parkshare-mobile |
| **parkshare-ops** | DevOps & Infrastructure | https://github.com/YousOuazizi/parkshare-ops |

## 🔗 Dépendances

Ce frontend dépend de :
- **parkshare-backend** : Pour l'API REST (http://localhost:3000/api)
- **parkshare-ops** : Pour les configurations Docker et déploiement

## 🚀 Développement Local

### Avec le Backend
```bash
# Terminal 1 - Backend
cd parkshare-backend
npm run start:dev

# Terminal 2 - Frontend
cd parkshare-frontend
npm start
```

### Avec Docker
```bash
cd parkshare-ops
docker-compose -f docker-compose.dev.yml up
```

## 📚 Documentation Complète

Pour la documentation complète du monorepo, consultez :
- **Setup complet** : https://github.com/YousOuazizi/parkshare-ops/blob/main/SETUP_COMPLETE.md
- **Configuration GitHub** : https://github.com/YousOuazizi/parkshare-ops/blob/main/GITHUB_SETUP.md
- **Migration Info** : https://github.com/YousOuazizi/parkshare-ops/blob/main/MIGRATION_INFO.md

## 🎯 Démarrage Rapide

1. Clonez ce repo et le backend :
```bash
git clone https://github.com/YousOuazizi/parkshare-frontend.git
git clone https://github.com/YousOuazizi/parkshare-backend.git
```

2. Installez les dépendances :
```bash
cd parkshare-frontend
npm install

cd ../parkshare-backend
npm install
```

3. Démarrez les services :
```bash
# Backend
cd parkshare-backend
npm run start:dev

# Frontend (autre terminal)
cd parkshare-frontend
npm start
```

4. Accédez à l'application : http://localhost:4200

---

Pour toute question, consultez le README.md de ce repository ou la documentation dans parkshare-ops.
