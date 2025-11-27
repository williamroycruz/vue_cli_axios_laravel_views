<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ViewModal from '@/components/readModal.vue'
import { Modal } from 'bootstrap'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

const form = reactive({
  id: null,
  last_name: '',
  first_name: '',
  middle_name: '',
  department: '',
  position: '',
  mobile_number: '',
})

const editForm = reactive({
  id: null,
  last_name: '',
  first_name: '',
  middle_name: '',
  department: '',
  position: '',
  mobile_number: '',
})
const originalEmployeeData = ref({})
const employees = ref([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const deptFilter = ref('')

const noMiddleAdd = ref(false)
const noMiddleEdit = ref(false)
let searchTimer = null
const selectedEmployees = ref([])
const limit = ref(5)
let modalInstance = null
const editModal = ref(null)
const viewModalRef = ref(null)
const toast = useToast()
const isMobileValid = ref(true)
const router = useRouter()
const route = useRoute()

const loadEmployees = async (p = 1) => {
  page.value = p

  try {
    const { data } = await axios.get('/api/employees', {
      params: {
        search: search.value,
        dept: deptFilter.value,
        page: page.value,
        limit: limit.value,
      },
    })
    if (data.success) {
      employees.value = data.data
      totalPages.value = data.totalPages

      for (const employee in employees.value) {
        employees.value[employee].middle_name =
          employees.value[employee].middle_name == 'N/A'
            ? ''
            : employees.value[employee].middle_name
      }
    } else {
      employees.value = []
    }
  } catch (err) {
    console.error('Failed to load employees', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load employees',
      life: 3000,
    })
  }
}

const addEmployee = async () => {
  try {
    await axios.post('/api/employees', {
      last_name: form.last_name,
      first_name: form.first_name,
      middle_name: form.middle_name || '',
      department: form.department,
      position: form.position,
      mobile_number: form.mobile_number,
    })
    toast.add({
      severity: 'success',
      summary: 'Created',
      detail: 'The employee was successfully added!',
      life: 2000,
    })

    await loadEmployees()
    resetForm()
  } catch (err) {
    console.error('Failed to add employee', err)
  }
}

const deleteEmployee = async (id) => {
  if (!confirm('Delete this employee?')) return
  router.push({ name: 'home' })
  try {
    await axios.post('/api/employees/delete', { id })
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'The employee was successfully deleted!',
      life: 2000,
    })
    await loadEmployees(page.value)
  } catch (err) {
    console.error(err)
  }
}

const viewEmployee = async (id) => {
  router.push({ name: 'employee-view', params: { id } })
  try {
    const { data } = await axios.get('/api/employees/fetch', {
      params: { id },
    })
    if (data.success) {
      const emp = data.data
      emp.middle_name = emp.middle_name === 'N/A' ? '' : emp.middle_name
      viewModalRef.value?.showEmployee(emp)
    }
  } catch (err) {
    console.error(err)
    router.push({ name: 'home' })
  }
}

const openEditModal = async (id) => {
  router.push({ name: 'employee-edit', params: { id } })
  try {
    const { data } = await axios.get('/api/employees/fetch', {
      params: { id },
    })
    if (data.success) {
      const emp = data.data
      noMiddleEdit.value = emp.middle_name === 'N/A'
      editForm.middle_name = noMiddleEdit.value ? 'N/A' : emp.middle_name
      Object.assign(editForm, emp)

      originalEmployeeData.value = {
        last_name: emp.last_name,
        first_name: emp.first_name,
        middle_name: emp.middle_name,
        department: emp.department,
        position: emp.position,
        mobile_number: emp.mobile_number,
      }

      modalInstance = new Modal(editModal.value)
      modalInstance.show()
    }
  } catch (err) {
    console.error(err)
    router.push({ name: 'home' })
  }
}

const updateEmployee = async () => {
  try {
    const hasChanges =
      editForm.last_name !== originalEmployeeData.value.last_name ||
      editForm.first_name !== originalEmployeeData.value.first_name ||
      editForm.middle_name !== originalEmployeeData.value.middle_name ||
      editForm.department !== originalEmployeeData.value.department ||
      editForm.position !== originalEmployeeData.value.position ||
      editForm.mobile_number !== originalEmployeeData.value.mobile_number

    if (!hasChanges) {
      modalInstance.hide()
      resetEditForm()
      return
    }
    await axios.post('/api/employees/update', {
      id: editForm.id,
      last_name: editForm.last_name,
      first_name: editForm.first_name,
      middle_name: editForm.middle_name || '',
      department: editForm.department,
      position: editForm.position,
      mobile_number: editForm.mobile_number,
    })
    modalInstance.hide()
    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Employee Details Updated!',
      life: 2000,
    })
    await loadEmployees(page.value)
    resetEditForm()
  } catch (err) {
    console.error(err)
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    last_name: '',
    first_name: '',
    middle_name: '',
    department: '',
    position: '',
    mobile_number: '',
  })
  noMiddleAdd.value = false
}
const resetEditForm = () => {
  Object.assign(editForm, {
    id: null,
    last_name: '',
    first_name: '',
    middle_name: '',
    department: '',
    position: '',
    mobile_number: '',
  })
  noMiddleEdit.value = false
  router.push({ name: 'home' })
}

const nextPage = () => {
  if (page.value < totalPages.value) loadEmployees(page.value + 1)
}
const prevPage = () => {
  if (page.value > 1) loadEmployees(page.value - 1)
}

// debounce
// watch([search, deptFilter], () => {
//   clearTimeout(searchTimer);

//   searchTimer = setTimeout(() => {
//     loadEmployees(1);
//   }, 1000);
// });

const checkAdd = () => {
  if (noMiddleAdd.value) {
    form.middle_name = 'N/A'
  } else {
    form.middle_name = ''
  }
}

const checkEdit = () => {
  if (noMiddleEdit.value) {
    editForm.middle_name = 'N/A'
  } else {
    editForm.middle_name = ''
  }
}

const isSelected = (id) => {
  return selectedEmployees.value.some((s) => s.id === id)
}

const toggleSelect = (e) => {
  const index = selectedEmployees.value.findIndex((s) => s.id === e.id)
  if (index > -1) {
    selectedEmployees.value.splice(index, 1)
  } else {
    const fullName = `${e.last_name}, ${e.first_name} ${e.middle_name ? e.middle_name : ''}`.trim()
    selectedEmployees.value.push({
      id: e.id,
      full_name: fullName,
    })
  }
}

const removeSelected = (id) => {
  const index = selectedEmployees.value.findIndex((s) => s.id === id)
  if (index > -1) selectedEmployees.value.splice(index, 1)
}

const batchDelete = async () => {
  const ids = selectedEmployees.value.map((s) => s.id)
  if (!confirm(`Delete ${ids.length} selected employee(s)?`)) return
  try {
    const fd = new FormData()
    fd.append('ids', JSON.stringify(ids))
    const { data } = await axios.post('/api/employees/delete-batch', { ids })
    if (data.status === 'success') {
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Successfully deleted employee/s',
        life: 2000,
      })
      selectedEmployees.value = []
      await loadEmployees(page.value)
    } else {
      alert('Error deleting selected rows!!!!')
    }
  } catch (err) {
    console.error(err)
  }
}

function validateMobile() {
  const number = /^[0-9]{10}$/
  isMobileValid.value = number.test(form.mobile_number)
}

onMounted(() => loadEmployees())

// if (editModal.value) {
//   editModal.value.addEventListener('hidden-bs-modal', () => {
//     router.push({ query: {} })
//     resetEditForm()
//   })
// }
</script>

<template>
  <div class="container-fluid px-3 py-3">
    <!-- add employee -->
    <div class="card mb-3">
      <div class="card-header"><h4>Add Employee</h4></div>
      <div class="card-body">
        <form @submit.prevent="addEmployee">
          <div class="row">
            <div class="col-md-4 mb-2">
              <div class="form-floating">
                <input
                  v-model="form.last_name"
                  type="text"
                  id="last_name"
                  class="form-control"
                  placeholder="Last Name"
                  required
                />
                <label for="last_name">Last Name</label>
              </div>
            </div>
            <div class="col-md-4 mb-2">
              <div class="form-floating">
                <input
                  v-model="form.first_name"
                  type="text"
                  id="first_name"
                  class="form-control"
                  placeholder="First Name"
                  required
                />
                <label for="first_name">First Name</label>
              </div>
            </div>
            <div class="col-md-4 mb-2">
              <div class="form-floating">
                <input
                  v-model="form.middle_name"
                  type="text"
                  id="middle_name"
                  class="form-control"
                  placeholder="Middle Name"
                />
                <label for="middle_name">Middle Name</label>
              </div>

              <div class="form-check mt-1">
                <input
                  v-model="noMiddleAdd"
                  type="checkbox"
                  class="form-check-input"
                  @change="checkAdd"
                />
                <label class="form-check-label">Check if N/A</label>
              </div>
            </div>
            <div class="col-md-4 mb-2">
              <select v-model="form.department" class="form-select" style="height: 93%" required>
                <option value="" disabled>Select Department</option>
                <option value="HR">HR</option>
                <option value="iHOMS">iHOMS</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div class="col-md-4 mb-2">
              <div class="form-floating">
                <input
                  v-model="form.position"
                  type="text"
                  class="form-control"
                  id="post"
                  placeholder="Position"
                  required
                />
                <label for="post">Position</label>
              </div>
            </div>

            <div class="col-md-4 mb-2">
              <div class="form-floating">
                <input
                  v-model="form.mobile_number"
                  type="tel"
                  class="form-control"
                  id="mobile"
                  placeholder="Mobile # (e.g. 9xx-xxx-xxxx)"
                  pattern="[0-9]{10}"
                  maxlength="10"
                  @input="validateMobile"
                  :class="{ 'is-invalid': !isMobileValid && form.mobile_number }"
                  required
                />
                <label for="mobile">Mobile # (9xx-xxx-xxxx)</label>
                <div class="invalid-feedback">Please enter a valid mobile number.</div>
              </div>
            </div>
          </div>
          <div class="d-flex flex-row gap-1">
            <button type="submit" class="btn btn-success"><i class="bi bi-plus-lg"></i></button>
            <button type="button" class="btn btn-danger" @click="resetForm">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- search -->
    <div class="card">
      <div class="card-header"><h6>Employee List</h6></div>
      <div class="card-body">
        <div class="d-flex gap-2 mb-2">
          <input
            v-model="search"
            @keyup.enter="loadEmployees(1)"
            class="form-control"
            placeholder="Search..."
          />
          <select
            v-model="deptFilter"
            @change="loadEmployees(1)"
            class="form-select"
            style="max-width: 200px"
          >
            <option value="">All Depts</option>
            <option value="HR">HR</option>
            <option value="iHOMS">iHOMS</option>
            <option value="Finance">Finance</option>
          </select>
          <select
            v-model="limit"
            @change="loadEmployees(1)"
            class="form-select"
            style="max-width: 70px"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>

          <button
            class="btn btn-danger"
            :disabled="selectedEmployees.length === 0"
            @click="batchDelete"
          >
            Delete
          </button>
        </div>
        <!-- badge -->
        <div class="d-flex flex-row w-100 gap-2 flex-wrap">
          <span v-for="emp in selectedEmployees" :key="emp.id" class="badge text-bg-secondary">
            {{ emp.full_name }}
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="removeSelected(emp.id)"
            ></button>
          </span>
        </div>

        <!-- table -->
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th><b>Select</b></th>
                <th><b>Full Name</b></th>
                <th><b>Department</b></th>
                <th><b>Position</b></th>
                <th class="text-center"><b>Actions</b></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="employees.length === 0">
                <td colspan="4" class="text-center">No Records Found</td>
              </tr>
              <tr v-for="e in employees" :key="e.id">
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="isSelected(e.id)"
                    @change="toggleSelect(e)"
                  />
                </td>
                <!-- checkbox for each rows -->
                <td>{{ e.last_name }}, {{ e.first_name }} {{ e.middle_name || '' }}</td>
                <td>{{ e.department }}</td>
                <td>{{ e.position }}</td>
                <td class="d-flex justify-content-center gap-1">
                  <button class="btn btn-info btn-sm" @click="viewEmployee(e.id)">
                    <i class="pi pi-eye"></i>
                  </button>
                  <button class="btn btn-warning btn-sm" @click="openEditModal(e.id)">
                    <i class="pi pi-user-edit"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteEmployee(e.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- pagination -->
        <div class="d-flex justify-content-center gap-2 mt-3">
          <button class="btn btn-secondary btn-sm" :disabled="page === 1" @click="prevPage">
            Prev
          </button>
          <span>Page {{ page }} / {{ totalPages }}</span>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="page === totalPages"
            @click="nextPage"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <ViewModal ref="viewModalRef" />

    <!-- edit modal -->
    <div class="modal fade" id="editModal" tabindex="-1" ref="editModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="updateEmployee">
            <div class="modal-header">
              <h4>Edit Employee</h4>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="resetEditForm"
              ></button>
            </div>
            <div class="modal-body">
              <input type="hidden" v-model="editForm.id" />
              <div class="mb-2">
                <div class="form-floating">
                  <input
                    v-model="editForm.last_name"
                    type="text"
                    id="editlast_name"
                    class="form-control"
                    placeholder="Last Name"
                    required
                  />
                  <label for="editlast_name">Last Name</label>
                </div>
              </div>
              <div class="mb-2">
                <div class="form-floating">
                  <input
                    v-model="editForm.first_name"
                    type="text"
                    id="editfirst_name"
                    class="form-control"
                    placeholder="First Name"
                    required
                  />
                  <label for="editfirst_name">First Name</label>
                </div>
              </div>
              <div class="mb-2">
                <div class="form-floating">
                  <input
                    v-model="editForm.middle_name"
                    type="text"
                    class="form-control"
                    id="editmiddle_name"
                    placeholder="Middle Name"
                    :readonly="noMiddleEdit"
                  />
                  <label for="editmiddle_name">Middle Name</label>
                </div>

                <div class="form-check mt-1">
                  <input
                    v-model="noMiddleEdit"
                    type="checkbox"
                    class="form-check-input"
                    @change="checkEdit"
                  />
                  <label class="form-check-label">Check if N/A </label>
                </div>
              </div>
              <div class="mb-2">
                <label>Department</label>
                <select
                  v-model="editForm.department"
                  class="form-select"
                  style="height: 93%"
                  required
                >
                  <option value="">Select</option>
                  <option value="HR">HR</option>
                  <option value="iHOMS">iHOMS</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div class="mb-2">
                <div class="form-floating">
                  <input
                    v-model="editForm.position"
                    type="text"
                    id="editposition"
                    class="form-control"
                    placeholder="Position"
                    required
                  />
                  <label for="editposition">Position</label>
                </div>
              </div>
              <div class="mb-2">
                <div class="form-floating">
                  <input
                    v-model="editForm.mobile_number"
                    type="text"
                    class="form-control"
                    pattern="[0-9]{10}"
                    maxlength="10"
                    id="editmobile"
                    placeholder="Mobile Number"
                    required
                  />
                  <label for="editmobiles">Mobile</label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-success">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Toast />
  </div>
  <!-- npm install primevue @primeuix/themes primeicons -->
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

#app {
  max-width: 100% !important;
  width: 100% !important;
}

.card {
  width: 100%;
}

.table-responsive {
  width: 100%;
}
</style>
