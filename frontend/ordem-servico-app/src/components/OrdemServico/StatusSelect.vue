<template>
  <v-select
    v-model="selectedStatus"
    :items="statusOptions"
    item-title="text"
    item-value="value"
    :label="label"
    @update:modelValue="$emit('update:modelValue', $event)"
  ></v-select>
</template>

<script>
export default {
  name: 'StatusSelect',
  
  props: {
    modelValue: String,
    label: {
      type: String,
      default: 'Status'
    }
  },

  data() {
    return {
      statusOptions: [
        { text: 'Orçamento', value: 'orcamento' },
        { text: 'Aprovado', value: 'aprovado' },
        { text: 'Em Andamento', value: 'em_andamento' },
        { text: 'Concluído', value: 'concluido' },
        { text: 'Cancelado', value: 'cancelado' }
      ]
    }
  },

  computed: {
    selectedStatus: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script> 