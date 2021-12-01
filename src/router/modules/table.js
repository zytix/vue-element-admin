/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/table/complex-table',
  name: 'Gift Cards',
  meta: {
    title: 'Export Lightspeed',
    icon: 'table'
  },
  children: [
    {
      path: 'inline-edit-table',
      component: () => import('@/views/table/inline-edit-table'),
      name: 'InlineEditTable',
      meta: { title: 'Commandes courantes' }
    },
    {
      path: 'erreur',
      component: () => import('@/views/table/erreur'),
      name: 'ErreurTable',
      meta: { title: 'Erreur API' }
    },
    {
      path: 'erreur2',
      component: () => import('@/views/table/erreur2'),
      name: 'Erreur2Table',
      meta: { title: 'Erreur UPC' }
    },
    {
      path: 'processing',
      component: () => import('@/views/table/processing'),
      name: 'processingTable',
      meta: { title: 'En Traitement' }
    },
    {
      path: 'negatif',
      component: () => import('@/views/table/negatif'),
      name: 'NegativeTable',
      meta: { title: 'Négatif' }
    },
    {
      path: 'succes',
      component: () => import('@/views/table/succes'),
      name: 'SuccesTable',
      meta: { title: 'Succès' }
    }/* ,
    {
      path: 'complex-table',
      component: () => import('@/views/table/complex-table'),
      name: 'Gift Cards',
      meta: { title: 'Gift Cards' }
    }*/
  ]
}
export default tableRouter
