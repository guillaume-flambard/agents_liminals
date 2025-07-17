#!/usr/bin/env node

/**
 * Script de déploiement des workflows n8n améliorés v2
 * ===================================================
 * 
 * Ce script remplace les workflows existants par les versions améliorées
 * avec validation, gestion d'erreurs et optimisations
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const N8N_CONFIG = {
  host: 'n8n.memoapp.eu',
  port: 443,
  auth: {
    user: process.env.N8N_BASIC_AUTH_USER || 'admin',
    password: process.env.N8N_BASIC_AUTH_PASSWORD
  }
};

const WORKFLOWS_DIR = path.join(__dirname, '../workflows-n8n-improved');
const BACKUP_DIR = path.join(__dirname, '../workflows-n8n-backup');

// Mapping des workflows améliorés
const IMPROVED_WORKFLOWS = {
  "L'Accordeur de Sens - Agent Liminal v2.json": {
    originalName: "L'Accordeur de Sens - Agent Liminal",
    agent: 'accordeur',
    improvements: [
      'Validation des entrées',
      'Gestion d\'erreurs robuste',
      'Traitement contextuel (heure, intensité)',
      'Sécurité renforcée (détection suicide)',
      'Limite de mots stricte',
      'Métadonnées enrichies'
    ]
  },
  "Le Peseur d'Ambigus - Agent Liminal v2.json": {
    originalName: "Le Peseur d'Ambigus - Agent Liminal",
    agent: 'peseur',
    improvements: [
      'Validation des entrées',
      'Gestion d\'erreurs robuste',
      'Détection de choix/dilemme',
      'Adaptation temporelle (urgence/nuit)',
      'Sécurité renforcée',
      'Métadonnées enrichies'
    ]
  },
  "Le Denoueur - Agent Liminal v2.json": {
    originalName: "Le denoueur-Tensions - Agent Liminal",
    agent: 'denoueur',
    improvements: [
      'Validation des entrées',
      'Gestion d\'erreurs robuste',
      'Détection de tensions/conflits',
      'Adaptation contextuelle (relationnel/interne)',
      'Sécurité renforcée (violence/nuit)',
      'Métadonnées enrichies'
    ]
  },
  "L'Evideur - Agent Liminal v2.json": {
    originalName: "l'evideur - Agent Liminal",
    agent: 'evideur',
    improvements: [
      'Validation des entrées',
      'Gestion d\'erreurs robuste',
      'Détection type surcharge (mental/émotionnel/tâches)',
      'Adaptation temporelle (urgence/nuit)',
      'Sécurité renforcée (burnout/épuisement)',
      'Métadonnées enrichies'
    ]
  },
  "L'Habitant du Creux - Agent Liminal v2.json": {
    originalName: "L'Habitant du Creux - Agent Liminal",
    agent: 'habitant',
    improvements: [
      'Validation des entrées',
      'Gestion d\'erreurs robuste',
      'Détection type de vide (émotionnel/sens/social/créatif)',
      'Adaptation contextuelle (profondeur/renouveau)',
      'Sécurité renforcée (isolement/vide existentiel)',
      'Métadonnées enrichies'
    ]
  }
};

/**
 * Effectue une requête HTTPS avec authentification basique
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${N8N_CONFIG.auth.user}:${N8N_CONFIG.auth.password}`).toString('base64');
    
    const requestOptions = {
      hostname: N8N_CONFIG.host,
      port: N8N_CONFIG.port,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Récupère tous les workflows existants
 */
async function getExistingWorkflows() {
  console.log('🔍 Récupération des workflows existants...');
  
  try {
    const response = await makeRequest({
      path: '/api/v1/workflows',
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Erreur API n8n: ${response.statusCode}`);
    }

    return response.data.data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des workflows:', error.message);
    return [];
  }
}

/**
 * Sauvegarde un workflow existant
 */
async function backupWorkflow(workflow) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const backupPath = path.join(BACKUP_DIR, `${workflow.name}_backup_${Date.now()}.json`);
  
  try {
    fs.writeFileSync(backupPath, JSON.stringify(workflow, null, 2));
    console.log(`💾 Sauvegarde créée: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Erreur sauvegarde ${workflow.name}:`, error.message);
    return null;
  }
}

/**
 * Déploie un workflow amélioré
 */
async function deployImprovedWorkflow(workflowFile, existingWorkflows) {
  const workflowPath = path.join(WORKFLOWS_DIR, workflowFile);
  const workflowConfig = IMPROVED_WORKFLOWS[workflowFile];
  
  if (!workflowConfig) {
    console.log(`⚠️  Configuration manquante pour ${workflowFile}`);
    return { success: false, error: 'Configuration manquante' };
  }

  console.log(`\n🚀 Déploiement de ${workflowConfig.originalName} v2...`);
  
  try {
    // Charger le workflow amélioré
    const improvedWorkflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Trouver le workflow existant
    const existingWorkflow = existingWorkflows.find(w => 
      w.name === workflowConfig.originalName || 
      w.name.includes(workflowConfig.agent)
    );

    if (existingWorkflow) {
      // Sauvegarder l'ancien workflow
      console.log(`💾 Sauvegarde de l'ancien workflow...`);
      await backupWorkflow(existingWorkflow);
      
      // Mettre à jour le workflow existant
      console.log(`🔄 Mise à jour du workflow existant (ID: ${existingWorkflow.id})`);
      
      const response = await makeRequest({
        path: `/api/v1/workflows/${existingWorkflow.id}`,
        method: 'PUT'
      }, {
        ...improvedWorkflow,
        id: existingWorkflow.id,
        active: true
      });

      if (response.statusCode === 200) {
        console.log(`✅ Workflow mis à jour avec succès`);
        console.log(`📊 Améliorations apportées:`);
        workflowConfig.improvements.forEach(improvement => {
          console.log(`   • ${improvement}`);
        });
        
        return { success: true, workflow: response.data, action: 'updated' };
      } else {
        throw new Error(`Erreur ${response.statusCode}: ${JSON.stringify(response.data)}`);
      }
    } else {
      // Créer un nouveau workflow
      console.log(`✨ Création d'un nouveau workflow`);
      
      const response = await makeRequest({
        path: '/api/v1/workflows',
        method: 'POST'
      }, {
        ...improvedWorkflow,
        active: true
      });

      if (response.statusCode === 201) {
        console.log(`✅ Nouveau workflow créé avec succès`);
        return { success: true, workflow: response.data, action: 'created' };
      } else {
        throw new Error(`Erreur ${response.statusCode}: ${JSON.stringify(response.data)}`);
      }
    }
  } catch (error) {
    console.error(`❌ Erreur déploiement ${workflowFile}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Active un workflow
 */
async function activateWorkflow(workflowId, workflowName) {
  console.log(`🔋 Activation du workflow: ${workflowName}...`);
  
  try {
    const response = await makeRequest({
      path: `/api/v1/workflows/${workflowId}/activate`,
      method: 'POST'
    });

    if (response.statusCode === 200) {
      console.log(`✅ Workflow ${workflowName} activé`);
      return true;
    } else {
      console.error(`❌ Erreur activation ${workflowName}: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur activation ${workflowName}:`, error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Déploiement des workflows n8n améliorés v2');
  console.log('=' .repeat(60));

  // Vérifier que le répertoire des workflows améliorés existe
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error(`❌ Répertoire des workflows améliorés non trouvé: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  // Lire les fichiers de workflows améliorés
  const improvedFiles = fs.readdirSync(WORKFLOWS_DIR)
    .filter(file => file.endsWith('.json') && IMPROVED_WORKFLOWS[file]);

  if (improvedFiles.length === 0) {
    console.error('❌ Aucun workflow amélioré trouvé');
    process.exit(1);
  }

  console.log(`📁 ${improvedFiles.length} workflows améliorés trouvés:`);
  improvedFiles.forEach(file => {
    const config = IMPROVED_WORKFLOWS[file];
    console.log(`   - ${config.originalName} → v2 (${config.agent})`);
  });
  console.log();

  // Récupérer les workflows existants
  const existingWorkflows = await getExistingWorkflows();
  console.log(`📋 ${existingWorkflows.length} workflows existants sur n8n\\n`);

  // Déployer chaque workflow amélioré
  const results = [];
  
  for (const file of improvedFiles) {
    const result = await deployImprovedWorkflow(file, existingWorkflows);
    results.push({ file, ...result });
    
    if (result.success) {
      // Activer le workflow
      await activateWorkflow(result.workflow.id, result.workflow.name);
    }
    
    // Pause entre les déploiements
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Résumé des résultats
  console.log('\\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DU DÉPLOIEMENT');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const updated = results.filter(r => r.action === 'updated').length;
  const created = results.filter(r => r.action === 'created').length;

  console.log(`✅ Réussis: ${successful}`);
  console.log(`❌ Échecs: ${failed}`);
  console.log(`🔄 Mis à jour: ${updated}`);
  console.log(`✨ Créés: ${created}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\\n❌ Workflows en échec:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
  }

  if (successful > 0) {
    console.log('\\n✅ Workflows déployés avec succès:');
    results.filter(r => r.success).forEach(r => {
      const config = IMPROVED_WORKFLOWS[r.file];
      console.log(`   - ${config.originalName} v2 (${r.action})`);
    });
  }

  console.log('\\n🎉 Déploiement terminé!');
  
  // Afficher les URLs des webhooks
  console.log('\\n🔗 URLs des webhooks v2:');
  Object.values(IMPROVED_WORKFLOWS).forEach(config => {
    console.log(`   ${config.agent}: https://n8n.memoapp.eu/webhook/${config.agent}`);
  });

  console.log('\\n📈 Nouvelles fonctionnalités disponibles:');
  console.log('   • Validation robuste des entrées');
  console.log('   • Gestion d\\'erreurs complète');
  console.log('   • Adaptation contextuelle (heure, intensité)');
  console.log('   • Sécurité renforcée');
  console.log('   • Métadonnées enrichies pour analytics');
  console.log('   • Limites de mots strictes');

  process.exit(failed > 0 ? 1 : 0);
}

// Vérifier les variables d'environnement
if (!N8N_CONFIG.auth.password) {
  console.error('❌ Variable d\\'environnement N8N_BASIC_AUTH_PASSWORD requise');
  process.exit(1);
}

// Lancer le script
main().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});