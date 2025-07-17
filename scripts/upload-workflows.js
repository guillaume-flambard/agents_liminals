#!/usr/bin/env node

/**
 * Script d'upload des workflows n8n pour Agents Liminals
 * ======================================================
 * 
 * Ce script upload automatiquement tous les workflows des agents
 * vers l'instance n8n via l'API REST.
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

const WORKFLOWS_DIR = path.join(__dirname, '../workflows-n8n');

// Mapping des fichiers vers les noms d'agents
const WORKFLOW_MAPPING = {
  "L'Accordeur de Sens - Agent Liminal.json": 'accordeur',
  "Le Peseur d'Ambigus - Agent Liminal.json": 'peseur',
  "Le denoueur-Tensions - Agent Liminal.json": 'denoueur',
  "l'evideur - Agent Liminal.json": 'evideur',
  "L'Habitant du Creux - Agent Liminal.json": 'habitant'
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
 * Récupère la liste des workflows existants
 */
async function getExistingWorkflows() {
  console.log('🔍 Récupération des workflows existants...');
  
  try {
    const response = await makeRequest({
      path: '/api/v1/workflows',
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Erreur API n8n: ${response.statusCode} - ${JSON.stringify(response.data)}`);
    }

    return response.data.data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des workflows:', error.message);
    return [];
  }
}

/**
 * Upload ou met à jour un workflow
 */
async function uploadWorkflow(workflowData, existingWorkflows) {
  const agentName = WORKFLOW_MAPPING[workflowData.originalFileName] || 'unknown';
  const workflowName = `Agent Liminal - ${agentName}`;
  
  console.log(`📤 Upload du workflow: ${workflowName}...`);

  // Vérifier si le workflow existe déjà
  const existingWorkflow = existingWorkflows.find(w => 
    w.name === workflowName || w.name === workflowData.name
  );

  try {
    let response;
    
    if (existingWorkflow) {
      // Mettre à jour le workflow existant
      console.log(`🔄 Mise à jour du workflow existant (ID: ${existingWorkflow.id})`);
      
      response = await makeRequest({
        path: `/api/v1/workflows/${existingWorkflow.id}`,
        method: 'PUT'
      }, {
        ...workflowData,
        name: workflowName,
        active: true
      });
    } else {
      // Créer un nouveau workflow
      console.log(`✨ Création d'un nouveau workflow`);
      
      response = await makeRequest({
        path: '/api/v1/workflows',
        method: 'POST'
      }, {
        ...workflowData,
        name: workflowName,
        active: true
      });
    }

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✅ Workflow ${workflowName} uploadé avec succès`);
      return response.data;
    } else {
      throw new Error(`Erreur ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error(`❌ Erreur upload ${workflowName}:`, error.message);
    return null;
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
  console.log('🚀 Début de l\'upload des workflows n8n pour Agents Liminals');
  console.log('='.repeat(60));

  // Vérifier que le répertoire des workflows existe
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error(`❌ Répertoire des workflows non trouvé: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  // Lire les fichiers de workflows
  const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
    .filter(file => file.endsWith('.json'));

  if (workflowFiles.length === 0) {
    console.error('❌ Aucun fichier de workflow trouvé');
    process.exit(1);
  }

  console.log(`📁 ${workflowFiles.length} workflows trouvés:`);
  workflowFiles.forEach(file => console.log(`   - ${file}`));
  console.log();

  // Récupérer les workflows existants
  const existingWorkflows = await getExistingWorkflows();
  console.log(`📋 ${existingWorkflows.length} workflows existants sur n8n\n`);

  // Upload chaque workflow
  const results = [];
  
  for (const file of workflowFiles) {
    try {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      workflowData.originalFileName = file;

      const result = await uploadWorkflow(workflowData, existingWorkflows);
      
      if (result) {
        // Activer le workflow
        await activateWorkflow(result.id, result.name);
        results.push({ file, status: 'success', workflow: result });
      } else {
        results.push({ file, status: 'error', error: 'Upload failed' });
      }
      
      // Pause entre les uploads
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erreur lecture du fichier ${file}:`, error.message);
      results.push({ file, status: 'error', error: error.message });
    }
  }

  // Résumé des résultats
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE L\'UPLOAD');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log(`✅ Réussis: ${successful}`);
  console.log(`❌ Échecs: ${failed}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Workflows en échec:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
  }

  if (successful > 0) {
    console.log('\n✅ Workflows uploadés avec succès:');
    results.filter(r => r.status === 'success').forEach(r => {
      console.log(`   - ${r.file} → ${r.workflow.name} (ID: ${r.workflow.id})`);
    });
  }

  console.log('\n🎉 Upload terminé!');
  
  // Afficher les URLs des webhooks
  console.log('\n🔗 URLs des webhooks actifs:');
  Object.entries(WORKFLOW_MAPPING).forEach(([file, agent]) => {
    console.log(`   ${agent}: https://n8n.memoapp.eu/webhook/${agent}`);
  });

  process.exit(failed > 0 ? 1 : 0);
}

// Vérifier les variables d'environnement
if (!N8N_CONFIG.auth.password) {
  console.error('❌ Variable d\'environnement N8N_BASIC_AUTH_PASSWORD requise');
  process.exit(1);
}

// Lancer le script
main().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});