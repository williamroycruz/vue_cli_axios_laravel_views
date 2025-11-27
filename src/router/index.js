import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const routes = [
  {
    path: '/',
    component: App,
    children: [
      {
        path: '',
        name: 'home',
        // Default: Show list (App.vue handles this internally)
      },
      {
        path: 'view/:id',
        name: 'employee-view',
        // Triggers modal via query parameter
        beforeEnter: (to, from, next) => {
          // Convert route param to query for App.vue compatibility
          next({ path: '/', query: { view: to.params.id } })
        },
      },
      {
        path: 'edit/:id',
        name: 'employee-edit',
        // Triggers modal via query parameter
        beforeEnter: (to, from, next) => {
          // Convert route param to query for App.vue compatibility
          next({ path: '/', query: { update: to.params.id } })
        },
      },
    ],
  },
  {
    // 404 catch-all
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Set page title based on route
router.beforeEach((to, from, next) => {
  if (to.query.view) {
    document.title = `View Employee #${to.query.view} - Employee CRUD`
  } else if (to.query.update) {
    document.title = `Edit Employee #${to.query.update} - Employee CRUD`
  } else {
    document.title = 'Employee Management - CRUD'
  }
  next()
})

export default router
