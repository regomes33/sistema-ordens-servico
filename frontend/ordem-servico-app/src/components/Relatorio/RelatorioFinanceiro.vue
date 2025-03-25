<template>
    <div class="relatorio-financeiro">
      <div class="filtros-adicionais">
        <div class="filtro">
          <label>Tipo:</label>
          <select v-model="filtrosInternos.tipo" @change="aplicarFiltros">
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
        <div class="filtro">
          <label>Categoria:</label>
          <select v-model="filtrosInternos.categoria" @change="aplicarFiltros">
            <option value="todas">Todas</option>
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
      
      <div class="resumo-dados" v-if="dadosFiltrados.length">
        <div class="card-resumo card-receitas">
          <h3>{{ formatarValor(totalReceitas) }}</h3>
          <p>Receitas</p>
        </div>
        <div class="card-resumo card-despesas">
          <h3>{{ formatarValor(totalDespesas) }}</h3>
          <p>Despesas</p>
        </div>
        <div class="card-resumo card-saldo">
          <h3>{{ formatarValor(saldo) }}</h3>
          <p>Saldo</p>
        </div>
      </div>
      
      <div v-if="carregando" class="carregando">
        <div class="spinner"></div>
        <p>Carregando dados...</p>
      </div>
      
      <div v-else-if="!dadosFiltrados.length" class="sem-dados">
        <p>Nenhum registro financeiro encontrado para o período selecionado.</p>
      </div>
      
      <div v-else class="conteudo-financeiro">
        <div class="tabs">
          <button 
            :class="['tab-btn', { active: visualizacao === 'tabela' }]" 
            @click="visualizacao = 'tabela'"
          >
            Tabela
          </button>
          <button 
            :class="['tab-btn', { active: visualizacao === 'grafico' }]" 
            @click="visualizacao = 'grafico'"
          >
            Gráficos
          </button>
        </div>
        
        <!-- Visualização de Tabela -->
        <div v-if="visualizacao === 'tabela'" class="tabela-container">
          <table class="tabela-dados">
            <thead>
              <tr>
                <th @click="ordenarPor('data')" class="ordenavel">
                  Data
                  <span v-if="ordenacao.campo === 'data'" :class="['seta', ordenacao.direcao]"></span>
                </th>
                <th @click="ordenarPor('descricao')" class="ordenavel">
                  Descrição
                  <span v-if="ordenacao.campo === 'descricao'" :class="['seta', ordenacao.direcao]"></span>
                </th>
                <th @click="ordenarPor('categoria')" class="ordenavel">
                  Categoria
                  <span v-if="ordenacao.campo === 'categoria'" :class="['seta', ordenacao.direcao]"></span>
                </th>
                <th @click="ordenarPor('tipo')" class="ordenavel">
                  Tipo
                  <span v-if="ordenacao.campo === 'tipo'" :class="['seta', ordenacao.direcao]"></span>
                </th>
                <th @click="ordenarPor('valor')" class="ordenavel">
                  Valor
                  <span v-if="ordenacao.campo === 'valor'" :class="['seta', ordenacao.direcao]"></span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in registrosOrdenados" :key="item.id" :class="{ 'tipo-receita': item.tipo === 'receita', 'tipo-despesa': item.tipo === 'despesa' }">
                <td>{{ formatarData(item.data) }}</td>
                <td>{{ item.descricao }}</td>
                <td>{{ item.categoria }}</td>
                <td>
                  <span class="tag-tipo" :class="'tipo-' + item.tipo">
                    {{ item.tipo === 'receita' ? 'Receita' : 'Despesa' }}
                  </span>
                </td>
                <td :class="{ 'valor-receita': item.tipo === 'receita', 'valor-despesa': item.tipo === 'despesa' }">
                  {{ formatarValor(item.valor) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="total-label">Saldo:</td>
                <td :class="{ 'valor-positivo': saldo >= 0, 'valor-negativo': saldo < 0 }">
                  {{ formatarValor(saldo) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- Visualização de Gráficos -->
        <div v-else-if="visualizacao === 'grafico'" class="graficos-container">
          <div class="grafico-card">
            <h3>Receitas vs Despesas</h3>
            <div class="grafico-barras">
              <div class="barras-grupo">
                <div class="barra-container">
                  <div class="barra barra-receita" :style="{ height: alturaBarraReceita + '%' }"></div>
                  <span class="barra-valor">{{ formatarValor(totalReceitas) }}</span>
                </div>
                <span class="barra-label">Receitas</span>
              </div>
              <div class="barras-grupo">
                <div class="barra-container">
                  <div class="barra barra-despesa" :style="{ height: alturaBarra(totalDespesas, maiorValor) + '%' }"></div>
                  <span class="barra-valor">{{ formatarValor(totalDespesas) }}</span>
                </div>
                <span class="barra-label">Despesas</span>
              </div>
              <div class="barras-grupo">
                <div class="barra-container">
                  <div 
                    class="barra" 
                    :class="{ 'barra-positivo': saldo >= 0, 'barra-negativo': saldo < 0 }"
                    :style="{ height: alturaBarra(Math.abs(saldo), maiorValor) + '%' }"
                  ></div>
                  <span class="barra-valor">{{ formatarValor(saldo) }}</span>
                </div>
                <span class="barra-label">Saldo</span>
              </div>
            </div>
          </div>
          
          <div class="grafico-card">
            <h3>Distribuição por Categoria</h3>
            <div class="categorias-distribuicao">
              <div 
                v-for="(valor, categoria) in valoresPorCategoria" 
                :key="categoria"
                class="categoria-item"
              >
                <div class="categoria-info">
                  <span class="categoria-nome">{{ categoria }}</span>
                  <span class="categoria-valor">{{ formatarValor(valor) }}</span>
                </div>
                <div class="categoria-barra-container">
                  <div 
                    class="categoria-barra"
                    :style="{ 
                      width: (valor / maiorValorCategoria * 100) + '%',
                      backgroundColor: corCategoria(categoria)
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="paginacao" v-if="totalPaginas > 1">
        <button 
          @click="mudarPagina(paginaAtual - 1)" 
          :disabled="paginaAtual === 1"
          class="btn-pagina"
        >
          &laquo; Anterior
        </button>
        
        <span class="info-pagina">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        
        <button 
          @click="mudarPagina(paginaAtual + 1)" 
          :disabled="paginaAtual === totalPaginas"
          class="btn-pagina"
        >
          Próxima &raquo;
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters } from 'vuex';
  import debounce from 'lodash/debounce';
  
  export default {
    name: 'RelatorioFinanceiro',
    props: {
      dados: {
        type: Array,
        default: () => []
      },
      filtros: {
        type: Object,
        default: () => ({})
      },
      carregando: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        filtrosInternos: {
          tipo: 'todos',
          categoria: 'todas'
        },
        ordenacao: {
          campo: 'data',
          direcao: 'desc'
        },
        paginaAtual: 1,
        itensPorPagina: 10,
        visualizacao: 'tabela',
        coresCategoria: {
          'Vendas': '#4CAF50',
          'Serviços': '#2196F3',
          'Salários': '#F44336',
          'Aluguel': '#FF9800',
          'Fornecedores': '#9C27B0',
          'Impostos': '#E91E63',
          'Outros': '#607D8B'
        }
      };
    },
    computed: {
      ...mapState('relatorios', ['metadados']),
      
      dadosFiltrados() {
        if (!this.dados.length) return [];
        
        return this.dados.filter(item => {
          // Filtragem por tipo
          if (this.filtrosInternos.tipo !== 'todos' && item.tipo !== this.filtrosInternos.tipo) {
            return false;
          }
          
          // Filtragem por categoria
          if (this.filtrosInternos.categoria !== 'todas' && item.categoria !== this.filtrosInternos.categoria) {
            return false;
          }
          
          return true;
        });
      },
      
      registrosOrdenados() {
        if (!this.dadosFiltrados.length) return [];
        
        const dados = [...this.dadosFiltrados];
        const { campo, direcao } = this.ordenacao;
        
        return dados.sort((a, b) => {
          let valorA = a[campo];
          let valorB = b[campo];
          
          if (campo === 'valor') {
            valorA = Number(valorA || 0);
            valorB = Number(valorB || 0);
          }
          
          if (campo === 'data') {
            valorA = new Date(valorA);
            valorB = new Date(valorB);
          }
          
          if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
          }
          
          if (direcao === 'asc') {
            return valorA > valorB ? 1 : -1;
          } else {
            return valorA < valorB ? 1 : -1;
          }
        });
      },
      
      totalReceitas() {
        return this.dadosFiltrados
          .filter(item => item.tipo === 'receita')
          .reduce((total, item) => total + Number(item.valor), 0);
      },
      
      totalDespesas() {
        return this.dadosFiltrados
          .filter(item => item.tipo === 'despesa')
          .reduce((total, item) => total + Number(item.valor), 0);
      },
      
      saldo() {
        return this.totalReceitas - this.totalDespesas;
      },
      
      totalPaginas() {
        return this.metadados.totalPaginas || 1;
      },
      
      categorias() {
        // Extrai todas as categorias únicas dos dados
        const todasCategorias = new Set();
        this.dados.forEach(item => {
          if (item.categoria) {
            todasCategorias.add(item.categoria);
          }
        });
        
        return [...todasCategorias];
      },
      
      valoresPorCategoria() {
        const valores = {};
        
        this.dadosFiltrados.forEach(item => {
          if (!valores[item.categoria]) {
            valores[item.categoria] = 0;
          }
          
          if (item.tipo === 'receita') {
            valores[item.categoria] += Number(item.valor);
          } else {
            valores[item.categoria] -= Number(item.valor);
          }
        });
        
        // Ordenar por valor (do maior para o menor)
        const ordenado = {};
        Object.keys(valores)
          .sort((a, b) => Math.abs(valores[b]) - Math.abs(valores[a]))
          .forEach(key => {
            ordenado[key] = valores[key];
          });
        
          return ordenado;
    },
    
    maiorValor() {
      return Math.max(this.totalReceitas, this.totalDespesas, Math.abs(this.saldo));
    },
    
    maiorValorCategoria() {
      if (!Object.keys(this.valoresPorCategoria).length) return 0;
      
      return Math.max(...Object.values(this.valoresPorCategoria).map(valor => Math.abs(valor)));
    },
    
    alturaBarraReceita() {
      return this.alturaBarra(this.totalReceitas, this.maiorValor);
    }
  },
  methods: {
    aplicarFiltros() {
      this.$emit('filtrar', { ...this.filtros, ...this.filtrosInternos });
    },
    
    aplicarFiltrosDebounce: debounce(function() {
      this.aplicarFiltros();
    }, 300),
    
    ordenarPor(campo) {
      if (this.ordenacao.campo === campo) {
        this.ordenacao.direcao = this.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
      } else {
        this.ordenacao.campo = campo;
        this.ordenacao.direcao = 'desc';
      }
    },
    
    mudarPagina(pagina) {
      if (pagina < 1 || pagina > this.totalPaginas) return;
      
      this.paginaAtual = pagina;
      this.$emit('filtrar', { 
        ...this.filtros, 
        ...this.filtrosInternos,
        pagina: this.paginaAtual,
        itensPorPagina: this.itensPorPagina
      });
    },
    
    formatarData(data) {
      if (!data) return '';
      
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR');
    },
    
    formatarValor(valor) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    },
    
    alturaBarra(valor, maximo) {
      if (!maximo) return 0;
      return (valor / maximo) * 100;
    },
    
    corCategoria(categoria) {
      return this.coresCategoria[categoria] || '#607D8B'; // Cinza como cor padrão
    }
  },
  created() {
    // Inicializa os filtros internos com base nos filtros recebidos via props
    if (this.filtros.tipo) {
      this.filtrosInternos.tipo = this.filtros.tipo;
    }
    
    if (this.filtros.categoria) {
      this.filtrosInternos.categoria = this.filtros.categoria;
    }
  }
};
</script>

<style scoped>
.relatorio-financeiro {
  width: 100%;
}

.filtros-adicionais {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filtro {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filtro select,
.filtro input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.resumo-dados {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.card-resumo {
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex: 1;
  min-width: 140px;
  text-align: center;
}

.card-receitas {
  background-color: #E8F5E9;
}

.card-receitas h3 {
  color: #4CAF50;
}

.card-despesas {
  background-color: #FFEBEE;
}

.card-despesas h3 {
  color: #F44336;
}

.card-saldo {
  background-color: #E3F2FD;
}

.card-saldo h3 {
  color: #2196F3;
}

.card-resumo h3 {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
}

.card-resumo p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  position: relative;
}

.tab-btn.active {
  color: #2196F3;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2196F3;
}

.tabela-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.tabela-dados {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.tabela-dados th, 
.tabela-dados td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.tabela-dados th {
  background-color: #f2f2f2;
  font-weight: 600;
}

.tabela-dados tbody tr:hover {
  background-color: #f9f9f9;
}

.ordenavel {
  cursor: pointer;
  position: relative;
}

.seta {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 5px;
  vertical-align: middle;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}

.seta.asc {
  border-bottom: 4px solid #333;
}

.seta.desc {
  border-top: 4px solid #333;
}

.tag-tipo {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
}

.tipo-receita, .tipo-receita .tag-tipo {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.tipo-despesa, .tipo-despesa .tag-tipo {
  background-color: #FFEBEE;
  color: #F44336;
}

.valor-receita {
  color: #4CAF50;
  font-weight: 500;
}

.valor-despesa {
  color: #F44336;
  font-weight: 500;
}

.valor-positivo {
  color: #4CAF50;
  font-weight: 600;
}

.valor-negativo {
  color: #F44336;
  font-weight: 600;
}

.total-label {
  text-align: right;
  font-weight: 600;
}

.graficos-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 30px;
}

.grafico-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px;
  background-color: #fff;
}

.grafico-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
  text-align: center;
}

.grafico-barras {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250px;
  padding-bottom: 30px;
}

.barras-grupo {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.barra-container {
  height: 200px;
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.barra {
  width: 60px;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.barra-receita {
  background-color: #4CAF50;
}

.barra-despesa {
  background-color: #F44336;
}

.barra-positivo {
  background-color: #2196F3;
}

.barra-negativo {
  background-color: #FF9800;
}

.barra-valor {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.barra-label {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
}

.categorias-distribuicao {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.categoria-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.categoria-info {
  display: flex;
  justify-content: space-between;
}

.categoria-nome {
  font-weight: 500;
}

.categoria-valor {
  font-weight: 500;
}

.categoria-barra-container {
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.categoria-barra {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.paginacao {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-pagina {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-pagina:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-pagina {
  color: #666;
}

.carregando {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #2196F3;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sem-dados {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

@media (max-width: 768px) {
  .filtros-adicionais {
    flex-direction: column;
  }
  
  .card-resumo {
    min-width: 100%;
  }
  
  .grafico-barras {
    height: 200px;
  }
  
  .barra-container {
    height: 150px;
    width: 40px;
  }
  
  .barra {
    width: 40px;
  }
  
  .barras-grupo {
    width: 60px;
  }
}
</style>