<template>
    <div class="relatorio-clientes">
      <h3>Relatório de Clientes</h3>
      
      <div class="filtros mb-4">
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Data Inicial</label>
              <input type="date" v-model="filtros.dataInicial" class="form-control" @change="buscarDados" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Data Final</label>
              <input type="date" v-model="filtros.dataFinal" class="form-control" @change="buscarDados" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Status do Cliente</label>
              <select v-model="filtros.status" class="form-control" @change="buscarDados">
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Ordenar por</label>
              <select v-model="filtros.ordenacao" class="form-control" @change="buscarDados">
                <option value="nome">Nome</option>
                <option value="data_cadastro">Data de Cadastro</option>
                <option value="total_compras">Total de Compras</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  
      <div v-if="carregando" class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>
  
      <div v-else>
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Resumo</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <h6>Total de Clientes</h6>
                    <h2>{{ resumo.totalClientes }}</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <h6>Novos Clientes</h6>
                    <h2>{{ resumo.novosClientes }}</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <h6>Ticket Médio</h6>
                    <h2>R$ {{ resumo.ticketMedio.toFixed(2) }}</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <h6>Taxa de Retenção</h6>
                    <h2>{{ resumo.taxaRetencao.toFixed(2) }}%</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Lista de Clientes</h5>
            <button class="btn btn-success" @click="exportarCSV">
              <i class="fas fa-file-export"></i> Exportar CSV
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th @click="ordenarPor('nome')">Nome 
                      <i v-if="filtros.ordenacao === 'nome'" class="fas fa-sort-down"></i>
                    </th>
                    <th @click="ordenarPor('email')">Email</th>
                    <th @click="ordenarPor('data_cadastro')">Data de Cadastro
                      <i v-if="filtros.ordenacao === 'data_cadastro'" class="fas fa-sort-down"></i>
                    </th>
                    <th @click="ordenarPor('total_compras')">Total de Compras
                      <i v-if="filtros.ordenacao === 'total_compras'" class="fas fa-sort-down"></i>
                    </th>
                    <th @click="ordenarPor('ultima_compra')">Última Compra</th>
                    <th @click="ordenarPor('status')">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cliente in clientes" :key="cliente.id">
                    <td>{{ cliente.nome }}</td>
                    <td>{{ cliente.email }}</td>
                    <td>{{ formatarData(cliente.data_cadastro) }}</td>
                    <td>R$ {{ cliente.total_compras.toFixed(2) }}</td>
                    <td>{{ formatarData(cliente.ultima_compra) }}</td>
                    <td>
                      <span :class="cliente.status === 'ativo' ? 'badge badge-success' : 'badge badge-danger'">
                        {{ cliente.status === 'ativo' ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div v-if="clientes.length === 0" class="text-center my-4">
              <p>Nenhum cliente encontrado com os filtros atuais.</p>
            </div>
  
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                <span>Mostrando {{ clientes.length }} de {{ totalRegistros }} clientes</span>
              </div>
              <nav aria-label="Paginação">
                <ul class="pagination">
                  <li class="page-item" :class="{ disabled: paginaAtual === 1 }">
                    <a class="page-link" href="#" @click.prevent="paginaAnterior">Anterior</a>
                  </li>
                  <li v-for="pagina in totalPaginas" :key="pagina"
                      class="page-item" :class="{ active: pagina === paginaAtual }">
                    <a class="page-link" href="#" @click.prevent="mudarPagina(pagina)">{{ pagina }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: paginaAtual === totalPaginas }">
                    <a class="page-link" href="#" @click.prevent="proximaPagina">Próximo</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
  
      <div class="card mt-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Gráficos</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <canvas ref="clientesPorMes"></canvas>
            </div>
            <div class="col-md-6">
              <canvas ref="comprasPorCliente"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { Chart } from 'chart.js/auto'
  
  export default {
    name: 'RelatorioClientes',
    props: {
      data: {
        type: Object,
        default: () => ({
          totalClientes: 0,
          clientesPorMes: [],
          // outros dados necessários com valores padrão
        })
      },
      loading: {
        type: Boolean,
        default: false
      },
      search: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        carregando: true,
        filtros: {
          dataInicial: this.getInicioMes(),
          dataFinal: this.getFimMes(),
          status: '',
          ordenacao: 'nome'
        },
        clientes: [],
        resumo: {
          totalClientes: 0,
          novosClientes: 0,
          ticketMedio: 0,
          taxaRetencao: 0
        },
        paginaAtual: 1,
        itensPorPagina: 10,
        totalRegistros: 0,
        totalPaginas: 1,
        graficos: {
          clientesPorMes: null,
          comprasPorCliente: null
        },
        dadosClientes: {
          totalClientes: 0,
          clientesAtivos: 0,
          valorTotal: 0,
          mediaServicos: 0
        },
        error: null
      };
    },
    async created() {
      await this.carregarDados();
    },
    mounted() {
      this.buscarDados();
    },
    methods: {
      getInicioMes() {
        const data = new Date();
        data.setDate(1);
        return data.toISOString().split('T')[0];
      },
      getFimMes() {
        const data = new Date();
        data.setMonth(data.getMonth() + 1);
        data.setDate(0);
        return data.toISOString().split('T')[0];
      },
      async buscarDados() {
        this.carregando = true;
        
        try {
          // Verificar se os filtros são válidos
          if (!this.filtros.dataInicial || !this.filtros.dataFinal) {
            throw new Error('Datas de filtro inválidas');
          }

          const response = await axios.get('/api/relatorios/clientes/', {
            params: {
              data_inicial: this.filtros.dataInicial,
              data_final: this.filtros.dataFinal,
              status: this.filtros.status,
              ordenacao: this.filtros.ordenacao,
              pagina: this.paginaAtual,
              itens_por_pagina: this.itensPorPagina
            }
          });
  
          this.clientes = response.data.clientes;
          this.resumo = response.data.resumo;
          this.totalRegistros = response.data.total_registros;
          this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
  
          // Carregar dados para os gráficos
          await this.carregarGraficos();
        } catch (error) {
          console.error('Erro ao buscar dados do relatório de clientes:', error);
          this.$toast.error('Erro ao buscar dados do relatório de clientes');
        } finally {
          this.carregando = false;
        }
      },
      async carregarGraficos() {
        try {
          if (this.data) {
            await this.criarGraficoClientesPorMes();
          }
        } catch (error) {
          console.error('Erro ao carregar dados dos gráficos:', error);
        }
      },
      async criarGraficoClientesPorMes() {
        // Verificar se os dados existem antes de criar o gráfico
        if (!this.data || !this.data.clientesPorMes || !this.$refs.clientesPorMes) {
          console.warn('Dados ou referência do canvas não disponíveis');
          return;
        }

        // Destruir gráfico existente se houver
        if (this.graficos.clientesPorMes) {
          this.graficos.clientesPorMes.destroy();
        }

        try {
          const ctx = this.$refs.clientesPorMes.getContext('2d');
          this.graficos.clientesPorMes = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: this.data.clientesPorMes.map(item => item.mes),
              datasets: [{
                label: 'Novos Clientes por Mês',
                data: this.data.clientesPorMes.map(item => item.quantidade),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Novos Clientes por Mês'
                },
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Quantidade'
                  }
                }
              }
            }
          });
        } catch (error) {
          console.error('Erro ao criar gráfico:', error);
        }
      },
      criarGraficoComprasPorCliente(dados) {
        // Destruir gráfico existente se houver
        if (this.graficos.comprasPorCliente) {
          this.graficos.comprasPorCliente.destroy();
        }
  
        const ctx = this.$refs.comprasPorCliente.getContext('2d');
        this.graficos.comprasPorCliente = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['1 compra', '2-5 compras', '6-10 compras', 'Mais de 10 compras'],
            datasets: [{
              data: [
                dados.uma_compra,
                dados.duas_a_cinco,
                dados.seis_a_dez,
                dados.mais_de_dez
              ],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Distribuição de Compras por Cliente'
              },
              legend: {
                position: 'right'
              }
            }
          }
        });
      },
      formatarData(data) {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
      },
      ordenarPor(campo) {
        this.filtros.ordenacao = campo;
        this.buscarDados();
      },
      paginaAnterior() {
        if (this.paginaAtual > 1) {
          this.paginaAtual--;
          this.buscarDados();
        }
      },
      proximaPagina() {
        if (this.paginaAtual < this.totalPaginas) {
          this.paginaAtual++;
          this.buscarDados();
        }
      },
      mudarPagina(pagina) {
        if (pagina !== this.paginaAtual) {
          this.paginaAtual = pagina;
          this.buscarDados();
        }
      },
      exportarCSV() {
      // Preparar os dados para o CSV
      const cabecalho = ['Nome', 'Email', 'Data de Cadastro', 'Total de Compras', 'Última Compra', 'Status'];
      
      // Converter os dados dos clientes para o formato CSV
      const linhas = this.clientes.map(cliente => [
        cliente.nome,
        cliente.email,
        this.formatarData(cliente.data_cadastro),
        `R$ ${cliente.total_compras.toFixed(2)}`,
        this.formatarData(cliente.ultima_compra),
        cliente.status === 'ativo' ? 'Ativo' : 'Inativo'
      ]);
      
      // Juntar o cabeçalho e os dados
      const conteudoCSV = [
        cabecalho.join(','),
        ...linhas.map(linha => linha.join(','))
      ].join('\n');
      
      // Criar um blob com o conteúdo CSV
      const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
      
      // Criar um link para download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Configurar o link de download
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-clientes-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      // Adicionar o link ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.$toast.success('Relatório exportado com sucesso!');
    },
    
    // Método para filtrar clientes por nome ou email
    filtrarClientes(termo) {
      if (!termo) {
        this.buscarDados();
        return;
      }
      
      this.carregando = true;
      
      axios.get('/api/relatorios/clientes/busca/', {
        params: {
          termo: termo,
          data_inicial: this.filtros.dataInicial,
          data_final: this.filtros.dataFinal,
          status: this.filtros.status
        }
      })
      .then(response => {
        this.clientes = response.data.clientes;
        this.totalRegistros = response.data.total_registros;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
      })
      .catch(error => {
        console.error('Erro ao buscar clientes:', error);
        this.$toast.error('Erro ao filtrar clientes');
      })
      .finally(() => {
        this.carregando = false;
      });
    },
    
    // Método para gerar relatório PDF
    gerarPDF() {
      this.carregando = true;
      
      axios.get('/api/relatorios/clientes/pdf/', {
        params: {
          data_inicial: this.filtros.dataInicial,
          data_final: this.filtros.dataFinal,
          status: this.filtros.status,
          ordenacao: this.filtros.ordenacao
        },
        responseType: 'blob'
      })
      .then(response => {
        // Criar um blob com o PDF retornado
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Criar um link para download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio-clientes-${new Date().toISOString().slice(0, 10)}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.$toast.success('PDF gerado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao gerar PDF:', error);
        this.$toast.error('Erro ao gerar relatório em PDF');
      })
      .finally(() => {
        this.carregando = false;
      });
    },
    
    // Método para atualizar o status de um cliente diretamente da tabela
    async atualizarStatusCliente(cliente, novoStatus) {
      try {
        await axios.patch(`/api/clientes/${cliente.id}/`, {
          status: novoStatus
        });
        
        // Atualizar o cliente localmente
        cliente.status = novoStatus;
        this.$toast.success(`Status do cliente alterado com sucesso!`);
        
        // Atualizar o resumo
        this.buscarDados();
      } catch (error) {
        console.error('Erro ao atualizar status do cliente:', error);
        this.$toast.error('Não foi possível alterar o status do cliente');
      }
    },
    
    // Método para visualizar detalhes de um cliente
    visualizarDetalhes(clienteId) {
      this.$router.push(`/clientes/${clienteId}`);
    },
    async carregarDados() {
      try {
        this.loading = true;
        const response = await this.$store.dispatch('relatorio/fetchRelatorioClientes');
        if (response && response.data) {
          this.dadosClientes = {
            totalClientes: response.data.total_clientes || 0,
            clientesAtivos: response.data.clientes_ativos || 0,
            valorTotal: response.data.valor_total || 0,
            mediaServicos: response.data.media_servicos || 0
          };
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        this.error = 'Erro ao carregar dados dos clientes';
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    data: {
      handler: 'carregarGraficos',
      immediate: true
    }
  }
};
</script>

<style scoped>
.relatorio-clientes {
  padding: 1rem;
}

.filtros {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
}

.card {
  margin-bottom: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  font-weight: 500;
}

table th {
  cursor: pointer;
}

table th:hover {
  background-color: #f0f0f0;
}

.badge {
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

canvas {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.85rem;
  }
  
  .row > div {
    margin-bottom: 1rem;
  }
}
</style>