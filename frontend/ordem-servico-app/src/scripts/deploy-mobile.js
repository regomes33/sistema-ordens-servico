const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

console.log(`${colors.bright}${colors.blue}===== Iniciando deploy para dispositivos móveis =====${colors.reset}\n`);

// Verificar se a pasta dist existe
if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
  console.log(`${colors.yellow}A pasta dist não foi encontrada. Realizando build do projeto...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}Build concluído com sucesso!${colors.reset}\n`);
} else {
  console.log(`${colors.green}Pasta dist encontrada. Continuando deploy...${colors.reset}\n`);
}

// Sincronizar com Capacitor
console.log(`${colors.magenta}Sincronizando com Capacitor...${colors.reset}`);
execSync('npx cap sync', { stdio: 'inherit' });
console.log(`${colors.green}Sincronização concluída!${colors.reset}\n`);

// Perguntar qual plataforma abrir
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`${colors.bright}Escolha a plataforma para abrir:${colors.reset}`);
console.log('1. Android');
console.log('2. iOS');
console.log('3. Ambas');
console.log('4. Nenhuma (apenas sincronizar)');

readline.question('Opção: ', (option) => {
  switch (option) {
    case '1':
      console.log(`${colors.magenta}Abrindo projeto Android...${colors.reset}`);
      execSync('npx cap open android', { stdio: 'inherit' });
      break;
    case '2':
      console.log(`${colors.magenta}Abrindo projeto iOS...${colors.reset}`);
      execSync('npx cap open ios', { stdio: 'inherit' });
      break;
    case '3':
      console.log(`${colors.magenta}Abrindo projeto Android...${colors.reset}`);
      execSync('npx cap open android', { stdio: 'inherit' });
      console.log(`${colors.magenta}Abrindo projeto iOS...${colors.reset}`);
      execSync('npx cap open ios', { stdio: 'inherit' });
      break;
    case '4':
      console.log(`${colors.green}Sincronização concluída. Nenhum projeto foi aberto.${colors.reset}`);
      break;
    default:
      console.log(`${colors.yellow}Opção inválida. Nenhum projeto foi aberto.${colors.reset}`);
  }
  
  console.log(`${colors.bright}${colors.green}===== Deploy concluído com sucesso! =====${colors.reset}`);
  readline.close();
});