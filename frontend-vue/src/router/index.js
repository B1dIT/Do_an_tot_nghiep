import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import CVAnalysisView from '../views/CVAnalysisView.vue'
import InterviewView from '../views/InterviewView.vue'
import JobSearchView from '../views/JobSearchView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, requiresAdmin: false },
      },
      {
        path: 'cv-analysis',
        name: 'cv-analysis',
        component: CVAnalysisView,
        meta: { requiresAuth: true, requiresAdmin: false },
      },
      {
        path: 'interview',
        name: 'interview',
        component: InterviewView,
        meta: { requiresAuth: true, requiresAdmin: false },
      },
      {
        path: 'jobs',
        name: 'jobs',
        component: JobSearchView,
        meta: { requiresAuth: true, requiresAdmin: false },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true, requiresAdmin: false },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = Boolean(
    window.localStorage.getItem('auth_token') || window.sessionStorage.getItem('auth_token')
  )
  const currentUserRole =
    window.localStorage.getItem('user_role') || window.sessionStorage.getItem('user_role') || 'user'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresAdmin && currentUserRole !== 'admin') {
    next({ name: 'dashboard' })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next({ name: currentUserRole === 'admin' ? 'admin' : 'dashboard' })
  } else {
    next()
  }
})

export default router
