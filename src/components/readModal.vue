<template>
  <div class="modal fade" tabindex="-1" ref="viewModalRoot">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Employee Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="viewEmployee">
          <p>
            <b>Name:</b> {{ viewEmployee.last_name }}, {{ viewEmployee.first_name }}
            {{ viewEmployee.middle_name }}
          </p>
          <p><b>Department:</b> {{ viewEmployee.department }}</p>
          <p><b>Position:</b> {{ viewEmployee.position }}</p>
          <p><b>Mobile:</b> {{ viewEmployee.mobile_number }}</p>
        </div>
        <div class="modal-body" v-else>
          <p><i class="pi pi-spin pi-spinner"></i></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'

const viewEmployee = ref(null)
const viewModalRoot = ref(null)
let viewModal = null
const router = useRouter()

function showEmployee(employee) {
  viewEmployee.value = employee
  if (!viewModal && viewModalRoot.value) {
    viewModal = new Modal(viewModalRoot.value)
    viewModalRoot.value.addEventListener('hidden.bs.modal', () => {
      viewEmployee.value = null
      router.push({ query: {} })
    })
  }
  viewModal?.show()
}

defineExpose({ showEmployee })
</script>
